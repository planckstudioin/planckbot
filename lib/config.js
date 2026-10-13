/**
 * Centralized Configuration Loader for PlanckBot.
 * Implements secrets and config management standards with safe defaults.
 */

try {
    require('dotenv').config();
} catch (_) {
    // dotenv is optional if env vars are passed directly
}

const DEFAULT_USER_AGENT = process.env.USER_AGENT || 
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const DEFAULT_CONFIG = {
    // Instagram Defaults
    INSTAGRAM: {
        APP_ID: process.env.IG_APPID || '936619743392459',
        USER_AGENT: DEFAULT_USER_AGENT,
        COOKIE: process.env.IG_COOKIE || '',
        CSRF_TOKEN: process.env.IG_CSRF || '',
        CLAIM: process.env.IG_CLAIM || '',
        AJAX: process.env.IG_AJAX || '1006801581',
        DOC_IDS: {
            TIMELINE: process.env.IG_TIMELINE_DOC_ID || '30714410208142251',
            USER_MEDIA: process.env.IG_USER_MEDIA_DOC_ID || '10064872980277354',
            FOLLOWING: process.env.IG_FOLLOWING || '17874545323001329',
            FOLLOWERS: process.env.IG_FOLLOWERS || '17851374694183129',
            POSTS_USER: process.env.IG_POSTS_USER || '17888483320059182',
            POSTS_LIKES: process.env.IG_POSTS_LIKES || '17864450716183058',
            POSTS_COMMENTS: process.env.IG_POSTS_COMMENTS || '17852405266163336',
            POSTS_TAG: process.env.IG_POSTS_TAG || '17875800862117404',
            POSTS_FEED: process.env.IG_POSTS_FEED || '17842794232208280'
        }
    },
    // Threads Defaults
    THREADS: {
        APP_ID: process.env.THREADS_APPID || '238260118697367',
        LSD_TOKEN: process.env.THREADS_LSD || 'NjppQDEgONsU_1LCzrmp6q',
        COOKIE: process.env.THREADS_COOKIE || process.env.IG_COOKIE || '',
        USER_AGENT: DEFAULT_USER_AGENT,
        DOC_IDS: {
            USER_POSTS: process.env.THREADS_USER_POSTS || '6232751443445612',
            USER_REPLIES: process.env.THREADS_USER_REPLIES || '6307072669391286',
            POST: process.env.THREADS_POST || '5587632691339264',
            POST_LIKES: process.env.THREADS_POST_LIKES || '9360915773983802',
            PROFILE: process.env.THREADS_PROFILE || '23996318473300828',
            TIMELINE: process.env.THREADS_TIMELINE || '27777619381929822'
        }
    }
};

module.exports = {
    DEFAULT_CONFIG,
    DEFAULT_USER_AGENT
};
