const bodyParser = require('body-parser');

const init = app => {
    app.use(bodyParser.json());

    app.use(bodyParser.urlencoded({
        extended: false
    }));

    app.use((error, req, res, next) => {
        if (error.joi) {
        return res.status(400).json({ error: error.joi.message });
        }
        next();
    });
}

module.exports = {
    init
}