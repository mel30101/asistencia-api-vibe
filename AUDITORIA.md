# Informe de Auditoría Técnica - API de Asistencia

**Fecha:** 21 de abril de 2026  
**Auditor:** Lead QA Automation Engineer & Auditor de Seguridad Senior  
**Estado:** Finalizado  

---

## 1. Resumen Ejecutivo
Se realizó una auditoría técnica profunda al código de la API de asistencia. Si bien el código cumple con las reglas de negocio básicas solicitadas (validaciones de formato, fechas y enums), presenta vulnerabilidades críticas de seguridad y deficiencias estructurales que impiden su despliegue seguro en un entorno de producción.

---

## 2. Checklist de Auditoría (Resultados)

| Categoría | Evaluación | Observación |
| :--- | :---: | :--- |
| **Validación de entrada** | ✅ | Valida código, fechas y enums correctamente. |
| **Manejo de Errores** | ⚠️ | Existe manejo global, pero faltan códigos semánticos (409) y try/catch específicos. |
| **Inyección y Seguridad** | ❌ | Sin Rate Limiting, sin CORS, sin sanitización de entradas. |
| **Datos sensibles** | ❌ | Exposición total de datos sin autenticación. |
| **Estructura** | ❌ | Todo concentrado en `app.js` (Mono-archivo). |
| **Dependencias** | ✅ | Sin vulnerabilidades conocidas (`npm audit` 0). |
| **Configuración** | ⚠️ | Uso de `process.env.PORT` correcto, pero falta `.env.example`. |
| **Idempotencia** | ✅ | Control de duplicados funcional (lógica correcta). |
| **Pruebas** | ❌ | 0 pruebas automatizadas encontradas. |
| **Documentación** | ❌ | README.md vacío. |

---

## 3. Detalle de Hallazgos

### Hallazgo #1: Exposición de Datos y Falta de Autenticación
*   **Severidad:** Alta
*   **Archivo / Línea:** `app.js` / Todas las rutas `/api/*`
*   **Descripción:** No existe ninguna capa de seguridad (JWT, API Keys, OAuth) que proteja los endpoints. Cualquier persona con la URL puede obtener la lista completa de estudiantes o registrar asistencias falsas.
*   **Evidencia:** 
    *   Envío: `GET /api/estudiantes`
    *   Respuesta: `200 OK` con el JSON de todos los usuarios sin pedir credenciales.
*   **Impacto:** Es profesionalmente irresponsable exponer datos personales (nombres y códigos) y permitir la mutación de registros académicos sin control de acceso. Facilita la suplantación de identidad y el vandalismo de datos.

### Hallazgo #2: Ausencia Total de Pruebas Automatizadas
*   **Severidad:** Alta
*   **Archivo / Línea:** Raíz del proyecto / `package.json`
*   **Descripción:** No se ha implementado ningún framework de pruebas (Jest, Mocha, Supertest).
*   **Evidencia:** El archivo `package.json` no contiene scripts de `test` y no existen directorios de pruebas en el workspace.
*   **Impacto:** En producción, cualquier cambio menor en la lógica de validación de fechas o duplicados podría romper el sistema sin que el equipo lo note hasta que falle en manos del usuario.

### Hallazgo #3: Susceptibilidad a DoS por Falta de Rate Limiting
*   **Severidad:** Media
*   **Archivo / Línea:** `app.js`
*   **Descripción:** La API no implementa límites de peticiones (Rate Limiting).
*   **Evidencia:** Ausencia del middleware `express-rate-limit` o similar.
*   **Impacto:** Un atacante puede saturar el servidor con miles de peticiones por segundo, agotando los recursos o llenando la memoria (especialmente peligroso al usar arrays in-memory).

### Hallazgo #4: Configuración de CORS Inexistente
*   **Severidad:** Media
*   **Archivo / Línea:** `app.js`
*   **Descripción:** No se ha configurado el middleware de Cross-Origin Resource Sharing.
*   **Evidencia:** Falta la importación y uso de `app.use(cors())`.
*   **Impacto:** Limita la interoperabilidad con frontends modernos o, si se deja por defecto en algunos entornos, podría permitir ataques de Cross-Site Request Forgery (CSRF) si se combinara con cookies en el futuro.

### Hallazgo #5: Arquitectura Monolítica (Falta de Separación de Capas)
*   **Severidad:** Media
*   **Archivo / Línea:** `app.js`
*   **Descripción:** El archivo `app.js` actúa como router, controlador, modelo (storage) y middleware al mismo tiempo.
*   **Evidencia:** 222 líneas de código mezclando configuración de Express, reglas de negocio y almacenamiento de datos.
*   **Impacto:** Altísimo costo de mantenimiento. Escalar el sistema para usar una base de datos real (MongoDB/Postgres) requeriría una refactorización casi total del código.

### Hallazgo #6: Falta de Sanitización de Entradas (Riesgo XSS)
*   **Severidad:** Media
*   **Archivo / Línea:** `app.js` / L-64, L-133
*   **Descripción:** Los campos `nombre` y `codigo` se guardan tal cual se reciben en el JSON.
*   **Evidencia:** `const nuevoEstudiante = { codigo, nombre }; estudiantes.push(nuevoEstudiante);`
*   **Impacto:** Si un usuario malintencionado registra un nombre como `<script>fetch('...')</script>`, cualquier panel administrativo que visualice este nombre ejecutará el script, permitiendo el robo de sesiones.

### Hallazgo #7: Uso de Semántica HTTP Incorrecta para Duplicados
*   **Severidad:** Baja
*   **Archivo / Línea:** `app.js` / L-130
*   **Descripción:** Se devuelve un error `400 Bad Request` cuando se intenta registrar una asistencia duplicada.
*   **Evidencia:** `res.status(400).json({ error: 'Ya existe un registro...' });`
*   **Impacto:** Falta de profesionalismo en el contrato de la API. El estándar para conflictos de estado (como un recurso que ya existe) es `409 Conflict`.

### Hallazgo #8: Documentación de Proyecto Inexistente (README)
*   **Severidad:** Baja
*   **Archivo / Línea:** `README.md`
*   **Descripción:** El archivo principal de documentación está vacío.
*   **Evidencia:** El contenido de `README.md` tiene un tamaño de 0 bytes.
*   **Impacto:** Aumenta el tiempo de fricción para nuevos integrantes del equipo y dificulta el despliegue en entornos CI/CD que dependan de documentación de configuración.

---

## 4. Recomendaciones
1.  **Seguridad:** Implementar un middleware de autenticación (ej: Passport.js o JWT).
2.  **QA:** Integrar Jest y Supertest para validar todos los endpoints.
3.  **Arquitectura:** Refactorizar el código siguiendo el patrón MVC (Model-View-Controller).
4.  **Sanitización:** Usar librerías como `dompurify` o realizar escapado manual de caracteres.
5.  **Persistencia:** Migrar el almacenamiento de arrays en memoria a una base de datos persistente.
