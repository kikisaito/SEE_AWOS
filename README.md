# SEE / AWOS - Sistema de Estabilización Emocional (Full Stack)

**Institución:** Universidad Politécnica de Chiapas
**Desarrolladores:** Jaitovich Bisnaud Jimenez y Antonio de Hoyos Hernandez
**Versión:** 1.0.0
**Arquitectura Global:** Service-Oriented Architecture (SOA) + Clean Architecture (MVVM)

---

## 1. Declaración Transparente de Uso de Inteligencia Artificial
En estricto apego a los lineamientos de integridad académica y a la rúbrica de evaluación de la asignatura, se declara el uso de modelos de Inteligencia Artificial generativa (LLMs) durante el ciclo de vida de este proyecto bajo las siguientes condiciones:

* **Generación y Corrección de Código:** Se utilizó IA para la generación de estructuras base (boilerplate), depuración de errores de sintaxis en TypeScript y Dart, y optimización de consultas complejas mediante Prisma ORM.
* **Documentación:** La IA asistió en la redacción técnica, el formateo del código LaTeX para el reporte final y la estructuración de este documento Markdown.
* **Autoría y Control:** La arquitectura del sistema (SOA y Clean Architecture), el diseño del modelo relacional en PostgreSQL, la lógica transaccional de los microservicios y la integración de las interfaces en Flutter son producto del análisis y diseño original de los integrantes del equipo. Todo el código generado por IA fue revisado, adaptado y comprendido línea por línea, garantizando el control total sobre la lógica del software.

## 2. Descripción del Proyecto
El Sistema de Estabilización Emocional (**SEE / AWOS**) es una plataforma de grado clínico diseñada para la intervención inmediata en crisis de salud mental. Proporciona contención emocional de baja latencia a través de técnicas guiadas, registro de victorias diarias y telemetría clínica, operando sobre una infraestructura segura y de alta disponibilidad.

## 3. Flujo del Sistema y Arquitectura
El sistema opera mediante una separación estricta de responsabilidades entre el cliente móvil y el servidor:

1. **Frontend (Flutter):** El usuario interactúa con la aplicación móvil. La interfaz, gestionada por el patrón **Provider**, mantiene un flujo unidireccional de datos.
2. **Consumo de Servicios:** La capa de dominio realiza peticiones HTTP (RESTful). Los errores de red (400, 401, 404, 500) son interceptados y manejados sin exponer la lógica interna al usuario.
3. **Backend (Node.js):** Los microservicios procesan la solicitud de forma aislada, asegurando que un fallo en el sistema de reportes no afecte la disponibilidad del registro de crisis.
4. **Persistencia (PostgreSQL):** Se utilizan transacciones atómicas (ACID) mediante Prisma. Al cerrar una crisis, el registro clínico y la "Victoria" del usuario se guardan simultáneamente. Si un proceso falla, se ejecuta un *rollback* automático.

## 4. Stack Tecnológico

### Cliente Móvil (Frontend)
* **Lenguaje:** Dart 3.2+
* **Framework:** Flutter 3.41.0
* **Arquitectura:** MVVM / Clean Architecture
* **Gestión de Estado:** `provider`
* **Seguridad Local:** `flutter_secure_storage`

### Microservicios (Backend)
* **Lenguaje:** Node.js con TypeScript
* **Framework:** Express.js
* **Base de Datos:** PostgreSQL
* **ORM:** Prisma
* **Despliegue:** Render / Vercel

## 5. Especificación de la API (API Spec)
La API está construida bajo los principios REST, utilizando métodos semánticos y códigos de estado estándar.

**Auth Service (Puerto 3001)**
* `POST /api/auth/register`: Registro de nuevos usuarios.
* `POST /api/auth/login`: Autenticación y generación de token JWT.

**Core Service (Puerto 3002)**
* `POST /api/capsules`: Creación de cápsulas de contención.
* `GET /api/recommendations`: Motor de filtrado de cápsulas por emoción.
* `POST /api/crisis`: Registro inicial de una crisis. Retorna HTTP 201.
* `PUT /api/crisis/:id/reflection`: Cierre transaccional de crisis. Retorna HTTP 200.

**Report Service (Puerto 3003)**
* `GET /api/reports/clinical`: Generación de telemetría clínica consolidada.

## 6. Instalación y Despliegue Local

### Requisitos Previos
* Node.js v18+ y Flutter SDK v3.41+
* Instancia de PostgreSQL en ejecución.

### Pasos de Ejecución
1. Clonar los repositorios de backend y frontend.
2. Configurar el archivo `.env` en la raíz del backend con las siguientes variables:
   ```env
   DATABASE_URL="postgresql://usuario:password@localhost:5432/seedb"
   JWT_SECRET="clave_secreta_para_firmar_tokens"
