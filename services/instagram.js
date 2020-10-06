const Browser = require('./browser.js');
const Path = require('path');
const fs = require('fs');

class Instagram {

    constructor(headless = true) {
        this.driver = new Browser(headless);
    }

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

    async login(username, password, path = './') {
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

    async closeNotificationDialog() {
        let ele = await this.driver.getElement("css", "button.aOOlW.HoLwm");
        ele.click();
    }

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
}

module.exports = Instagram