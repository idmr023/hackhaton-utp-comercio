// Inicializa Firebase. Si no hay configuracion en .env, la app entra en MODO DEMO LOCAL
// (ver db.js) para que todos puedan correrla antes de que P4 cree el proyecto.
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const FIREBASE_ACTIVO = Boolean(cfg.apiKey && cfg.projectId)

let app = null
let auth = null
let db = null

if (FIREBASE_ACTIVO) {
  app = initializeApp(cfg)
  auth = getAuth(app)
  // Persistencia offline: Firestore guarda localmente y sincroniza solo al volver la senal.
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })
}

export { app, auth, db }
