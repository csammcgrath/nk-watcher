const selectors = require('./selectors');
const configs = require('dotenv');
const puppeteer = require('puppeteer');
const NovelKeyItem = require('./model/NovelKeyItem');

async function checkPages(pages, browser) {
    const page = await browser.newPage();
    const tempUri = '/collections/frontpage/products/osa-sleeves';
    const item = tempUri.split('/').pop();

    await page.goto(selectors.nk.home + tempUri);
    await page.waitForSelector(selectors.nk_selectors.add_to_cart_button);

    //check to see if it is available!
    const isDisabled = await page.$eval(selectors.nk_selectors.add_to_cart_button, button => button.disabled);

    //out of stock
    if (isDisabled) {
        console.log(`${item} is not available`);
        return null;
    }
    console.log(`${item} is available!!`);

    //at this point, the item is available.
    await page.evaluate(selectors => {
        document.querySelector(selectors.nk_selectors.add_to_cart_button).click();
    }, selectors);

    await page.waitForSelector(selectors.nk_selectors.add_to_cart_success);

    return browser;
}

async function processCart(browser) {
    const page = await browser.newPage();
    await page.goto(selectors.nk.cart);
    await page.waitForSelector(selectors.nk_selectors.cart_list);

    //collect cart items and cost for recording purposes.
    let data = await page.$$eval(selectors.nk_selectors.cart_list, tds => tds.map(td => td.innerText));
    data = data.slice(1, 3);
    
    //storing this info so we can save to db
    let novelKeyItem = cleanData(data);

    //proceed to checkout
    await page.evaluate(selectors => {
        document.querySelector(selectors.nk_selectors.cart_list_check_out_button).click();
    }, selectors);
    
    return page;
}

async function enterShippingInformation(page) {
    const parsedConfigs = configs.config().parsed;

    await page.waitForSelector(selectors.nk_selectors.shipping_address_load);

    //fill all information
    await page.evaluate((selectors, configs) => {
        document.querySelector(selectors.nk_shipping_selectors.email).value = configs.email;
        document.querySelector(selectors.nk_shipping_selectors.first_name).value = configs.first_name;
        document.querySelector(selectors.nk_shipping_selectors.last_name).value = configs.last_name;
        document.querySelector(selectors.nk_shipping_selectors.address).value = configs.address;
        if (configs.address2 != null) {
            document.querySelector(selectors.nk_shipping_selectors.address2).value = configs.address2;
        }
        document.querySelector(selectors.nk_shipping_selectors.city).value = configs.city;
        document.querySelector(selectors.nk_shipping_selectors.zip).value = configs.zip;
        document.querySelector(selectors.nk_shipping_selectors.phone).value = configs.phone;
    }, selectors, parsedConfigs);

    //dropdown -- apparently, it already knows...
    // await page.select(selectors.nk_shipping_selectors.state, parsedConfigs.state);

    //ensure that shipping/email information is NOT saved
    await page.$eval(selectors.nk_shipping_selectors.subscribe_checkbox, check => check.checked = false);
    await page.$eval(selectors.nk_shipping_selectors.save_shipping_info_checkbox, check => check.checked = false);
}

//only keeping items and price
function cleanData(data) {
    let name = data[0].split('\n')[0];
    let price = data[1].slice(1);
    
    return new NovelKeyItem(name, price);
}

(async () => {
    try {
        let browser = await puppeteer.launch({
            headless: false,
            ...process.platform === 'darwin' && { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' }
        });
        browser = await checkPages([], browser);

        if (browser != null) {
            let page = await processCart(browser);
            page = await enterShippingInformation(page);
        }

        //await browser.close();
    } catch (err) {
        console.error(err);
        return;
    }
})();