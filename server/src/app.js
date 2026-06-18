// src/app.js
// Wires up middleware and routes. Kept separate from server.js so tests can
// import the app directly without binding to a port.

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin }));
app.use(express.json());
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
