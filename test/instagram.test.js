const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const Instagram = require('../services/instagram');
const Threads = require('../services/threads');

test('Instagram client exposes lazy Threads client with shared headers', () => {
    const ig = new Instagram({
        headers: {
            'Cookie': 'sessionid=test_cookie_123;'
        }
    });

    assert.ok(ig.threads instanceof Threads);
    assert.strictEqual(ig.threads.headers['Cookie'], 'sessionid=test_cookie_123;');
});

test('Instagram client saves and loads sessions securely without path traversal', () => {
    const ig = new Instagram();
    const testDir = path.join(__dirname, 'tmp_sessions');

    const usernameWithTraversal = '../../malicious_user';
    const sessionData = { mid: 'test_mid', time: '12345678' };

    const savedPath = ig.saveSession(usernameWithTraversal, sessionData, testDir);

    // Verify filename was sanitized
    assert.ok(savedPath.endsWith('______malicious_user.json'));
    assert.ok(fs.existsSync(savedPath));

    const loaded = ig.loadSession(usernameWithTraversal, testDir);
    assert.deepStrictEqual(loaded, sessionData);

    // Clean up
    fs.rmSync(testDir, { recursive: true, force: true });
});
