// Evita que el bloqueo por biometría se dispare cuando la app pasa a
// segundo plano brevemente por una acción esperada dentro del propio flujo
// (selector de imágenes, cámara, etc.), en vez de porque el usuario
// realmente salió a otra app. GlobalContext consulta isLockSuppressed()
// en su listener de AppState antes de bloquear.
let suppressUntil = 0;

export const suppressNextLock = (ms = 60000) => {
  suppressUntil = Date.now() + ms;
};

export const isLockSuppressed = () => Date.now() < suppressUntil;
