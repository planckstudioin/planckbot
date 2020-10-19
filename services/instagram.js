const Browser = require('./browser.js');
const Path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

class Instagram {

    followings = [];
    followers = [];

    /**
     * @param  {boolean} headless=true
     */
    constructor(headless = true) {
        this.driver = new Browser(headless);
    }

    /**
     * @param  {string} username
     * @param  {string} password
     */
    async forceLogin(username, password) {
        let url = 'https://www.instagram.com/accounts/login/';
        await this.driver.openUrl(url);
        let inputs = 'form input';
        var element = await this.driver.getElements('css', inputs);

        await this.driver.type(element[0], username);
        await this.driver.type(element[1], password + '\n').then(async function () {
            console.log('Login success');
        });
    }

    /**
     * @param  {string} username
     * @param  {string} path='./'
     */
    async sessionLogin(username, path = './') {
        let sessionFile = this.getInstagramSession(username, path);
        await this.driver.openUrl("https://www.instagram.com/" + sessionFile.username);

        await this.driver.removeCookie('mid');
        await this.driver.removeCookie('sessionid');
        await this.driver.removeCookie('ig_did');
        await this.driver.removeCookie('csrftoken');

        await this.driver.setCookie({ name: 'ig_did', value: sessionFile.ig_did, 'sameSite': 'Strict' });
        await this.driver.setCookie({ name: 'sessionid', value: sessionFile.sessionid, 'sameSite': 'Strict' });
        await this.driver.setCookie({ name: 'ds_user_id', value: sessionFile.ds_user_id, 'sameSite': 'Strict' });
        await this.driver.setCookie({ name: 'mid', value: sessionFile.mid, 'sameSite': 'Strict' });
        await this.driver.setCookie({ name: 'csrftoken', value: sessionFile.csrftoken, 'sameSite': 'Strict' });

        this.driver.sleep(6);
        await this.driver.openUrl("https://www.instagram.com/");
    }

    /**
     * @param  {string} username
     * @param  {string} password
     * @param  {string} path
     */
    async normalLogin(username, password, path) {
        let url = 'https://www.instagram.com/accounts/login/';
        await this.driver.openUrl(url);
        let inputs = 'form input';
        var element = await this.driver.getElements('css', inputs);

        await this.driver.type(element[0], username);
        await this.driver.type(element[1], password + '\n');

        console.log('Login success');
        this.driver.sleep(6);
        await this.driver.openUrl("https://www.instagram.com/" + username + "/");

        let cookies = await this.driver.getCookies();
        this.saveInstagramSession(username, cookies, path);
    }

    /**
     * @return  {object} session
     */
    async userLogin() {
        let url = 'https://www.instagram.com/accounts/login/';

        this.driver.openUrl(url);

        await this.driver.waitUntilTitle('Instagram');
        let cookie = await this.driver.getCookies();

        let time = Math.round(+new Date() / 1000).toString();

        let userSession = {
            type: "instagram",
            mid: this.driver.getCookieValue(cookie, 'mid'),
            ig_did: this.driver.getCookieValue(cookie, 'ig_did'),
            csrftoken: this.driver.getCookieValue(cookie, 'csrftoken'),
            sessionid: this.driver.getCookieValue(cookie, 'sessionid'),
            ds_user_id: this.driver.getCookieValue(cookie, 'ds_user_id'),
            time: time,
            status: true
        };

        return userSession;
    }

    /**
     * @param  {string} username
     * @param  {string} password
     * @param  {string} path='./'
     */
    async login(username, password, path = './') {

        let isSessionSaved = this.checkInstagramSession(username, path);

        if (isSessionSaved) {
            await this.sessionLogin(username, path);
        } else {
            await this.normalLogin(username, password, path);
        }
    }

    async closeNotificationDialog() {
        this.driver.sleep(6);
        let ele = await this.driver.getElement("css", "button.aOOlW.HoLwm");
        ele.click();
    }

