const express = require('express')
const morgan = require('morgan')
var cors = require('cors')
const bp = require("body-parser");
const errorHandler = require("./middlewares/error.middleware");
const app = express();

const routes = require("./routes");

app.use(cors());
app.use(bp.urlencoded({ extended: true, limit: '10mb' }));
app.use(bp.json({ limit: '10mb' }));
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: false }));

routes(app);

app.use(errorHandler);

module.exports = app;