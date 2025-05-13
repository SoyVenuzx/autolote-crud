import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import colors from 'colors'
import cors from 'cors'
import morgan from 'morgan'

//* Routes
import testRouter from '@/routes/test.route'
import authRouter from '@/routes/auth.route'
import userRouter from '@/routes/user.route'

import errorHandling from '@/middlewares/errorHandler'
import db from '@/config/db'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

//! -- Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: 'localhost:5173', credentials: true }))
app.use(morgan('dev'))
app.use(helmet())

//! -- Routes
app.use('/api/v1/test', testRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/user', userRouter)

//! -- Test Route
app.get('/api/v1', (_, res) => {
  res.json({
    message: 'API is running. DB should be connected.'
  })
})

//! -- Error Handling
app.use(errorHandling)

//! -- Start Server
const startServer = async () => {
  try {
    console.log(colors.cyan('Intentando conectar a la base de datos...'))
    await db.authenticate()
    console.log(
      colors.green.bold(
        'Conexión con la base de datos autenticada correctamente.'
      )
    )

    await db.sync()
    console.log(
      colors.green.bold('Modelos sincronizados con la base de datos.')
    )

    app.listen(PORT, () => {
      console.log(colors.bgBlue.black.bold(`Server is running on port ${PORT}`))
    })
  } catch (error) {
    console.error(error) // Muestra el error detallado
    console.log(
      colors.bgRed.white.bold('Hubo un error al conectar o sincronizar la DB')
    )
    process.exit(1) // Termina el proceso si la conexión inicial falla
  }
}

startServer()
