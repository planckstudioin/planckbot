/**
 * Threads API client for Meta's Threads platform (threads.net).
 * High-performance, lightweight client utilizing GraphQL and REST endpoints without browser automation.
 */

const { DEFAULT_CONFIG } = require('../lib/config');
const { shortcodeToId, idToShortcode, isNumeric } = require('../lib/utils');

class Threads {
    static BASE_GRAPHQL_URL = 'https://www.threads.net/api/graphql';
    static BASE_API_URL = 'https://www.threads.net/api/v1';

    /**
     * @param {object} [options]
     * @param {object} [options.headers] - Custom HTTP headers.
     * @param {object} [options.config] - Custom doc IDs or configurations.
     */
    constructor(options = {}) {
        const defaultCfg = DEFAULT_CONFIG.THREADS;

        this.headers = {
            'User-Agent': defaultCfg.USER_AGENT,
            'x-ig-app-id': defaultCfg.APP_ID,
            'x-fb-lsd': defaultCfg.LSD_TOKEN,
            'x-asbd-id': '129477',
            'x-requested-with': 'XMLHttpRequest',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'origin': 'https://www.threads.net',
            'authority': 'www.threads.net',
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'Cookie': defaultCfg.COOKIE,
            ...(options.headers || {})
        };

        this.docIds = {
            ...defaultCfg.DOC_IDS,
            ...(options.config?.docIds || {})
        };

        this._lsdToken = this.headers['x-fb-lsd'] || defaultCfg.LSD_TOKEN;
    }

