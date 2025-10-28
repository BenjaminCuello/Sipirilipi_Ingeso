import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth'
import productsRouter from './routes/products'
import usersRouter from './routes/users'
import cartRouter from './routes/cart'

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/products', productsRouter)
app.use('/api/cart', cartRouter)

// Error handler simple
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Error interno' })
})

const PORT = Number(process.env.PORT || 4000)
app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}`))