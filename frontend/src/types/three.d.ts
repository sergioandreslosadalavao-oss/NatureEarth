/**
 * El paquete `three` (v0.186) no distribuye declaraciones de tipos
 * (.d.ts) y no existe un paquete `@types/three` instalado. Sin este
 * módulo ambiental, cualquier `import ... from 'three'` falla bajo
 * `strict` con TS7016.
 *
 * Se declara como módulo "cualquiera" a propósito: la API de three que
 * usa esta app es mínima (luces y materiales) y globe.gl ya expone los
 * tipos de su propia superficie pública.
 */
declare module 'three'
