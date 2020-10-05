require('chromedriver');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriverPath = require('chromedriver').path.replace('app.asar', 'app.asar.unpacked');
chrome.setDefaultService(new chrome.ServiceBuilder(chromedriverPath).build());
const path = require('path');
const fs = require('fs');
const os = require('os');

let chromeOptions = new chrome.Options;
chromeOptions.addArguments('disable-infobars');
chromeOptions.setUserPreferences({ credential_enable_service: false });

let browser = async function (headless = false) {

    this.waitTime = 30000;

    if (headless == true) {
        chromeOptions.addArguments('headless');
    }

    this.driver = await new Builder()
        .setChromeOptions(chromeOptions)
        .forBrowser('chrome')
        .build();

    this.quit = async function () {
        return await this.driver.quit();
    };

    this.openUrl = async function (url) {
        return await this.driver.get(url);
    };

    this.locateElement = async function (type, ele, time = this.waitTime) {
        var msg = 'Looking for an element';
        switch (type) {
            case 'css':
                await this.driver.wait(until.elementLocated(By.css(ele)), time, msg);
                break;
            case 'id':
                await this.driver.wait(until.elementLocated(By.id(ele)), time, msg);
                break;
            case 'name':
                await this.driver.wait(until.elementLocated(By.name(ele)), time, msg);
                break;
            case 'class':
                await this.driver.wait(until.elementLocated(By.className(ele)), time, msg);
                break;
            case 'xpath':
                await this.driver.wait(until.elementLocated(By.className(ele)), time, msg);
                break;
        }
    }

    this.getElement = async function (type, ele) {
        await this.locateElement(type, ele);
        switch (type) {
            case 'css':
                return await this.driver.findElement(By.css(ele));
            case 'id':
                return await this.driver.findElement(By.id(ele));
            case 'name':
                return await this.driver.findElement(By.name(ele));
            case 'class':
                return await this.driver.findElement(By.className(ele));
            case 'xpath':
                return await this.driver.findElement(By.xpath(ele));
        }
    }

    this.getElements = async function (type, ele) {
        await this.locateElement(type, ele);
        switch (type) {
            case 'css':
                return await this.driver.findElements(By.css(ele));
            case 'class':
                return await this.driver.findElements(By.className(ele));
            case 'xpath':
                return await this.driver.findElements(By.xpath(ele));
        }
    }

    this.type = async function (ele, value) {
        return await ele.sendKeys(value);
    }

    this.openUrl = async function (url) {
        return await this.driver.get(url);
    }

}

module.exports = {
    browser
}