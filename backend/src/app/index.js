const express = require('express');
const swaggerUi = require('swagger-ui-express');
const setupMiddleware = require('./middleware');
const routes = require('../routes');
const errorHandler = require('../shared/middleware/errorHandler');
const { apiLimiter } = require('../shared/middleware/rateLimiter');
const config = require('../config');
const swaggerSpec = require('../config/swagger');

const createApp = () => {
  const app = express();

  // Setup middleware
  setupMiddleware(app);

  // API rate limiting
  app.use('/api', apiLimiter);

  // Welcome route
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Welcome to BhandarX Inventory Management System API',
      version: config.apiVersion,
      documentation: '/api-docs',
    });
  });

  // Swagger API Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'BhandarX API Documentation',
  }));

  // Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Mount API routes
  app.use(`/api/${config.apiVersion}`, routes);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
