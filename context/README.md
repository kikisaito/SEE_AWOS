# Documentación Técnica AWOS

Esta carpeta contiene la documentación técnica completa del proyecto AWOS en dos formatos:

## Archivos

### 1. `documentacion_tecnica.tex`
**Formato:** LaTeX con fuente Arial
**Propósito:** Documentación formal y profesional para presentaciones e informes

**Compilación:**
```bash
# Requiere LaTeX con XeLaTeX para soporte de fuentes
xelatex documentacion_tecnica.tex
```

**Requisitos:**
- XeLaTeX (para fuente Arial)
- Paquetes: fontspec, babel, geometry, xcolor, listings, hyperref, enumitem

**Contenido:**
- Resumen ejecutivo
- Arquitectura completa del proyecto
- Documentación de cada capa (Models, Services, Providers, UI)
- Diagramas de flujo
- Tablas de configuración
- Code snippets formateados

### 2. `documentacion_tecnica.json`
**Formato:** JSON estructurado
**Propósito:** Documentación procesable para herramientas y análisis automático

**Uso:**
```bash
# Leer con jq
cat documentacion_tecnica.json | jq '.estructura.lib.models'

# Extraer dependencias
cat documentacion_tecnica.json | jq '.dependencias'

# Ver flujos de usuario
cat documentacion_tecnica.json | jq '.flujos'
```

**Contenido:**
- Estructura completa del proyecto en formato jerárquico
- Metadatos de cada componente
- Flujos de usuario documentados
- Dependencias con versiones
- Estado de etapas completadas

## Etapas Documentadas

### Etapa 1: Cimientos, Modelos y Servicio Mock
- ✅ Estructura de carpetas
- ✅ 7 modelos de datos
- ✅ Servicios (Base, Mock, HTTP)
- ✅ Theme y Constants

### Etapa 2: Autenticación
- ✅ LoginScreen
- ✅ RegisterScreen
- ✅ HomeScreen
- ✅ Navegación condicional
- ✅ State management

## Uso Recomendado

**LaTeX:**
- Presentaciones formales
- Documentación para entregas universitarias
- Informes técnicos impresos

**JSON:**
- Procesamiento automatizado
- Extracción de métricas
- Integración con herramientas de análisis
- Consultas programáticas

## Actualización

Estos documentos deben actualizarse al completar cada nueva etapa del proyecto.

---

**Proyecto:** AWOS - A Way Out of Suffering
**Versión:** 1.0
**Fecha:** 2026-02-13
