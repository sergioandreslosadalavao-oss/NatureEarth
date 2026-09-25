<p align="center">
  <img src="https://raw.githubusercontent.com/sergioandreslosadalavao-oss/NatureEarth/main/frontend/public/earth.svg" width="120" alt="Nature Earth" />
</p>

<h1 align="center">🌍 Nature Earth</h1>

<p align="center">
  <b>Explora la biodiversidad del planeta en un globo 3D interactivo</b><br/>
  Plataforma web educativa para consulta de especies de fauna — Proyecto SENA
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=for-the-badge&labelColor=0d1420" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=for-the-badge&labelColor=0d1420" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Java-21-f89820?logo=openjdk&logoColor=white&style=for-the-badge&labelColor=0d1420" alt="Java 21" />
  <img src="https://img.shields.io/badge/Spring%20Boot-4.1-6DB33F?logo=spring&logoColor=white&style=for-the-badge&labelColor=0d1420" alt="Spring Boot 4.1" />
  <img src="https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white&style=for-the-badge&labelColor=0d1420" alt="PostgreSQL 18" />
  <img src="https://img.shields.io/badge/PostGIS-3-%234169E1?logo=postgresql&logoColor=white&style=for-the-badge&labelColor=0d1420" alt="PostGIS" />
  <img src="https://img.shields.io/badge/Three.js-Globe.gl-black?logo=threedotjs&logoColor=white&style=for-the-badge&labelColor=0d1420" alt="Globe.gl" />
</p>

---

## ✨ ¿Qué es Nature Earth?

Una plataforma educativa donde la **biodiversidad vive en un globo 3D**: explorás especies de todo el mundo, cada dato verificado y **con su fuente citada** (iNaturalist · IUCN Red List · NCBI Taxonomy · Semantic Scholar).

**El globo es la interfaz.** Marcadores de colores por categoría taxonómica, click para volar hasta la especie, y un chatbot que responde solo con datos de la base curada.

### 🧭 Cómo funciona

| 1. Explorá | 2. Conocé | 3. Desbloqueá |
|---|---|---|
| Gira el globo, zoom con scroll, tocá los marcadores | Ficha con fuente citada en cada dato | Planes de suscripción con más profundidad |

## 🚀 Quick path

```bash
# 1. Backend (puerto 8080)
cd backend && ./mvnw spring-boot:run

# 2. Frontend (puerto 5173 — terminal aparte)
cd frontend && npm install && npm run dev

# 3. Abrí http://localhost:5173
```

> Requisitos: Java 21 · Node.js 20+ · PostgreSQL 15+ (con PostGIS y pgvector)

## 📦 Stack

| Capa | Tecnología | Detalle |
|------|-----------|---------|
| **Frontend** | React 19 · TypeScript · Vite 8 | Globe.gl, Tailwind CSS, Zustand, Axios, React Router |
| **Backend** | Java 21 · Spring Boot 4.1 | Spring Security + JWT, Spring Data JPA, SpringDoc (Swagger) |
| **Base de datos** | PostgreSQL 18 · PostGIS · pgvector | Vistas por plan, búsqueda tolerante y semántica |
| **APIs externas** | iNaturalist · IUCN · NCBI · Semantic Scholar | Consumidas por el agente de recolección (24h) |

## 💳 Modelo de suscripción

| Plan | Costo | Chatbot | Información |
|------|-------|:-------:|-------------|
| **Casual** | Gratis (registro por defecto) | ❌ | Nombre, distribución, observaciones, imágenes |
| **Estudiante** | Suscripción | ✅ | + Fisionomía, hábitat, alimentación, estado IUCN |
| **Investigador** | Suscripción | ✅ | + Taxonomía NCBI, población, amenazas, papers, cuidados |

> **Principio de confiabilidad:** todo dato mostrado tiene su fuente citada. Si un dato no tiene fuente confiable, no se muestra.

## 📁 Estructura del monorepo

```
NatureEarth/
├── backend/          → API REST (Spring Boot 4.1 · Java 21)
├── frontend/         → Aplicación web (React 19 · TypeScript · Vite)
├── BaseDeDatos/      → Esquema SQL completo + seed de especies
└── elicitacion NatureEarth/
    ├── SRS/          → Especificación de Requisitos de Software (v3.0)
    ├── Metodologias/ → Scrum, sprints y planificación
    ├── Tecnologias/  → Stack y APIs externas
    ├── Sergio/       → Stack tecnológico y agentes
    └── Elicitacion de preguntas/ → Instrumentos de entrevista
```

## 🔌 Endpoints principales

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| `POST` | `/api/auth/register` | Público | Registro (siempre crea plan CASUAL) |
| `POST` | `/api/auth/login` | Público | Login → JWT |
| `GET` | `/api/species` | Público | Listado paginado con filtros |
| `GET` | `/api/species/{id}` | Público (detalle según plan con token) | Ficha de especie |
| `GET` | `/api/globe/markers` | Público | Marcadores para el globo 3D |
| `GET` | `/api/user/me` | JWT | Perfil del usuario |
| `POST` | `/api/user/upgrade` | JWT | Suscripción a Estudiante/Investigador |

Swagger UI disponible en `http://localhost:8080/swagger-ui.html`

## 👥 Equipo

| Rol | Integrante | Enfoque |
|-----|-----------|---------|
| 🧭 Product Owner · Full Stack | **Sergio Andrés Losada Lavao** | Visión, frontend, agente de recolección |
| ⚙️ Scrum Master · Backend | **Michael Steven Cardenas Ruiz** | API, seguridad, base de datos |
| 🎨 Dev Team · Frontend | **José Ángel Mejía Pérez** | Interfaz, globo 3D, experiencia de usuario |

## 🗺️ Roadmap

- [x] Globo 3D con marcadores de especies reales
- [x] Autenticación JWT con planes
- [x] Detalle con fuente citada por dato
- [ ] Agente de recolección automática (24h)
- [ ] Chatbot con respuestas de la base curada
- [ ] CI/CD + deploy en Vercel + Render + Supabase

---

<p align="center"><i>Hecho con 💚 para descubrir y conservar la biodiversidad del planeta</i></p>