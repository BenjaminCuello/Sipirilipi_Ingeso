import path from 'path'
import fs from 'fs/promises'
import sharp from 'sharp'
import { uploadsDir } from '../middleware/upload'

export type MediaResource = {
  filename: string
  originalUrl: string
  thumbFilename: string
  thumbUrl: string
  width: number | null
  height: number | null
  mime: string
  size: number
}

const THUMB_SUFFIX = '-thumb'
const MAX_DIMENSION = 600

function buildThumbFilename(filename: string) {
  const ext = path.extname(filename) || '.jpg'
  const base = path.basename(filename, ext)
  return `${base}${THUMB_SUFFIX}${ext}`
}

async function fileExists(targetPath: string) {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

export async function processUploadedImage(file: Express.Multer.File): Promise<MediaResource> {
  const metadata = await sharp(file.path).rotate().metadata()
  const thumbFilename = buildThumbFilename(file.filename)
  const thumbPath = path.join(uploadsDir, thumbFilename)

  await sharp(file.path)
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFile(thumbPath)

  return {
    filename: file.filename,
    originalUrl: `/uploads/${file.filename}`,
    thumbFilename,
    thumbUrl: `/uploads/${thumbFilename}`,
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    mime: file.mimetype,
    size: file.size,
  }
}

export async function removeImage(filename: string) {
  const originalPath = path.join(uploadsDir, filename)
  const exists = await fileExists(originalPath)

  if (!exists) {
    const error: any = new Error('Archivo no encontrado')
    error.status = 404
    throw error
  }

  const thumbFilename = buildThumbFilename(filename)
  const thumbPath = path.join(uploadsDir, thumbFilename)

  await fs.unlink(originalPath)
  await fs.unlink(thumbPath).catch(() => undefined)
}
