require('dotenv').config();

const axios = require('axios');
const cheerio = require('cheerio');

async function searchProduct(product) {
    try {
        const { data } = await axios.get(`${process.env.URL_MERCADOLIVRE_SEARCH_ITEM}/${product}`);    
        return Promise.resolve(data);
    } catch (error) {
        console.log(`Error when searching the product: ${product}. Message: ${error}`);
    }

    return Promise.reject(null);
}

async function extractResults(product, html) {
    try {
        const $ = cheerio.load(html);
        return Promise.resolve($('#searchResults').html());
    } catch (error) {
        console.log(`Error when extracting the product data: ${product}. Message: ${error}`);
    }

    return Promise.reject(null);
}

async function buildItems(html, quantity) {
    try {
        const $ = cheerio.load(html);

        let count = 0;
        let items = [];
        $('.results-item').each(function(index) {
            if (count >= quantity) {
                return;
            }
            
            const name = $(this).find('.main-title').text();
            const link = $(this).find('.item__info-link').attr('href');
            const price = '';
            const store = '';
            const state = '';
            items.push({ name, link, price, store, state });
            
            count++;
        });

        return Promise.resolve(items);
    } catch (error) {
        console.log(`Error when build items: ${error}`);
    }

    return Promise.reject(null);
}

async function buildItemsDetails(items) {
    try {
        let consolidatedData = [];

        for (let i = 0; i < items.length; i++) {
            const responseProductDetails = await axios.get(items[i].link);
            const htmlProductDetails = cheerio.load(responseProductDetails.data);

            const responseSellerDetails = await axios.get(htmlProductDetails('#root-app > div > div.ui-pdp-container.ui-pdp-container--pdp > div.ui-pdp-container__row.ui-pdp--relative.ui-pdp-with--separator--fluid.pb-40 > div.ui-pdp-container__col.col-1.ui-pdp-container--column-right.mt-16.pr-16 > div:nth-child(1) > form > div.ui-pdp-seller > div > div > h3 > div > a').attr('href'));
            const htmlSellerDetails = cheerio.load(responseSellerDetails.data);

            const price = htmlProductDetails('#root-app > div > div.ui-pdp-container.ui-pdp-container--pdp > div.ui-pdp-container__row.ui-pdp--relative.ui-pdp-with--separator--fluid.pb-40 > div.ui-pdp-container__col.col-3.pb-40 > div.ui-pdp-container__row.ui-pdp-with--separator--fluid.ui-pdp-with--separator--48 > div.ui-pdp-container__col.col-2.mr-32 > div.andes-tooltip__trigger > div > div > span > span.price-tag-fraction').text();
            const store = htmlSellerDetails('#root-app > div > div > div > div > h2').text();
            const state = htmlSellerDetails('#root-app > div > div > div > div > div > ul > li:nth-child(1) > p').text();
            
            items[i].price = price;
            items[i].store = store;
            items[i].state = state;
            
            consolidatedData.push(items[i]);
        }

        return Promise.resolve(consolidatedData);
    } catch (error) {
        console.log(`Error when build items details: ${error}`);
    }

    return Promise.reject(null);
}

async function main() {
    try {
        const product = 'playstation4';
        const quantity = 3;
        const html = await searchProduct(product);
        const results = await extractResults(product, html);
        const items = await buildItems(results, quantity);
        const consolidatedData = await buildItemsDetails(items);
        console.log(consolidatedData);
    } catch (error) {
        console.log(`Error when show the results: ${error}`);
    }
}

main();