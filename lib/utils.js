/**
 * Core utility functions for PlanckBot.
 */

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/**
 * Non-blocking asynchronous delay.
 * @param {number} ms - Milliseconds to sleep.
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Convert a base-64 Instagram/Threads shortcode into a 64-bit numeric string ID.
 * @param {string} shortcode
 * @returns {string} numeric ID as string
 */
function shortcodeToId(shortcode) {
    if (!shortcode || typeof shortcode !== 'string') {
        throw new TypeError('Shortcode must be a non-empty string');
    }
    let idValue = 0n;
    for (let i = 0; i < shortcode.length; i++) {
        const char = shortcode[i];
        const index = BASE64_ALPHABET.indexOf(char);
        if (index === -1) {
            throw new Error(`Invalid character '${char}' in shortcode`);
        }
        idValue = (idValue * 64n) + BigInt(index);
    }
    return idValue.toString();
}

/**
 * Convert a numeric ID into a base-64 shortcode.
 * @param {string|number|bigint} idValue
 * @returns {string} base-64 shortcode
 */
function idToShortcode(idValue) {
    let id = BigInt(idValue);
    if (id <= 0n) return '';
    let shortcode = '';
    while (id > 0n) {
        const remainder = Number(id % 64n);
        shortcode = BASE64_ALPHABET[remainder] + shortcode;
        id = id / 64n;
    }
    return shortcode;
}

/**
 * Sanitize a username or string for safe filename usage, preventing path traversal.
 * @param {string} input
 * @returns {string}
 */
function sanitizeIdentifier(input) {
    if (!input || typeof input !== 'string') return 'unknown';
    return input.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Check if a value consists purely of digits.
 * @param {any} value
 * @returns {boolean}
 */
function isNumeric(value) {
    return typeof value === 'number' || (typeof value === 'string' && /^-?\d+$/.test(value.trim()));
}

module.exports = {
    sleep,
    shortcodeToId,
    idToShortcode,
    sanitizeIdentifier,
    isNumeric
};
