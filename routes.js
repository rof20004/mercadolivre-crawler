const { errors, celebrate, Joi } = require('celebrate');

const init = app => {
    const crawler = require('./crawler');
    const searchSchema = Joi.object().keys({
        search: Joi.string().required(),
        limit: Joi.number().integer()
    });

    app.post('/api/v1/products', celebrate({ body: searchSchema }), async (req, res) => {
        try {
            const results = await crawler.execute(req.body);
            res.status(200).send(results);
        } catch (error) {
            res.status(400).send(error.toString());
        }
    });

    app.use(errors());
}

module.exports = {
    init
}