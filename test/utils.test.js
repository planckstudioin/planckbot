const test = require('node:test');
const assert = require('node:assert/strict');
const { shortcodeToId, idToShortcode, sanitizeIdentifier, isNumeric, sleep } = require('../lib/utils');

test('Shortcode conversion matches expected values', () => {
    const shortcode = 'CuXkO1rN56A';
    const numericId = shortcodeToId(shortcode);
    assert.ok(typeof numericId === 'string');
    assert.ok(numericId.length > 0);

    const convertedBack = idToShortcode(numericId);
    assert.strictEqual(convertedBack, shortcode, 'Shortcode round-trip conversion should match');
});

test('sanitizeIdentifier strips path traversal sequences', () => {
    assert.strictEqual(sanitizeIdentifier('../../etc/passwd'), '______etc_passwd');
    assert.strictEqual(sanitizeIdentifier('..\\windows\\system32'), '___windows_system32');
    assert.strictEqual(sanitizeIdentifier('normal_user-123'), 'normal_user-123');
    assert.strictEqual(sanitizeIdentifier(null), 'unknown');
});

test('isNumeric correctly validates numbers and numeric strings', () => {
    assert.strictEqual(isNumeric('123456789'), true);
    assert.strictEqual(isNumeric(123456789), true);
    assert.strictEqual(isNumeric('-123'), true);
    assert.strictEqual(isNumeric('abc123'), false);
    assert.strictEqual(isNumeric(''), false);
    assert.strictEqual(isNumeric(null), false);
});

test('sleep resolves asynchronously without blocking event loop', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    assert.ok(elapsed >= 40, `Elapsed time should be at least 40ms, got ${elapsed}ms`);
});
