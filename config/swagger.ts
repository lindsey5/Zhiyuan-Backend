import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: '3.2.0',
        info: {
            title: 'Zhiyuan Backend APIs',
            description: "API documentation for Zhiyuan Backend",
            version: '1.0.0',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./docs/**/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);