const express = require('express');
const app = express();

const middlewares = require('./middlewares');
const routes = require('./routes');

middlewares.init(app);
routes.init(app);

const port = process.env.PORT || '3000';
app.listen(port, () => console.log(`Server listening on port ${port}`));
