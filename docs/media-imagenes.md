# Medios / imagenes (servicio de upload)

Este documento describe como usar el servicio de medios del backend (tarea 9). Todo el contenido esta sin tildes.

## Resumen

- Subida multiple de imagenes con `multer` (hasta 10 archivos por request)
- Procesamiento de miniaturas con `sharp` (lado mayor max 600px)
- Archivos servidos como estaticos desde `/uploads/...`
- Seguridad: limites de peso, whitelist de MIME y politica CORP cross-origin

## Variables de entorno

- `UPLOADS_DIR`: carpeta donde se guardan los archivos (por defecto `uploads`)
- `MAX_UPLOAD_MB`: tamano maximo por archivo en MB (por defecto `5`)

## Formatos permitidos

- `image/jpeg`
- `image/png`
- `image/webp`

Otros formatos (gif, svg, bmp, tiff, heic) no se aceptan.

## Endpoints

### POST `/api/media`

- Auth requerida: `ADMIN` o `SELLER` (header `Authorization: Bearer <token>`)
- Carga multiple de archivos campo `files`

Ejemplo `curl`:

```
curl -X POST "http://localhost:4000/api/media" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "files=@/ruta/imagen1.jpg" \
  -F "files=@/ruta/imagen2.png"
```

Respuesta `201` (array):

```
[
  {
    "filename": "miimagen-1699999999999-123456.jpg",
    "originalUrl": "/uploads/miimagen-1699999999999-123456.jpg",
    "thumbFilename": "miimagen-1699999999999-123456-thumb.jpg",
    "thumbUrl": "/uploads/miimagen-1699999999999-123456-thumb.jpg",
    "width": 1920,
    "height": 1080,
    "mime": "image/jpeg",
    "size": 345678
  }
]
```

Codigos de error:

- `400`: tipo de archivo no soportado, sin archivos, o peticion invalida
- `413`: archivo demasiado grande (supera `MAX_UPLOAD_MB`)
- `401/403`: auth o permisos insuficientes
- `500`: error interno de procesamiento o I/O

### DELETE `/api/media/:filename` (opcional)

- Auth requerida: `ADMIN` o `SELLER`
- Elimina el archivo original y su miniatura `-thumb`
- Validacion anti path traversal: rechaza nombres con `..`, `/` o `\`

Respuesta `204` si se elimina. `404` si no existe.

## Archivos estaticos `/uploads`

- El backend sirve `/uploads` como estatico con cache `max-age=7d`
- Se configura `Cross-Origin-Resource-Policy: cross-origin` para permitir que el frontend (p.e. Vite en `http://localhost:5173`) embeba las imagenes servidas por el backend (`http://localhost:4000`)

Ejemplo URL publica:

```
http://localhost:4000/uploads/miimagen-1699999999999-123456.jpg
```

## Notas para frontend

- Construir URLs absolutas: `BASE = VITE_API_BASE_URL.replace(/\/api$/, '')` y luego `BASE + '/uploads/...'`
- El proyecto ya normaliza URLs a absolutas en sus servicios.

## Buenas practicas implementadas

- Limite de peso por archivo (configurable)
- Whitelist de tipos MIME
- Generacion de nombre unico y sanitizacion basica
- Miniaturas con rotacion y resize sin agrandar
- Estaticos con cache y cabeceras CORP
- Borrado opcional con proteccion contra path traversal

## Consideraciones

- Tope de 10 imagenes por producto se aplica a nivel de logica de negocio en endpoints de `products/:id/images`
- Si necesitas soportar HEIC/HEIF (fotos de iPhone), se puede agregar una conversion automatica a JPEG/WEBP con `sharp` (no habilitado por defecto)

