/**
 * Instagram API and Scraping Client for PlanckBot.
 * Eliminates browser automation in favor of high-performance, hardened REST and GraphQL endpoints.
 */

const path = require('path');
const fs = require('fs');
const { DEFAULT_CONFIG } = require('../lib/config');
const { shortcodeToId, idToShortcode, sanitizeIdentifier, isNumeric } = require('../lib/utils');
const Threads = require('./threads');

class Instagram {
    /**
     * @param {object} [options]
     * @param {object} [options.headers] - Custom HTTP headers.
     * @param {object} [options.config] - Custom doc IDs or configurations.
     */
    constructor(options = {}) {
        const defaultCfg = DEFAULT_CONFIG.INSTAGRAM;

        this.headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': defaultCfg.USER_AGENT,
            'x-csrftoken': defaultCfg.CSRF_TOKEN,
            'x-ig-app-id': defaultCfg.APP_ID,
            'x-ig-www-claim': defaultCfg.CLAIM,
            'Cookie': defaultCfg.COOKIE,
            'x-instagram-ajax': defaultCfg.AJAX,
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'x-asbd-id': '198387',
            ...(options.headers || {})
        };

        this.config = {
            ...defaultCfg.DOC_IDS,
            ...(options.config || {})
        };

        this._threadsClient = null;
    }

    /**
     * Lazy-loaded Threads client sharing configuration and credentials.
     * @returns {Threads}
     */
    get threads() {
        if (!this._threadsClient) {
            this._threadsClient = new Threads({
                headers: this.headers,
                config: { docIds: this.config }
            });
        }
        return this._threadsClient;
    }

    /**
     * Update client headers.
     * @param {object} headers
     */
    setHeaders(headers) {
        Object.assign(this.headers, headers);
        if (this._threadsClient) {
            this._threadsClient.setHeaders(headers);
        }
    }

    /**
     * Shortcode to ID conversion.
     * @param {string} shortcode
     * @returns {string}
     */
    shortcodeToId(shortcode) {
        return shortcodeToId(shortcode);
    }

    /**
     * ID to shortcode conversion.
     * @param {string|number} id
     * @returns {string}
     */
    idToShortcode(id) {
        return idToShortcode(id);
    }

    /**
     * Internal HTTP request helper.
     * @private
     */
    async _request(url, method = 'GET', body = null, isForm = false) {
        const headers = { ...this.headers };
        const options = { method: method.toUpperCase(), headers };

        if (body) {
            if (typeof body === 'object' && !isForm) {
                headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(body);
            } else if (isForm && typeof body === 'object') {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                const params = new URLSearchParams();
                for (const [key, val] of Object.entries(body)) {
                    params.append(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
                }
                options.body = params.toString();
            } else {
                options.body = body;
            }
        }

        try {
            const res = await fetch(url, options);
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch (_) {
                return {
                    error: 'Non-JSON response received',
                    statusCode: res.status,
                    raw: text.slice(0, 500)
                };
            }
        } catch (err) {
            return { error: err.message };
        }
    }

    /**
     * Fetch user profile via web_profile_info.
     * @param {string} username
     */
    async getProfile(username) {
        const cleanUser = username.replace(/^@/, '').trim();
        const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(cleanUser)}`;
        return this._request(url, 'GET');
    }

    /**
     * Alias for backward compatibility.
     * @param {string} username
     */
    async getUserInfo(username) {
        const res = await this.getProfile(username);
        return res?.data?.user || res;
    }

    /**
     * Fetch user feed timeline with GraphQL doc_id.
     * @param {string} username
     * @param {string} [nextCursor=null]
     * @param {number} [count=12]
     */
    async getUserFeedTimeline(username, nextCursor = null, count = 12) {
        const docId = this.config.TIMELINE || '30714410208142251';
        const cleanUser = username.replace(/^@/, '').trim();

        const variables = {
            after: nextCursor,
            before: null,
            data: {
                count,
                include_reel_media_seen_timestamp: true,
                include_relationship_info: true,
                latest_besties_reel_media: true,
                latest_reel_media: true
            },
            first: count,
            last: null,
            username: cleanUser,
            __relay_internal__pv__PolarisIsLoggedInrelayprovider: true,
            __relay_internal__pv__PolarisShareSheetV3relayprovider: true
        };

        const payload = {
            variables: JSON.stringify(variables),
            server_timestamps: 'true',
            doc_id: docId
        };

        return this._request('https://www.instagram.com/graphql/query', 'POST', payload, true);
    }

    /**
     * Fetch user media by GraphQL query.
     * @param {string} username
     * @param {string} [nextCursor=null]
     * @param {number} [count=12]
     */
    async getUserMediaByQuery(username, nextCursor = null, count = 12) {
        const docId = this.config.USER_MEDIA || '10064872980277354';
        const cleanUser = username.replace(/^@/, '').trim();

        const variables = {
            after: nextCursor,
            before: null,
            data: {
                count,
                include_reel_media_seen_timestamp: true,
                include_relationship_info: true,
                latest_besties_reel_media: true,
                latest_reel_media: true
            },
            first: count,
            last: null,
            username: cleanUser,
            __relay_internal__pv__PolarisIsLoggedInrelayprovider: true,
            __relay_internal__pv__PolarisShareSheetV3relayprovider: true
        };

        const encodedVars = encodeURIComponent(JSON.stringify(variables));
        const url = `https://www.instagram.com/graphql/query/?variables=${encodedVars}&doc_id=${docId}`;
        return this._request(url, 'POST');
    }

    /**
     * Fetch media details by shortcode or numeric media ID.
     * @param {string} shortcode
     */
    async getMedia(shortcode) {
        let mediaId = shortcode;
        if (!isNumeric(shortcode)) {
            // Check if it's a stories URL or standard shortcode
            if (shortcode.includes('/stories/')) {
                const parts = shortcode.split('/');
                if (parts.length > 5) {
                    mediaId = parts[5];
                }
            } else if (shortcode.includes('/p/') || shortcode.includes('/reel/')) {
                const match = shortcode.match(/\/(p|reel)\/([^/?]+)/);
                if (match) {
                    mediaId = this.shortcodeToId(match[2]);
                }
            } else {
                mediaId = this.shortcodeToId(shortcode);
            }
        }

        const url = `https://www.instagram.com/api/v1/media/${mediaId}/info/`;
        return this._request(url, 'GET');
    }

    /**
     * Extract only direct media URLs (.jpg or .mp4) for a post.
     * @param {string} shortcode
     * @returns {Promise<string[]>}
     */
    async getMediaOnly(shortcode) {
        const result = await this.getMedia(shortcode);
        const mediaUrls = [];

        if (result && Array.isArray(result.items)) {
            for (const media of result.items) {
                const mediaType = media.media_type;

                // 1: Photo
                if (mediaType === 1 && media.image_versions2?.candidates?.length > 0) {
                    mediaUrls.push(media.image_versions2.candidates[0].url);
                }
                // 2: Video
                else if (mediaType === 2 && media.video_versions?.length > 0) {
                    mediaUrls.push(media.video_versions[0].url);
                }
                // 8: Carousel album
                else if (mediaType === 8 && Array.isArray(media.carousel_media)) {
                    for (const item of media.carousel_media) {
                        if (item.media_type === 1 && item.image_versions2?.candidates?.length > 0) {
                            mediaUrls.push(item.image_versions2.candidates[0].url);
                        } else if (item.media_type === 2 && item.video_versions?.length > 0) {
                            mediaUrls.push(item.video_versions[0].url);
                        }
                    }
                }
            }
        }

        return mediaUrls;
    }

    /**
     * Follow a user by username.
     * @param {string} username
     */
    async follow(username) {
        const profile = await this.getProfile(username);
        const userId = profile?.data?.user?.id;
        if (!userId) {
            return { error: 'Could not retrieve user id from profile' };
        }
        const url = `https://www.instagram.com/api/v1/web/friendships/${userId}/follow/`;
        return this._request(url, 'POST');
    }

    /**
     * Unfollow a user by username.
     * @param {string} username
     */
    async unfollow(username) {
        const profile = await this.getProfile(username);
        const userId = profile?.data?.user?.id;
        if (!userId) {
            return { error: 'Could not retrieve user id from profile' };
        }
        const url = `https://www.instagram.com/api/v1/web/friendships/${userId}/unfollow/`;
        return this._request(url, 'POST');
    }

    /**
     * Get user followers.
     * @param {string} username
     * @param {string} [nextCursor='']
     * @param {number} [count=20]
     */
    async getFollowers(username, nextCursor = '', count = 20) {
        const profile = await this.getProfile(username);
        const userId = profile?.data?.user?.id;
        if (!userId) {
            return { error: 'Could not retrieve user id from profile' };
        }
        const url = `https://i.instagram.com/api/v1/friendships/${userId}/followers/?count=${count}&max_id=${nextCursor}&search_surface=follow_list_page`;
        return this._request(url, 'GET');
    }

    /**
     * Get user followings.
     * @param {string} username
     * @param {string} [nextCursor='']
     * @param {number} [count=20]
     */
    async getFollowings(username, nextCursor = '', count = 20) {
        const profile = await this.getProfile(username);
        const userId = profile?.data?.user?.id;
        if (!userId) {
            return { error: 'Could not retrieve user id from profile' };
        }
        const url = `https://i.instagram.com/api/v1/friendships/${userId}/following/?count=${count}&max_id=${nextCursor}`;
        return this._request(url, 'GET');
    }

    /**
     * Path-safe session saving preventing directory traversal attacks.
     * @param {string} username
     * @param {object} sessionData
     * @param {string} [baseDir='./sessions']
     */
    saveSession(username, sessionData, baseDir = './sessions') {
        const safeUser = sanitizeIdentifier(username);
        const resolvedDir = path.resolve(baseDir);
        if (!fs.existsSync(resolvedDir)) {
            fs.mkdirSync(resolvedDir, { recursive: true });
        }
        const filePath = path.join(resolvedDir, `${safeUser}.json`);
        fs.writeFileSync(filePath, JSON.stringify(sessionData, null, 2), { encoding: 'utf8', mode: 0o600 });
        return filePath;
    }

    /**
     * Path-safe session loading.
     * @param {string} username
     * @param {string} [baseDir='./sessions']
     * @returns {object|null}
     */
    loadSession(username, baseDir = './sessions') {
        const safeUser = sanitizeIdentifier(username);
        const filePath = path.join(path.resolve(baseDir), `${safeUser}.json`);
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(raw);
        }
        return null;
    }
}

module.exports = Instagram;