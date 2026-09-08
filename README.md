# Cumbre Norte

Single page inmobiliaria demo preparada para Next.js, Vercel y GitHub Contents API.

## Desarrollo

```bash
npm install
npm run dev
```

La web pública vive en `/` y el panel privado en `/admin`. En este equipo, el puerto 3000 ya estaba ocupado, así que el proyecto queda disponible en `http://localhost:3001`.

## Variables privadas

Copia `.env.example` como `.env.local` y completa los valores sin subirlos al repositorio. Para generar el hash de contraseña usa una consola Node con:

```js
const { randomBytes, scryptSync } = require('node:crypto'); const p = 'TU_CONTRASEÑA'; const s = randomBytes(16).toString('hex'); console.log(`scrypt$${s}$${scryptSync(p, s, 64).toString('hex')}`)
```

`GITHUB_TOKEN` debe ser un token fine-grained con permiso `Contents: Read and write` únicamente sobre este repositorio. El panel valida la sesión en el servidor y guarda `data/content.json` mediante GitHub Contents API; el commit activa el despliegue configurado en Vercel.

Los datos, precios, propiedades y contactos incluidos son ficticios y deben reemplazarse antes de publicar para uso comercial.
