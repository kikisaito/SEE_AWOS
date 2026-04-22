# SEE / AWOS - Sistema de Estabilización Emocional (Backend API)

**Institución:** Universidad Politécnica de Chiapas
**Desarrolladores:** Jaitovich Bisnaud Jimenez (Kikis), Antonio de Hoyos Hernandez
**Versión:** 1.0.0
**Arquitectura:** Service-Based Architecture (SOA) / Monorepo

## 1. Descripción del Proyecto
El backend del Sistema de Estabilización Emocional (SEE/AWOS) es una API RESTful diseñada para dar soporte clínico, registros de hábitos y contención de crisis emocionales. El sistema permite el registro de usuarios, seguimiento de métricas de salud mental, almacenamiento de recursos multimedia en la nube y generación de reportes clínicos automatizados en formato PDF.

## 2. Arquitectura de Microservicios
El proyecto fue construido bajo un enfoque de Arquitectura Basada en Servicios (SOA) utilizando un patrón Monorepo para facilitar el desarrollo local y mantener el acoplamiento débil entre dominios. El sistema se compone de tres microservicios independientes:

* **Auth Service (Puerto 3001):** Gestiona la autenticación, generación de JWT y seguridad multifactor (TOTP).
* **Core Service (Puerto 3002):** Maneja la lógica de negocio, el ciclo de vida de las crisis, la gestión de cápsulas (integración con AWS S3) y el motor de recomendaciones.
* **Report Service (Puerto 3003):** Microservicio especializado en la generación de reportes clínicos en formato PDF.

## 3. Stack Tecnológico
* **Backend:** Node.js con TypeScript y Express.js.
* **Persistencia:** PostgreSQL gestionado a través de Prisma ORM (Transacciones ACID).
* **Infraestructura:** AWS S3 (Almacenamiento de archivos) y Render/Vercel (Despliegue).

## 4. Especificación de la API (API Spec)
La API sigue principios REST, utiliza métodos HTTP semánticos y códigos de estado estandarizados.

### Auth Service (Puerto 3001)
* `POST /api/auth/register`: Registro de nuevos usuarios. Retorna 201 o 400.
* `POST /api/auth/login`: Autenticación y entrega de token JWT. Retorna 200 o 401.

### Core Service (Puerto 3002)
* `GET /api/s3/presigned-url`: Obtención de URLs firmadas para carga de archivos en S3.
* `POST /api/capsules`: Creación de cápsulas de contención (Audio/Texto).
* `GET /api/recommendations`: Motor de filtrado de cápsulas por ID de emoción.
* `POST /api/crisis`: Inicio de una sesión de crisis e intensidad inicial. Retorna 201.
* `PUT /api/crisis/:id/reflection`: Cierre transaccional de crisis y registro de reflexión. Retorna 200 o 404.

### Report Service (Puerto 3003)
* `GET /api/reports/clinical`: Generación de telemetría clínica consolidada.

## 5. Instalación y Ejecución
Para reproducir el entorno de desarrollo localmente:

1. Clonar el repositorio.
2. Ejecutar `npm install` en la raíz de cada microservicio.
3. Configurar el motor de base de datos PostgreSQL.
4. Ejecutar `npx prisma generate` y `npx prisma db push` para sincronizar el esquema.
5. Iniciar los servicios ejecutando `npm run dev`.

## 6. Variables de Entorno (.env)
Es estricto configurar los siguientes parámetros en la raíz del proyecto para la conexión a bases de datos y servicios en la nube:

```env
DATABASE_URL="postgresql://USUARIO:PASSWORD@localhost:5432/seedb"
JWT_SECRET="clave_secreta_para_tokens"
AWS_ACCESS_KEY_ID="credencial_aws"
AWS_SECRET_ACCESS_KEY="secreto_aws"
AWS_REGION="us-east-1"
S3_BUCKET_NAME="nombre_del_bucket"