    /**
     * @param  {string} username
     * @param  {object} cookie
     * @param  {string} path='./'
     */
    saveInstagramSession(username, cookie, path = './') {

        let time = Math.round(+new Date() / 1000).toString();

        let userSession = {
            username: username,
            mid: this.driver.getCookieValue(cookie, 'mid'),
            ig_did: this.driver.getCookieValue(cookie, 'ig_did'),
            csrftoken: this.driver.getCookieValue(cookie, 'csrftoken'),
            sessionid: this.driver.getCookieValue(cookie, 'sessionid'),
            ds_user_id: this.driver.getCookieValue(cookie, 'ds_user_id'),
            time: time,
            status: true
        }

        let data = JSON.stringify(userSession);
        let sessionPath = path + username + '.json';
        fs.writeFileSync(sessionPath, data);
    }

    /**
     * @param  {string} username
     * @param  {string} path
     */
    checkInstagramSession(username, path) {

        let filepath = path + username + '.json';

        try {
            if (fs.existsSync(filepath)) {
                return true;
            }
        } catch (err) {
            console.error(err)
        }
    }

    /**
     * @param  {string} username
     * @param  {string} path
     * @return {object}
     */
    getInstagramSession(username, path) {
        let filepath = path + username + '.json';
        let rawdata = fs.readFileSync(filepath);
        return JSON.parse(rawdata);
    }

    /**
     * @param  {string} username
     */
    async blockUser(username) {
        await this.driver.openUrl('https://www.instagram.com/' + username + '/');
        this.driver.sleep(3);
        let btn1 = await this.driver.getElement("css", ".AFWDX>button");
        btn1.click();
        let btn2 = await this.driver.getElements("css", "button.aOOlW.-Cab_");
        btn2[0].click();
        let btn3 = await this.driver.getElements("css", "button.aOOlW.bIiDR");
        btn3[0].click();
    }

    /**
     * @param  {string} username
     */
    async unblockUser(username) {
        await this.driver.openUrl('https://www.instagram.com/' + username + '/');
        this.driver.sleep(3);
        let btn1 = await this.driver.getElement("css", "span.vBF20._1OSdk>button");
        btn1.click();
        let btn2 = await this.driver.getElements("css", "div.mt3GC>button");
        btn2[0].click();
    }

    async followUser(username) {
        await this.driver.openUrl('https://www.instagram.com/' + username + '/');
        this.driver.sleep(3);
        let btn = await this.driver.getElements("css", "button");
        if (btn[1].getText != 'Requested') {
            btn[1].click();
            console.log('User followed/requested');
        }
    }

    async unfollowUser(username) {
        await this.driver.openUrl('https://www.instagram.com/' + username + '/');
        this.driver.sleep(3);
        let btn = await this.driver.getElements("css", "button");
        btn[1].click();
        let unfollowBtn = await this.driver.getElement("css", ".-Cab_");
        unfollowBtn.click();
        console.log('User unfollowed');
    }

    async comment(post, comment) {
        await this.driver.openUrl(post);
        let btn = await this.driver.getElements("css", ".wpO6b");
        btn[2].click();
        let textArea = await this.driver.getElement("css", ".X7cDz textarea");
        await this.driver.type(textArea, comment);
        let enterBtn = await this.driver.getElement("css", ".X7cDz button");
        enterBtn.click()
    }

    async sendMessage(username, msg) {
        await this.driver.openUrl('https://www.instagram.com/direct/new/');
        await this.closeNotificationDialog();
        let input = await this.driver.getElements("css", "input");
        await this.driver.type(input[1], username);
        this.driver.sleep(3);
        let selectBtn = await this.driver.getElement("css", "button.dCJp8");
        selectBtn.click();
        this.driver.sleep(3);
        let nextBtn = await this.driver.getElement("css", ".rIacr");
        nextBtn.click();
        this.driver.sleep(3);
        let input2 = await this.driver.getElement("css", "textarea");
        await this.driver.type(input2, msg);
        let sendBtn = await this.driver.getElements("css", "button");
        sendBtn[5].click();
        console.log('Message sent');
    }

    async sendPost(username, post) {
        // Changes requires
        await this.driver.openUrl(post);
        this.driver.sleep(1);
        let shareBtn = await this.driver.getElements("css", "button");
        shareBtn[6].click();
        this.driver.sleep(1);
        let directBtn = await this.driver.getElements("css", ".Igw0E.rBNOH.eGOV_");
        directBtn[1].click();
        this.driver.sleep(1);
        let userInput = await this.driver.getElements("css", "input");
        this.driver.sleep(3);
        await this.driver.type(userInput[0], username);
        let selectBtn = await this.driver.getElement("css", "button.dCJp8");
        selectBtn.click();
        let sendBtn = await this.driver.getElement("xpath", "//button[contains(text(),'Send')]");
        sendBtn.click();
    }

