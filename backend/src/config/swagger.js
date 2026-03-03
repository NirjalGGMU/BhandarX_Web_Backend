const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BhandarX Inventory Management System API',
      version: '1.0.0',
      description: 'A comprehensive inventory management system with features for products, sales, purchases, customers, suppliers, and real-time updates.',
      contact: {
        name: 'BhandarX Team',
        email: 'support@bhandarx.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/${config.apiVersion}`,
        description: 'Development server',
      },
      {
        url: `https://api.bhandarx.com/api/${config.apiVersion}`,
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer {token}',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Authentication required' },
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Insufficient permissions' },
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Validation failed' },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: { type: 'string' },
                        message: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Resource not found' },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Authentication', description: 'Authentication and authorization endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Products', description: 'Product and inventory management' },
      { name: 'Categories', description: 'Product category management' },
      { name: 'Suppliers', description: 'Supplier management' },
      { name: 'Customers', description: 'Customer management' },
      { name: 'Sales', description: 'Sales and invoicing' },
      { name: 'Purchases', description: 'Purchase order management' },
      { name: 'Transactions', description: 'Inventory transactions' },
      { name: 'Reports', description: 'Reports and analytics' },
      { name: 'Notifications', description: 'Notification management' },
      { name: 'Activity Logs', description: 'Activity and audit logs' },
    ],
  },
  apis: [
    './src/modules/*/routes.js',
    './src/modules/*/*.controller.js',
    './src/modules/*/*.model.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
