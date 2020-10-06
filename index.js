const path = require('path');
const fs = require('fs');
const os = require('os');

function sleep(seconds) {
    var waitUntil = new Date().getTime() + seconds * 1000;
    while (new Date().getTime() < waitUntil) true;
}

var instagram = async function (headless = false) {

    this.driver = await browser(headless);

    this.forceLogin = async function (username, password) {
        let url = 'https://www.instagram.com/accounts/login/';
        await this.driver.openUrl(url);
        let inputs = 'form input';
        var element = await this.driver.getElements('css', inputs);

        await this.driver.type(element[0], username);
        await this.driver.type(element[1], password + '\n').then(async function () {
            console.log('Login success');
        });
    }

    this.closeNotificationDialog = async function () {
        sleep(3);
        let ele = await this.driver.getElement("css", "button.aOOlW.HoLwm");
        ele.click();
    }

    this.saveInstagramSession = async function (username, cookie) {

        let time = Math.round(+new Date() / 1000).toString();

        let userSession = {
            username: user,
            password: pass,
            s_mid: getCookieValue(cookie, 'mid'),
            s_ig_did: getCookieValue(cookie, 'ig_did'),
            s_csrftoken: getCookieValue(cookie, 'csrftoken'),
            s_sessionid: getCookieValue(cookie, 'sessionid'),
            s_ds_user_id: getCookieValue(cookie, 'ds_user_id'),
            time: time,
            status: true
        }

        if (db.valid('instagram', dbPath)) {
            db.insertTableContent('instagram', dbPath, userSession, (succ, msg) => {
                if (succ) {
                    ipcRenderer.send('is-instagram-connected', true);
                }
            })
        }
    }
}

module.exports = {
    browser,
    instagram
}