const test = require('node:test');
const assert = require('node:assert/strict');
const Threads = require('../services/threads');

test('Threads client extracts post IDs from multiple identifier formats', () => {
    const client = new Threads();
    const shortcode = 'CuXkO1rN56A';
    const expectedId = client.shortcodeToId(shortcode);

    // Raw numeric ID
    assert.strictEqual(client.extractPostId(expectedId), expectedId);

    // Raw shortcode
    assert.strictEqual(client.extractPostId(shortcode), expectedId);

    // Threads post URL
    const urlPost = `https://www.threads.net/@zuck/post/${shortcode}?hl=en`;
    assert.strictEqual(client.extractPostId(urlPost), expectedId);

    // Short share URL /t/
    const urlShort = `https://www.threads.net/t/${shortcode}/`;
    assert.strictEqual(client.extractPostId(urlShort), expectedId);
});

test('Threads client initializes with hardened default headers and doc IDs', () => {
    const client = new Threads();
    assert.strictEqual(client.headers['x-ig-app-id'], '238260118697367');
    assert.strictEqual(client.headers['origin'], 'https://www.threads.net');
    assert.strictEqual(client.docIds.USER_POSTS, '6232751443445612');
    assert.strictEqual(client.docIds.POST, '5587632691339264');
});
