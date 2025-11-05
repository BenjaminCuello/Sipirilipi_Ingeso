import multer, { type FileFilterCallback } from 'multer'
import path from 'path'
import fs from 'fs'
import type { Request } from 'express'

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

const uploadsDir = path.resolve(process.cwd(), process.env.UPLOADS_DIR ?? 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const maxUploadMb = Number(process.env.MAX_UPLOAD_MB ?? '5')
const maxFileSize = Number.isFinite(maxUploadMb) && maxUploadMb > 0 ? maxUploadMb * 1024 * 1024 : 5 * 1024 * 1024

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadsDir)
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '')
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`
    cb(null, `${baseName || 'image'}-${unique}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSize,
    files: 10,
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error: any = new Error('Tipo de archivo no soportado')
      error.code = 'INVALID_MIME'
      error.status = 400
      return cb(error)
    }
    cb(null, true)
  },
})

export { upload, uploadsDir, allowedMimeTypes, maxFileSize }