    /**
     * Update client headers.
     * @param {object} headers
     */
    setHeaders(headers) {
        Object.assign(this.headers, headers);
        if (headers['x-fb-lsd']) {
            this._lsdToken = headers['x-fb-lsd'];
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
     * Extract numeric post ID from a post ID, shortcode, or URL.
     * Supports:
     * - '3140733529329971842'
     * - 'CuXkO1rN56A'
     * - 'https://www.threads.net/@user/post/CuXkO1rN56A'
     * - 'https://www.threads.net/t/CuXkO1rN56A'
     * @param {string} postIdentifier
     * @returns {string}
     */
    extractPostId(postIdentifier) {
        if (!postIdentifier) {
            throw new Error('Post identifier is required');
        }

        const str = String(postIdentifier).trim().replace(/\/+$/, '');

        if (isNumeric(str)) {
            return str;
        }

        if (str.includes('/post/')) {
            const shortcode = str.split('/post/')[1].split('?')[0].split('/')[0];
            return this.shortcodeToId(shortcode);
        }

        if (str.includes('/t/')) {
            const shortcode = str.split('/t/')[1].split('?')[0].split('/')[0];
            return this.shortcodeToId(shortcode);
        }

        // Treat as raw shortcode
        return this.shortcodeToId(str);
    }

    /**
     * Fetch fresh LSD CSRF token from Threads web page.
     * @param {boolean} [forceRefresh=false]
     * @returns {Promise<string>}
     */
    async getLsdToken(forceRefresh = false) {
        if (this._lsdToken && this._lsdToken !== DEFAULT_CONFIG.THREADS.LSD_TOKEN && !forceRefresh) {
            return this._lsdToken;
        }

        try {
            const res = await fetch('https://www.threads.net/', {
                headers: {
                    'User-Agent': this.headers['User-Agent'],
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            });

            if (res.ok) {
                const text = await res.text();
                const match = text.match(/["']LSD["'],\[\],\{["']token["']:["']([^"']+)["']\}/) ||
                              text.match(/["']token["']:["']([^"']+)["']/);
                if (match && match[1]) {
                    this._lsdToken = match[1];
                    this.headers['x-fb-lsd'] = this._lsdToken;
                    return this._lsdToken;
                }
            }
        } catch (_) {
            // Silently fallback to current LSD token
        }

        return this._lsdToken || DEFAULT_CONFIG.THREADS.LSD_TOKEN;
    }

    /**
     * Resolve numeric user ID from username.
     * @param {string} username
     * @returns {Promise<string|null>}
     */
    async getUserIdFromUsername(username) {
        const cleanUser = username.replace(/^@/, '').trim();

        try {
            const res = await fetch(`https://www.threads.net/@${cleanUser}`, {
                headers: {
                    'User-Agent': this.headers['User-Agent'],
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            });

            if (res.ok) {
                const text = await res.text();
                const match = text.match(/"user_id":"(\d+)"/) ||
                              text.match(/"props":\{[^}]*"user_id":"(\d+)"/) ||
                              text.match(/"pk":"(\d+)"/) ||
                              text.match(/"pk_id":"(\d+)"/);
                if (match && match[1]) {
                    return match[1];
                }
            }
        } catch (_) {
            // Fallback to IG web profile info
        }

        try {
            const igHeaders = { ...this.headers };
            igHeaders['x-ig-app-id'] = DEFAULT_CONFIG.INSTAGRAM.APP_ID;
            const igRes = await fetch(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${cleanUser}`, {
                headers: igHeaders
            });
            if (igRes.ok) {
                const data = await igRes.json();
                return data?.data?.user?.id || null;
            }
        } catch (_) {
            // Error handling
        }

        return null;
    }

    /**
     * Resolve user ID whether provided as numeric ID or username.
     * @param {string|number} identifier
     * @returns {Promise<string>}
     */
    async getUserId(identifier) {
        if (isNumeric(identifier)) {
            return String(identifier);
        }
        const resolved = await this.getUserIdFromUsername(String(identifier));
        if (!resolved) {
            throw new Error(`Could not resolve user ID for: ${identifier}`);
        }
        return resolved;
    }

    /**
     * Internal GraphQL query helper.
     * @private
     */
    async _graphqlQuery(docId, variables = {}) {
        const lsdToken = await this.getLsdToken();
        const headers = {
            ...this.headers,
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-fb-lsd': lsdToken,
            'origin': 'https://www.threads.net'
        };

        const params = new URLSearchParams();
        params.append('lsd', lsdToken);
        params.append('variables', JSON.stringify(variables));
        params.append('doc_id', String(docId));

        const res = await fetch(Threads.BASE_GRAPHQL_URL, {
            method: 'POST',
            headers,
            body: params.toString()
        });

        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch (_) {
            return {
                error: 'Invalid JSON response from Threads API',
                status: res.status,
                raw: text.slice(0, 500)
            };
        }
    }

    /**
     * Internal REST request helper.
     * @private
     */
    async _request(url, method = 'GET', body = null) {
        const headers = { ...this.headers };
        const options = { method, headers };

        if (body) {
            if (typeof body === 'object') {
                headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(body);
            } else {
                options.body = body;
            }
        }

        const res = await fetch(url, options);
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch (_) {
            return { error: 'Invalid JSON response', status: res.status, raw: text.slice(0, 500) };
        }
    }

    /**
     * Fetch user profile.
     * @param {string|number} userIdentifier
     */
    async getProfile(userIdentifier) {
        const userId = await this.getUserId(userIdentifier);
        return this._graphqlQuery(this.docIds.PROFILE, { userID: userId });
    }

    /**
     * Fetch user threads (posts).
     * @param {string|number} userIdentifier
     * @param {string} [cursor]
     */
    async getUserThreads(userIdentifier, cursor = null) {
        const userId = await this.getUserId(userIdentifier);
        const variables = { userID: userId };
        if (cursor) variables.cursor = cursor;
        return this._graphqlQuery(this.docIds.USER_POSTS, variables);
    }

    /**
     * Fetch user replies.
     * @param {string|number} userIdentifier
     * @param {string} [cursor]
     */
    async getUserReplies(userIdentifier, cursor = null) {
        const userId = await this.getUserId(userIdentifier);
        const variables = { userID: userId };
        if (cursor) variables.cursor = cursor;
        return this._graphqlQuery(this.docIds.USER_REPLIES, variables);
    }

    /**
     * Fetch a specific thread (post and its replies).
     * @param {string} postIdentifier - Post ID, shortcode, or URL.
     */
    async getThread(postIdentifier) {
        const postId = this.extractPostId(postIdentifier);
        return this._graphqlQuery(this.docIds.POST, { postID: postId });
    }

    /**
     * Fetch list of users who liked a post.
     * @param {string} postIdentifier
     */
    async getThreadLikers(postIdentifier) {
        const postId = this.extractPostId(postIdentifier);
        return this._graphqlQuery(this.docIds.POST_LIKES, { postID: postId });
    }

    /**
     * Fetch home timeline content.
     */
    async getTimeline() {
        return this._graphqlQuery(this.docIds.TIMELINE, {});
    }

    /**
     * Follow a user on Threads.
     * @param {string|number} userIdentifier
     */
    async follow(userIdentifier) {
        const userId = await this.getUserId(userIdentifier);
        return this._request(`${Threads.BASE_API_URL}/friendships/create/${userId}/`, 'POST');
    }

    /**
     * Unfollow a user on Threads.
     * @param {string|number} userIdentifier
     */
    async unfollow(userIdentifier) {
        const userId = await this.getUserId(userIdentifier);
        return this._request(`${Threads.BASE_API_URL}/friendships/destroy/${userId}/`, 'POST');
    }

    /**
     * Extract media URLs (images and videos) from a post dictionary or post identifier.
     * @param {object|string} postOrIdentifier
     * @returns {Promise<string[]>}
     */
    async getMediaOnly(postOrIdentifier) {
        let postData;
        if (typeof postOrIdentifier === 'string') {
            postData = await this.getThread(postOrIdentifier);
        } else {
            postData = postOrIdentifier;
        }

        const mediaUrls = [];
        const extractFromNode = (item) => {
            if (!item || typeof item !== 'object') return;

            // Direct video
            if (item.video_versions && item.video_versions.length > 0) {
                const vid = item.video_versions[0].url;
                if (vid && !mediaUrls.includes(vid)) mediaUrls.push(vid);
            }

            // Direct image
            if (item.image_versions2?.candidates && item.image_versions2.candidates.length > 0) {
                const img = item.image_versions2.candidates[0].url;
                if (img && !mediaUrls.includes(img)) mediaUrls.push(img);
            }

            // Carousel
            if (Array.isArray(item.carousel_media)) {
                for (const c of item.carousel_media) {
                    extractFromNode(c);
                }
            }
        };

        if (postData?.data?.data?.containing_thread?.thread_items) {
            for (const item of postData.data.data.containing_thread.thread_items) {
                if (item.post) extractFromNode(item.post);
            }
        } else if (postData?.items) {
            for (const item of postData.items) extractFromNode(item);
        } else {
            extractFromNode(postData);
        }

        return mediaUrls;
    }
}

module.exports = Threads;
