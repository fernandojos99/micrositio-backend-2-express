import serverless from "serverless-http";
import app from "./src/app.js";

// Wrapper para controlar errores globales
const serverlessHandler = serverless(app, {
  request: (req, event, context) => {
    // Puedes inyectar cosas al request si quieres
    req.event = event;
    req.context = context;
  }
});

export const handler = async (event, context) => {
  try {
    const response = await serverlessHandler(event, context);

    return response;

  } catch (error) {
    console.error("Error global en Lambda:", error);

    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        success: false,
        message: error.message || "Error interno del servidor"
      }),
    };
  }
};