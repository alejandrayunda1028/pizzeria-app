/**
 * server.js — Punto de entrada de la aplicación.
 * Inicializa la DB primero, luego levanta el servidor en 0.0.0.0.
 */
const { getDB } = require('./server/config/db');
const app = require('./server/app');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Capturar errores no manejados para evitar caídas silenciosas
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

// Inicializar DB primero, luego escuchar
getDB()
  .then(() => {
    console.log('[DB] Base de datos lista');
    app.listen(PORT, HOST, () => {
      console.log(`[SERVER] Corriendo en http://${HOST}:${PORT} | Modo: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('[DB] Error crítico al inicializar la base de datos:', err);
    process.exit(1);
  });