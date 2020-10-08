const Browser = require('./browser.js');
const Path = require('path');
const fs = require('fs');

class Instagram {

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
        if(btn[1].getText != 'Requested') {
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

    /* Changes required
    async sendPost(username, post) {
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
    */
}

module.exports = Instagram