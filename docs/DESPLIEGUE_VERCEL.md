# Ayni en Vercel: URL fija para la demo

*dom 8 nov 2026. Objetivo: que la app instalada en los celulares no dependa del túnel de cloudflared (cada link nuevo obligaba a reinstalar y volver a entrar).*

## Qué hace Vercel por nosotros
- Sirve la app construida (`npm run build` → `dist/`) en una URL fija con HTTPS, por ejemplo `https://ayni.vercel.app`. Con HTTPS la app se instala y funciona sin internet igual que por el túnel.
- Convierte los archivos de la carpeta `api/` en funciones serverless. `api/verificar-dni.js` reemplaza al servidor local de Didit (`server/index.js`): la clave de Didit vive en Vercel como variable secreta y nunca llega al navegador. El código de validación es el mismo (`server/didit.js`).
- `vercel.json` manda todas las rutas que no sean `/api/*` a `index.html` (React Router) y evita que el navegador guarde en caché `sw.js` y el manifest (así las actualizaciones llegan).
- Cada `git push` a `main` publica una versión nueva. Los celulares instalados la reciben solos al abrir la app (service worker con `autoUpdate`).

Costo: S/ 0 (plan Hobby). Firebase sigue igual, no cambia nada de datos.

## Cómo quedó (dom 8 nov 01:25)
- **URL de producción: https://ayni-xpertimpact.vercel.app** (cuenta Vercel `eduarx1509`, proyecto `hackhaton-utp-comercio`; el dominio se cambió en Settings → Domains con "Add Existing" porque `ayni.vercel.app` ya estaba ocupado).
- Se desplegó **desde la PC con la línea de comandos**, no desde GitHub: el repo pertenece a la cuenta de Iván (idmr023) y Vercel solo deja importar repos de la propia cuenta. Por eso **no se publica solo con cada push**: hay que correr el comando de abajo.
- Publicar una versión nueva (PowerShell en VS Code, desde la carpeta del repo):
  ```powershell
  cd "C:\Users\eduar\Documents\hackathon utp comercio\hackhaton-utp-comercio"
  npx vercel --prod --yes
  ```
  Sube solo lo que no está en `.gitignore` (sin node_modules, .env ni capturas). Tarda 1 minuto.
- Variables: Settings → Environment Variables del proyecto (las 6 de abajo). Sin `DIDIT_API_KEY`, `/api/salud` responde `"didit":false` y los registros quedan "Pendiente de verificación".
- Si algún día Iván quiere que cada push publique solo: importar el repo desde su cuenta de Vercel (pasos siguientes) o invitar a Eduardo como colaborador y correr `npx vercel git connect`.

## Pasos alternativos: importar desde GitHub (solo con la cuenta dueña del repo)
1. Entrar a https://vercel.com y crear cuenta con **Continue with GitHub**.
2. **Add New → Project → Import** el repo `idmr023/hackhaton-utp-comercio`. Vercel detecta Vite solo (Framework Preset: Vite, Build `npm run build`, Output `dist`). No cambiar nada.
3. En **Environment Variables**, pegar las 6 variables del `.env` local (los valores están en `entregables dia 1/`), una por una, para los tres entornos (Production, Preview, Development):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_GEMINI_API_KEY`
   - `DIDIT_API_KEY` (sin `VITE_`: solo la ve la función serverless)
4. **Deploy**. Tarda 1 o 2 minutos. Vercel da una URL tipo `https://ayni-xpertimpact.vercel.app`. En **Settings → Domains** se puede cambiar a algo corto como `ayni-barrio.vercel.app` si está libre.
5. Comprobar:
   - Abrir `https://<tu-url>/api/salud` → debe responder `{"ok":true,"didit":true}`. Si dice `"didit":false`, falta la variable `DIDIT_API_KEY` (agregarla y **Redeploy**).
   - Abrir `https://<tu-url>/?demo=1` en el celular, registrarse con el mismo celular y DNI (entra a la cuenta existente) y **Agregar a pantalla de inicio**. Desinstalar la versión del túnel para no confundirse.
   - Probar un registro nuevo para ver "Validado en RENIEC" (eso confirma que Didit responde desde Vercel).

## Validar DNI de verdad: clave de producción de Didit
Con la clave `sk_test_` Didit **no consulta RENIEC**: responde `full_match` para cualquier DNI y nombre (comprobado dom 8 nov con 99999999 y 12345678). El código ya está listo para la clave de producción: solo marca "Validado en RENIEC" con `full_match`/`partial_match` y rechaza la cuenta con `no_match` ("El DNI no coincide con RENIEC").
1. En la consola de Didit (la cuenta donde se sacó la clave de prueba) obtener la **clave de producción** (no empieza con `sk_test_`). Según el blog de Didit, cada cuenta trae 500 verificaciones gratis al mes; luego ~0,17–0,20 USD por consulta concluyente.
2. Vercel → proyecto → **Settings → Environment Variables** → `DIDIT_API_KEY` → Edit → pegar la clave nueva → Save. Para la PC, cambiarla también en `.env` (no tocar `entregables dia 1/`).
3. Publicar: `npx vercel --prod --yes` (las variables solo se aplican en un despliegue nuevo; además limpia la caché de DNI de la función).
4. Comprobar: `https://ayni-xpertimpact.vercel.app/api/salud` debe decir `"diditModo":"produccion"` (con la de prueba dice `"prueba"`).
5. Probar con un DNI inventado (debe salir `"coincide":false`), en PowerShell:
   `Invoke-RestMethod -Method Post -Uri https://ayni-xpertimpact.vercel.app/api/verificar-dni -ContentType 'application/json' -Body '{"dni":"12345678","nombre":"Nadie Existe"}'`
   y con el DNI real de alguien del equipo (con su permiso) y su nombre (debe salir `true`).
6. Las cuentas creadas con DNI inventados mientras estaba la clave de prueba (p. ej. "Pepe Gonzales", 99999999) siguen marcadas "Validado en RENIEC": borrarlas a mano en la consola de Firebase (`usuarios/{id}` y `accesos/{id}`).

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
