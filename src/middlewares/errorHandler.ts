import { ErrorRequestHandler } from 'express'
import dotenv from 'dotenv'

dotenv.config()

const errorHandling: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err?.stack || err)

  const statusCode =
    err.statusCode && err.statusCode >= 400 && err.statusCode < 600
      ? err.statusCode
      : 500

  let clientMessage = 'Internal Server Error'
  let errorDetails: any = {} // Objeto para detalles adicionales (como el stack en dev)

  if (statusCode < 500) {
    // Para errores del cliente (4xx), generalmente enviamos el mensaje del error.
    clientMessage = err.message || 'Bad Request' // Fallback genérico para 4xx
  } else {
    // Para errores del servidor (5xx), enviamos un mensaje genérico en producción.
    if (process.env.NODE_ENV === 'development') {
      clientMessage = err.message || 'Internal Server Error' // Mensaje más específico en dev
      errorDetails.stack = err.stack // Incluir stack trace en desarrollo
    } else {
      clientMessage = 'Internal Server Error'
      // No incluimos detalles sensibles como stack en producción
    }
  }

  res.status(statusCode).json({
    status: 'error', // o 'fail' para 4xx, 'error' para 5xx según JSend
    message: clientMessage,
    ...errorDetails
  })
}

export default errorHandling
