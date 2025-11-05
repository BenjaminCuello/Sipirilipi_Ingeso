import { Router } from 'express'
import { Role } from '@prisma/client'
import multer from 'multer'
import { upload } from '../middleware/upload'
import { processUploadedImage, removeImage } from '../services/image.service'
import { requireAuth, requireRole } from '../middleware/auth'

const router = Router()
const uploader = upload.array('files', 10)

router.post('/', requireAuth, requireRole(Role.ADMIN, Role.SELLER), (req, res, next) => {
  uploader(req, res, async err => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ error: 'Archivo demasiado grande' })
        }
        return res.status(400).json({ error: err.message })
      }
      if ((err as any)?.code === 'INVALID_MIME') {
        return res.status(400).json({ error: 'Tipo de archivo no soportado' })
      }
      return next(err)
    }

    const files = (req.files as Express.Multer.File[]) ?? []
    if (files.length === 0) {
      return res.status(400).json({ error: 'Debe subir al menos una imagen' })
    }

    try {
      const results = await Promise.all(files.map(file => processUploadedImage(file)))
      return res.status(201).json(results)
    } catch (processingError) {
      return next(processingError)
    }
  })
})

router.delete('/:filename', requireAuth, requireRole(Role.ADMIN, Role.SELLER), async (req, res, next) => {
  try {
    const filename = req.params.filename
    if (
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\') ||
      filename.trim() === ''
    ) {
      return res.status(400).json({ error: 'Nombre de archivo invalido' })
    }

    await removeImage(filename)
    res.status(204).send()
  } catch (error: any) {
    if (error?.status === 404) {
      return res.status(404).json({ error: 'Archivo no encontrado' })
    }
    next(error)
  }
})

export default router
