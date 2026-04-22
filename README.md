# SEE / AWOS - Sistema de Estabilización Emocional (Full Stack)

**Institución:** Universidad Politécnica de Chiapas
**Desarrolladores:** Jaitovich Bisnaud Jimenez (Kikis) y Antonio de Hoyos Hernandez
**Versión:** 1.0.0
**Arquitectura Global:** Service-Oriented Architecture (SOA) + Clean Architecture (MVVM)

---

## 1. ¿Qué es el proyecto?
El Sistema de Estabilización Emocional (**SEE / AWOS** - *A Way Out of Suffering*) es una plataforma integral de grado clínico diseñada para la intervención inmediata en crisis de salud mental. Su propósito principal es brindar contención emocional de baja latencia a través de técnicas de respiración guiadas, cápsulas multimedia personalizadas y el registro de victorias diarias, operando sobre una infraestructura segura y de alta disponibilidad.

## 2. ¿Cómo funciona? (Flujo del Sistema)
El sistema opera mediante una separación estricta de responsabilidades entre el cliente móvil y el servidor:

1. **Interacción del Usuario (Frontend):** El usuario ingresa a la app móvil construida en Flutter. La interfaz, gestionada por el patrón **Provider**, reacciona a los estados de la aplicación.
2. **Consumo de Servicios:** La capa de dominio de la app hace peticiones HTTP (RESTful) hacia los microservicios del backend. El estado de la red y las respuestas (ej. 200 OK, 401 Unauthorized) son interceptadas y manejadas para no colapsar la interfaz.
3. **Procesamiento de Negocio (Backend):** Los microservicios en Node.js procesan la solicitud. Por ejemplo, si el usuario registra una crisis, el *Core Service* calcula la intensidad y busca recursos multimedia en AWS S3.
4. **Persistencia (Base de Datos):** El backend utiliza transacciones atómicas (ACID) a través de Prisma ORM para escribir en PostgreSQL. Esto asegura que si una "Crisis" se cierra, la "Victoria" correspondiente se registre simultáneamente; si ocurre un fallo, se hace un *rollback* para mantener la integridad del historial clínico.

## 3. Arquitectura y Stack Tecnológico

El proyecto se divide en dos grandes ecosistemas:

### Frontend (Cliente Móvil)
* **Lenguaje y Framework:** Dart 3.2+ y Flutter 3.41.0.
* **Patrón de Diseño:** Model-View-ViewModel (MVVM) con principios de Clean Architecture.
* **Gestión de Estado:** `provider` para inyección de dependencias y reactividad.
* **Seguridad Local:** `flutter_secure_storage` para la persistencia del token JWT.
* **Red:** Peticiones asíncronas con `http` y `dio`.

### Backend (Microservicios SOA)
* **Lenguaje y Entorno:** TypeScript y Node.js (Express.js).
* **Microservicios Implementados:**
  * `Auth Service (3001)`: Gestión de identidades, JWT y seguridad TOTP.
  * `Core Service (3002)`: Lógica de crisis, recomendaciones y conexión S3.
  * `Report Service (3003)`: Generación de telemetría y PDFs clínicos.
* **Base de Datos:** PostgreSQL.
* **ORM:** Prisma (Gestión de esquemas, migraciones y transacciones atómicas).
* **Infraestructura Cloud:** AWS S3 (Buckets para audio/imágenes).

## 4. Instalación y Despliegue Local

### Requisitos Previos
* Node.js v18+ y Flutter SDK v3.41+
* Instancia local o remota de PostgreSQL.

### Pasos de Ejecución
1. **Base de Datos:** Clonar el backend, configurar las credenciales en el archivo `.env` y ejecutar la sincronización del esquema:
   ```bash
   npx prisma generate
   npx prisma db push