    async likePost(post) {
        // TODO
    }

    async likeHastagPost(hastag, total = 25) {
        await this.driver.openUrl('https://www.instagram.com/explore/tags/' + hastag);
        let btn = await this.driver.getElements("css", "div .eLAPa");
        btn[0].click();
        for (var i = 0; i < total; i++) {
            this.driver.sleep(3);
            let likePost = await this.driver.getElement("css", ".fr66n button");
            likePost.click();
            let nextPost = await this.driver.getElement("css", "a.coreSpriteRightPaginationArrow");
            nextPost.click();
            this.driver.sleep(3);
        }
    }

    async getUserInfo(username) {

        let url = 'https://www.instagram.com/' + username + '/?__a=1';
        let userAgent = 'Mozilla/5.0 (Linux; Android 5.0.1; LG-H342 Build/LRX21Y; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/65.0.3325.109 Mobile Safari/537.36 Instagram 40.0.0.14.95 Android (21/5.0.1; 240dpi; 480x786; LGE/lge; LG-H342; c50ds; c50ds; pt_BR; 102221277)';

        let json = await fetch(url, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "User-Agent": userAgent
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors"
        }).then(
            res => {
                return res.json();
            }
        );

        let info = json.graphql.user;
        return info;
    }

    async getUserFollowings(id, cookie, after = '') {
        let mylist = [];

        let query_hash = 'd04b0a864b4b54837c0d870b0e77e076';
        let first = 22;

        let queryUrl = 'https://www.instagram.com/graphql/query/?query_hash=' + query_hash + '&variables=';
        let paramUrl = '{"id":"' + id + '","fetch_mutual": false,"first": ' + first + ',"after":"' + after + '"}';

        paramUrl = paramUrl.replace('{', '%7B');
        paramUrl = paramUrl.replace('}', '%7D');
        paramUrl = paramUrl.replace(':', '%3A');
        paramUrl = paramUrl.replace(',', '%2C');

        let url = queryUrl + paramUrl;

        let json = await fetch(url, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "cookie": cookie
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors"
        }).then(
            res => {
                return res.json();
            }
        );

        let has_next = json.data.user.edge_follow.page_info.has_next_page;
        let end_cursor = json.data.user.edge_follow.page_info.end_cursor;
        let users = json.data.user.edge_follow.edges;

        for (var i = 0; i < users.length; i++) {
            mylist.push(users[i]);
        }

        if (has_next) {
            let next = await this.getUserFollowings(id, cookie, end_cursor);
            for (var i = 0; i < next.length; i++) {
                mylist.push(next[i]);
            }
        }

        return mylist;

    }

    async getUserFollowers(id, cookie, after = '') {
        let mylist = [];

        let query_hash = 'c76146de99bb02f6415203be841dd25a';
        let first = 22;

        let queryUrl = 'https://www.instagram.com/graphql/query/?query_hash=' + query_hash + '&variables=';
        let paramUrl = '{"id":"' + id + '","fetch_mutual": false,"first": ' + first + ',"after":"' + after + '"}';

        paramUrl = paramUrl.replace('{', '%7B');
        paramUrl = paramUrl.replace('}', '%7D');
        paramUrl = paramUrl.replace(':', '%3A');
        paramUrl = paramUrl.replace(',', '%2C');

        let url = queryUrl + paramUrl;

        let json = await fetch(url, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "cookie": cookie
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors"
        }).then(
            res => {
                return res.json();
            }
        );

        let has_next = json.data.user.edge_followed_by.page_info.has_next_page;
        let end_cursor = json.data.user.edge_followed_by.page_info.end_cursor;
        let users = json.data.user.edge_followed_by.edges;

        for (var i = 0; i < users.length; i++) {
            mylist.push(users[i]);
        }

        if (has_next) {
            let next = await this.getUserFollowers(id, cookie, end_cursor);
            for (var i = 0; i < next.length; i++) {
                mylist.push(next[i]);
            }
        }

        return mylist;

    }
}

module.exports = Instagram