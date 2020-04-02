require('dotenv').config();

const axios = require('axios');
const cheerio = require('cheerio');

const searchProduct = async product => {
    try {
        const { data } = await axios.get(`${process.env.URL_MERCADOLIVRE_SEARCH_ITEM}/${product}`);
        return Promise.resolve(data);
    } catch (error) {
        return Promise.reject(`Error when searching product: ${error}`);
    }
}

const extractResults = html => {
    try {
        const $ = cheerio.load(html);
        const results = $('#searchResults').html();
        return Promise.resolve(results);
    } catch (error) {
        return Promise.reject(`Error when extracting results of html: ${error}`);
    }
}

const buildItems = (html, limit) => {
    try {
        const $ = cheerio.load(html);

        let count = 0;
        let items = [];
        $('.results-item').each(function(index) {
            if (count >= limit) {
                return;
            }

            const name = getProductName($(this));
            const link = getProductLink($(this));
            const price = getProductPrice($(this));
            const store = getProductStore($(this)) || null;
            const state = getProductState($(this)) || null;
            items.push({ name, link, price, store, state });
            
            count++;
        });

        return Promise.resolve(items);
    } catch (error) {
        return Promise.reject(`Error when build items: ${error}`);
    }
}

const execute = async ({ search, limit = 5 }) => {
    try {
        const html = await searchProduct(search);
        const results = await extractResults(html);
        const items = await buildItems(results, limit);
        return Promise.resolve(items);
    } catch (error) {
        return Promise.reject(error);
    }
}

const getProductName = html => html.find('.main-title').text().trim();
const getProductLink = html => html.find('.item__info-link').attr('href').trim();
const getProductStore = html => html.find('.item__brand-title-tos').text().trim();
const getProductState = html => html.find('.item__status > .item__condition').text().trim() || html.find('.item__status > .item__title').text().trim();

const getProductPrice = html => {
    let price = html.find('.item__info-link > span').text().replace('R$', '').trim();
    return getProductPriceWithDecimals(price, html);
}

const getProductPriceWithDecimals = (price, html) => {
    if (!price) {
        price = html.find('.price__fraction').text().trim();
        const decimals = html.find('.price__decimals').text().trim();

        if (decimals) {
            price += `.${decimals}`;
        }
    }

    return price;
}

module.exports = {
    execute
}