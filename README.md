# Nature Earth 🌍

Plataforma web educativa para consulta de biodiversidad mundial.

## Estructura del monorepo

```
NatureEarth/
├── backend/     → API REST (Java 17+ / Spring Boot 3)
├── frontend/    → Aplicación web (React 18 + TypeScript + Vite)
├── docs/        → Documentación del proyecto (SRS, metodología, tecnologías)
└── BaseDeDatos/ → Esquema SQL
```

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS · Globe.gl |
| Backend | Java 21 · Spring Boot 3.x · Spring Security · Spring Data JPA |
| Base de datos | PostgreSQL 15+ · PostGIS (hosting: Supabase) |
| APIs externas | iNaturalist · IUCN Red List · NCBI Taxonomy · Semantic Scholar |

## Modelo de suscripción

| Plan | Costo | Chatbot | Información |
|------|-------|---------|-------------|
| Casual | Gratis | No | Básica |
| Estudiante | Suscripción | Sí | Intermedia |
| Investigador | Suscripción | Sí | Avanzada + cuidados |

## Requisitos

- Java 21
- Node.js 20+
- PostgreSQL 15+ (local) o Supabase (nube)

## Cómo correr el backend

```bash
cd backend
./mvnw spring-boot:run
```

La API queda en `http://localhost:8080` · Swagger UI en `http://localhost:8080/swagger-ui.html`

## Cómo correr el frontend

```bash
cd frontend
npm install
npm run dev
```

La app queda en `http://localhost:5173`

## Equipo

- Sergio Andrés Losada Lavao — Product Owner / Full Stack
- Michael Steven Cardenas Ruiz — Scrum Master / Backend
- José Ángel Mejía Pérez — Dev Team / Frontend