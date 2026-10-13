# PlanckBot

> Lightweight, hardened Instagram and Threads scraping and automation client library for Node.js.

## Highlights
- **Zero Browser Dependencies**: Completely eliminated Selenium and Chromedriver in favor of fast, reliable GraphQL (`doc_id`) and REST endpoints.
- **Full Meta Threads Support**: Built-in client for `threads.net` with LSD token retrieval, post resolution, replies, and likers.
- **Security Hardened**: 0 known vulnerabilities (`npm audit`), path-traversal-safe session storage, sanitized identifiers, and `.env` configuration support.
- **Non-blocking & Async**: Native asynchronous I/O and Promise-based APIs.

---

## Installation

```bash
npm install planckbot
```

*Requires Node.js 18.0.0 or higher (utilizes native `fetch`).*

---

## Configuration

Copy `.env.example` to `.env` to configure default credentials and doc IDs:

```bash
cp .env.example .env
```

```env
# Optional environment variables
USER_AGENT='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ...'
IG_COOKIE="sessionid=your_cookie_here;"
THREADS_COOKIE="sessionid=your_cookie_here;"
```

---

## Usage

### 1. Instagram Client

```javascript
const { Instagram } = require('planckbot');

const ig = new Instagram({
  headers: {
    'Cookie': 'sessionid=YOUR_SESSION_ID;'
  }
});

// Fetch user profile info
const profile = await ig.getProfile('zuck');

// Fetch user feed timeline with GraphQL
const timeline = await ig.getUserFeedTimeline('zuck', null, 12);

// Fetch user media posts
const media = await ig.getUserMediaByQuery('zuck', null, 12);

// Extract direct media download URLs (images & videos)
const urls = await ig.getMediaOnly('CuXkO1rN56A');
console.log(urls);

// Access Threads client sharing configuration
const threadsFromIg = ig.threads;
```

### 2. Threads Client

```javascript
const { Threads } = require('planckbot');

const threads = new Threads({
  headers: {
    'Cookie': 'sessionid=YOUR_SESSION_ID;'
  }
});

// Extract numeric post ID from shortcode or URL
const postId = threads.extractPostId('https://www.threads.net/@zuck/post/CuXkO1rN56A');

// Fetch thread details & replies
const post = await threads.getThread(postId);

// Fetch user threads (posts)
const userPosts = await threads.getUserThreads('zuck');

// Fetch user replies
const userReplies = await threads.getUserReplies('zuck');

// Extract media URLs (.jpg and .mp4) from a thread
const mediaUrls = await threads.getMediaOnly('CuXkO1rN56A');

// Follow or Unfollow
await threads.follow('zuck');
await threads.unfollow('zuck');
```

### 3. Utility Functions

```javascript
const { shortcodeToId, idToShortcode, sanitizeIdentifier } = require('planckbot/lib/utils');

// Convert shortcode to 64-bit ID
const id = shortcodeToId('CuXkO1rN56A'); // '3140733529329971842'

// Convert back to shortcode
const code = idToShortcode(id); // 'CuXkO1rN56A'

// Sanitize filename to prevent directory traversal
const safe = sanitizeIdentifier('../../evil_user'); // '______evil_user'
```

---

## Testing & Security Audit

Run automated test suite:

```bash
npm test
```

Run vulnerability audit:

```bash
npm audit
```

---

## License

ISC
