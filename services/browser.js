require('chromedriver');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const chromedriverPath = require('chromedriver')
    .path
    .replace('app.asar', 'app.asar.unpacked');

chrome
    .setDefaultService(new chrome
        .ServiceBuilder(chromedriverPath)
        .build());


let chromeOptions = new chrome.Options;
chromeOptions.addArguments('disable-infobars');
chromeOptions.setUserPreferences({ credential_enable_service: false });

class Browser {

    /**
     * @param  {boolean} headless=true
     */
    constructor(headless = true) {

        if (headless == true) {
            chromeOptions.addArguments('headless');
        }

        this.driver = new Builder()
            .setChromeOptions(chromeOptions)
            .forBrowser('chrome')
            .build();

        this.waitTime = 30000;
    }

    async quit() {
        return await this.driver.quit();
    }

    /**
     * @param  {string} url
     */
    async openUrl(url) {
        return await this.driver.get(url);
    }

    /**
     * @param  {string} type
     * @param  {string} ele
     * @param  {number} time=this.waitTime
     */
    async locateElement(type, ele, time = this.waitTime) {
        var msg = 'Looking for an element';
        switch (type) {
            case 'css': {
                await this.driver.wait(until.elementLocated(By.css(ele)), time, msg);
                break;
            }
            case 'id': {
                await this.driver.wait(until.elementLocated(By.id(ele)), time, msg);
                break;
            }
            case 'name': {
                await this.driver.wait(until.elementLocated(By.name(ele)), time, msg);
                break;
            }
            case 'class': {
                await this.driver.wait(until.elementLocated(By.className(ele)), time, msg);
                break;
            }
            case 'xpath': {
                await this.driver.wait(until.elementLocated(By.className(ele)), time, msg);
                break;
            }
        }
    }

    /**
     * @param  {string} type
     * @param  {number} ele
     * @return {object}
     */
    async getElement(type, ele) {
        await this.locateElement(type, ele);
        switch (type) {
            case 'css': {
                return await this.driver.findElement(By.css(ele));
            }
            case 'id': {
                return await this.driver.findElement(By.id(ele));
            }
            case 'name': {
                return await this.driver.findElement(By.name(ele));
            }
            case 'class': {
                return await this.driver.findElement(By.className(ele));
            }
            case 'xpath': {
                return await this.driver.findElement(By.xpath(ele));
            }
        }
    }

    /**
     * @param  {string} type
     * @param  {string} ele
     */
    async getElements(type, ele) {
        await this.locateElement(type, ele);
        switch (type) {
            case 'css': {
                return await this.driver.findElements(By.css(ele));
            }
            case 'class': {
                return await this.driver.findElements(By.className(ele));
            }
            case 'xpath': {
                return await this.driver.findElements(By.xpath(ele));
            }
        }
    }

    /**
     * @param  {object} ele
     * @param  {string} value
     */
    async type(ele, value) {
        return await ele.sendKeys(value);
    }

    /**
     * @return {object}
     */
    async getCookies() {
        let cookies = await this.driver.manage().getCookies();
        return cookies;
    }

    /**
     * @param  {string} name
     */
    async removeCookie(name) {
        await this.driver.manage().deleteCookie(name);
    }

    /**
     * @param  {string} value
     */
    async setCookie(value) {
        await this.driver.manage().addCookie(value);
    }

    async waitUntilTitle(title) {
        await this.driver.wait(until.titleIs(title));
    }

    /**
     * @param  {object} cookie
     * @param  {string} value
     * @return {string}
     */
    getCookieValue(cookie, value) {
        for (var i = 0; i < cookie.length; i++) {
            if (cookie[i].name == value) {
                return cookie[i].value;
            }
        }
    }

    /**
     * @param  {number} seconds
     */
    sleep(seconds) {
        var waitUntil = new Date().getTime() + seconds * 1000;
        while (new Date().getTime() < waitUntil) true;
    }
}

module.exports = Browser