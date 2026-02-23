# SEE / AWOS - Sistema de Estabilización Emocional (Backend API)

**Institución:** Universidad Politécnica de Chiapas
**Desarrollador:** Jaitovich Bisnaud Jimenez
**Versión:** 1.0.0
**Arquitectura:** Service-Based Architecture (SOA) / Monorepo

## Descripción del Proyecto

El backend del Sistema de Estabilización Emocional (SEE/AWOS) es una API RESTful diseñada para dar soporte clínico, gamificación de hábitos y contención de crisis emocionales. El sistema permite el registro de usuarios, seguimiento de métricas de salud mental, almacenamiento de recursos multimedia en la nube y generación de reportes clínicos automatizados en formato PDF.

## Arquitectura de Microservicios

El proyecto fue construido bajo un enfoque de Arquitectura Basada en Servicios (SBA) utilizando un patrón Monorepo para facilitar el desarrollo local y mantener el acoplamiento débil entre dominios.

El sistema se compone de tres microservicios independientes:

1. **Auth Service (Puerto 3001):**
   * **Responsabilidad:** Gestión de identidad, registro de usuarios, encriptación de credenciales y emisión de tokens (JWT).
   * **Endpoint Base:** `/api/auth`

2. **Core Service (Puerto 3002):**
   * **Responsabilidad:** Motor principal de la aplicacion. Gestiona las sesiones de crisis, el catálogo de victorias, la lógica de recomendación de cápsulas terapéuticas y la integración con el almacenamiento en la nube.
   * **Endpoint Base:** `/api/crisis`, `/api/capsules`, `/api/victories`, `/api/s3`, `/api/users`

3. **Report Service (Puerto 3003):**
   * **Responsabilidad:** Aislamiento de procesos de cómputo intensivo. Genera documentos clínicos y analíticos en formato vectorial mediante flujos de datos en tiempo real.
   * **Endpoint Base:** `/api/reports`

## Stack Tecnológico

* **Entorno de Ejecución:** Node.js
* **Framework Web:** Express.js
* **Lenguaje:** TypeScript (Tipado estricto)
* **Base de Datos:** PostgreSQL
* **ORM:** Prisma ORM
* **Seguridad y Autenticación:** JSON Web Tokens (JWT) y Bcrypt.js
* **Infraestructura Cloud:** Amazon Web Services (AWS) S3 para almacenamiento de objetos (Presigned URLs)
* **Generación de Documentos:** PDFKit

## Configuración y Despliegue Local

### Requisitos Previos
* Node.js (v18 o superior)
* PostgreSQL instalado y ejecutándose localmente o en la nube
* Credenciales de acceso a AWS IAM con permisos de escritura en S3

### Variables de Entorno (.env)
Se debe crear un archivo `.env` en la raíz del proyecto con las siguientes configuraciones:
DATABASE_URL="postgresql://usuario:password@localhost:5432/see_db"
JWT_SECRET="tu_clave_secreta"
AWS_REGION="tu_region"
AWS_ACCESS_KEY_ID="tu_access_key"
AWS_SECRET_ACCESS_KEY="tu_secret_key"
AWS_BUCKET_NAME="tu_bucket"
AUTH_PORT=3001
CORE_PORT=3002
REPORT_PORT=3003

### Instalación

1. Instalar las dependencias del proyecto:
   `npm install`

2. Generar el cliente de Prisma y ejecutar las migraciones de la base de datos:
   `npx prisma generate`
   `npx prisma migrate dev`

3. Iniciar el clúster de microservicios en entorno de desarrollo:
   `npm run dev`

El comando anterior utiliza la herramienta `concurrently` para levantar los tres servicios de manera simultánea en la terminal.
