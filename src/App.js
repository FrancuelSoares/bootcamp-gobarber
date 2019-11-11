import express from 'express';
import { resolve } from 'path';
import * as Sentry from '@sentry/node';
import routes from './routes';

import sentryConfig from './config/sentry';

import 'express-async-errors';

import './database';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());

    this.server.use(express.json());

    this.server.use(
      '/files',
      express.static(resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);

    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {}
}

export default new App().server;
