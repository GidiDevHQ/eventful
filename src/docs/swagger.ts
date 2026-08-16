import swaggerJsdoc from "swagger-jsdoc";
import { env } from "../config/env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Eventful API",
      version: "1.0.0",
      description:
        "A ticketing platform API — auth, events, tickets, QR verification, Paystack payments, reminders, and analytics.",
    },

    servers: [
      {
        url: `${env.appBaseUrl}/api/v1`,
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [{ bearerAuth: [] }],
  },

  apis: ["./src/modules/**/*Routes.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);