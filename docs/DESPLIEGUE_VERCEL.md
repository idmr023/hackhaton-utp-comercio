# Ayni en Vercel: URL fija para la demo

*dom 8 nov 2026. Objetivo: que la app instalada en los celulares no dependa del túnel de cloudflared (cada link nuevo obligaba a reinstalar y volver a entrar).*

## Qué hace Vercel por nosotros
- Sirve la app construida (`npm run build` → `dist/`) en una URL fija con HTTPS, por ejemplo `https://ayni.vercel.app`. Con HTTPS la app se instala y funciona sin internet igual que por el túnel.
- Convierte los archivos de la carpeta `api/` en funciones serverless. `api/verificar-dni.js` reemplaza al servidor local de Didit (`server/index.js`): la clave de Didit vive en Vercel como variable secreta y nunca llega al navegador. El código de validación es el mismo (`server/didit.js`).
- `vercel.json` manda todas las rutas que no sean `/api/*` a `index.html` (React Router) y evita que el navegador guarde en caché `sw.js` y el manifest (así las actualizaciones llegan).
- Cada `git push` a `main` publica una versión nueva. Los celulares instalados la reciben solos al abrir la app (service worker con `autoUpdate`).

Costo: S/ 0 (plan Hobby). Firebase sigue igual, no cambia nada de datos.

## Pasos (10 minutos, con la cuenta de GitHub de Eduardo)
1. Entrar a https://vercel.com y crear cuenta con **Continue with GitHub**.
2. **Add New → Project → Import** el repo `idmr023/hackhaton-utp-comercio`. Vercel detecta Vite solo (Framework Preset: Vite, Build `npm run build`, Output `dist`). No cambiar nada.
3. En **Environment Variables**, pegar las 6 variables del `.env` local (los valores están en `entregables dia 1/`), una por una, para los tres entornos (Production, Preview, Development):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_GEMINI_API_KEY`
   - `DIDIT_API_KEY` (sin `VITE_`: solo la ve la función serverless)
4. **Deploy**. Tarda 1 o 2 minutos. Vercel da una URL tipo `https://hackhaton-utp-comercio.vercel.app`. En **Settings → Domains** se puede cambiar a algo corto como `ayni-barrio.vercel.app` si está libre.
5. Comprobar:
   - Abrir `https://<tu-url>/api/salud` → debe responder `{"ok":true,"didit":true}`. Si dice `"didit":false`, falta la variable `DIDIT_API_KEY` (agregarla y **Redeploy**).
   - Abrir `https://<tu-url>/?demo=1` en el celular, registrarse con el mismo celular y DNI (entra a la cuenta existente) y **Agregar a pantalla de inicio**. Desinstalar la versión del túnel para no confundirse.
   - Probar un registro nuevo para ver "Validado en RENIEC" (eso confirma que Didit responde desde Vercel).

## Qué cambia en la rutina del equipo
- **Ya no hace falta** el túnel ni `npm run server` para la demo. Solo internet en el celular.
- Para seguir desarrollando en la PC todo sigue igual (`npm run dev`, `npm run server`, túnel si quieren probar en el celular algo antes de subirlo).
- Para publicar una corrección: commit y push a `main`. En 2 minutos está en la URL. Si algo sale mal, en Vercel → Deployments se puede volver a la versión anterior con un clic (**Promote to Production** sobre la anterior).
- Las reglas de Firestore, la clave de Gemini en el navegador y la clave `sk_test_` de Didit siguen con las mismas limitaciones de siempre (ver CLAUDE.md §5).

## Si algo falla
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Página en blanco | Faltan las variables `VITE_FIREBASE_*` | Agregarlas y Redeploy (sin ellas la app entra en modo demo local, sin Firebase) |
| Registro dice "Pendiente de verificación" siempre | `/api/verificar-dni` sin clave o caído | Ver `/api/salud`; agregar `DIDIT_API_KEY`; Redeploy |
| Al recargar una ruta como `/vecinos` da 404 | Falta el rewrite de `vercel.json` | Verificar que `vercel.json` esté en la raíz del repo |
| El celular no ve la versión nueva | El service worker viejo aún está activo | Cerrar la app del todo y abrirla de nuevo (dos veces si hace falta) |
