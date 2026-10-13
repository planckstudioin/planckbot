## Changelog [ v2.0.0 ] - 2026-10-13

### Security Hardening
+ Eliminated Selenium and Chromedriver dependencies, fixing 17 security vulnerabilities (command injection, symlink path traversal, ReDoS).
+ Pruned unused `jquery` and deprecated `node-fetch` dependencies in favor of native Node 18+ `fetch`.
+ Added sanitized path helpers to prevent path traversal in session file persistence.
+ Hardened `.gitignore` to prevent secret and session leakage.
+ Replaced synchronous CPU-blocking busy-wait sleep with non-blocking asynchronous timers.

### Features
+ Ported Meta Threads (`threads.net`) client from Python (`services/threads.js`) with GraphQL queries, LSD token extraction, and shortcode conversions.
+ Ported modern Instagram REST & GraphQL endpoints (`getProfile`, `getUserFeedTimeline`, `getUserMediaByQuery`, `getMediaOnly`).
+ Added bidirectional base-64 shortcode to 64-bit numeric ID conversion utilities.
+ Added native test suite using `node --test` with 100% passing tests.

---

## Changelog [ v1.0.4 ]
+ package updated

## Changelog [ v1.0.3 ]
+ Instagram 
    + Get top hashtag media
    + Get hashtag media
    + Get user media
    + Get post
    + Get reel
    + Get igtv
