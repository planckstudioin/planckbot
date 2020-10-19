# PlanckBot

## Version 1.0.2

## Usage

```js
// Import
const bot = require('planckbot');
```

## Modules

### Instagram

```js

/**
 * Common parameters
 * @param  {boolean} headless=true
 * @param  {string} username
 * @param  {number} userid
 * @param  {object} cookie
 * @param  {string} password
 * @param  {string} path='./'
 * @param  {string} post
 * @param  {string} comment
 * @param {string} message
 */

const ig = new bot.Instagram(headless)

ig.forceLogin(username, password);

// Login and save user session
ig.normalLogin(username, password, path);

// Use previous session to login
ig.sessionLogin(username);

// Auto login with session or force login
ig.login(username, password, path);

ig.blockUser(username);

ig.unblockUser(username);

ig.followUser(username);

ig.unfollowUser(username);

ig.comment(post, comment);

ig.sendMessage(username, message);

ig.getUserInfo(username);

ig.getUserFollowers(userid, cookie);

ig.getUserFollowings(userid, cookie);

```

## Support

Email us:  [support@planckstudio.in](mailto:support@planckstudio.in)

### Social media

Instagram: [@planck_bot](https://instagram.com/planck_bot) [@planckstudio](https://instagram.com/planckstudio) [@planckcode](https://instagram.com/planckcode) [@plancksupport](https://instagram.com/plancksupport)

Twitter: [@planckstudio](https://twitter.com/planckstudio)

Facebook: [@planckstudio](https://facebook.com/planckstudio)

Linkedin: [Planck Studio](https://in.linkedin.com/company/planckstudio)

### Quicklinks

Product website: [https://product.planckstudio.in/bot](https://product.planckstudio.in/bot?medium=github)

Company website: [https://planckstudio.in](https://product.planckstudio.in?medium=github)

Blog: [https://blog.planckstudio.in](https://blog.planckstudio.in?medium=github)