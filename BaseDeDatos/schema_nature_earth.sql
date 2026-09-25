-- ═══════════════════════════════════════════════════════════════════
--  NATURE EARTH — Esquema de Base de Datos
--  PostgreSQL 15+ + PostGIS
--  Versión 1.0
--
--  Estructura en 3 capas:
--    1. Datos crudos recolectados (species, conservation, taxonomy, papers)
--    2. Acceso por plan mediante vistas SQL
--    3. Capa geoespacial y búsqueda (PostGIS, pg_trgm, pgvector)
--
--  Principio: todo dato tiene su fuente citada en species_sources.
--  Si un dato no tiene fuente confiable, no se muestra.
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- ═══════════════════════════════════════════════════════════════════
--  0. EXTENSIONES
-- ═══════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS postgis;          -- Consultas geoespaciales (globo 3D)
CREATE EXTENSION IF NOT EXISTS pg_trgm;          -- Búsqueda por nombre tolerante a errores
CREATE EXTENSION IF NOT EXISTS vector;           -- Búsqueda semántica (chatbot)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- IDs UUID

-- ═══════════════════════════════════════════════════════════════════
--  1. USUARIOS Y SUSCRIPCIONES
-- ═══════════════════════════════════════════════════════════════════

-- Tipos enumerados
CREATE TYPE user_role AS ENUM ('ADMIN', 'COMMON');
CREATE TYPE user_plan AS ENUM ('CASUAL', 'STUDENT', 'RESEARCHER');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED');

-- Tabla de usuarios: todo registro nuevo queda por defecto en plan CASUAL
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(255)         NOT NULL,
    email         VARCHAR(255)         NOT NULL UNIQUE,
    password_hash VARCHAR(255)         NOT NULL,
    role          user_role            NOT NULL DEFAULT 'COMMON',
    plan          user_plan            NOT NULL DEFAULT 'CASUAL',
    created_at    TIMESTAMP            NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP            NOT NULL DEFAULT NOW()
);

-- Tabla de suscripciones: un usuario puede tener UNA suscripción activa
CREATE TABLE subscriptions (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan       user_plan           NOT NULL,
    start_date TIMESTAMP           NOT NULL DEFAULT NOW(),
    end_date   TIMESTAMP,
    status     subscription_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- Índice: una sola suscripción activa por usuario
CREATE UNIQUE INDEX idx_active_subscription
    ON subscriptions (user_id)
    WHERE status = 'ACTIVE';

-- ═══════════════════════════════════════════════════════════════════
--  2. ESPECIES (NÚCLEO DE DATOS)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE species (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scientific_name  VARCHAR(255) NOT NULL UNIQUE,
    common_name_es   VARCHAR(255),
    common_name_en   VARCHAR(255),
    category         VARCHAR(100),            -- Mammalia, Aves, Reptilia...
    image_url        TEXT,                    -- Imagen verificada de iNaturalist
    observations_count INTEGER DEFAULT 0,     -- Observaciones registradas
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    -- Embedding semántico de la especie para búsqueda por significado
    name_embedding   vector(384)
);

-- Datos de conservación (fuente: IUCN Red List)
CREATE TABLE conservation (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    species_id         UUID NOT NULL REFERENCES species(id) ON DELETE CASCADE,
    conservation_status VARCHAR(50),          -- CR, EN, VU, NT, LC...
    habitat            TEXT,
    diet               TEXT,
    morphology         TEXT,                  -- Fisionomía (plan Estudiante+)
    population_estimate BIGINT,               -- Población estimada (plan Investigador)
    threats            TEXT,                  -- Amenazas específicas (plan Investigador)
    care_wild          TEXT,                  -- Conservación en la naturaleza (plan Investigador)
    care_captivity     TEXT,                  -- Cuidados en cautiverio/rehabilitación (plan Investigador)
    fetched_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (species_id)
);

-- Datos taxonómicos oficiales (fuente: NCBI Taxonomy)
CREATE TABLE taxonomy (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    species_id    UUID NOT NULL REFERENCES species(id) ON DELETE CASCADE,
    kingdom       VARCHAR(100),
    phylum        VARCHAR(100),
    class         VARCHAR(100),
    order_name    VARCHAR(100),
    family        VARCHAR(100),
    genus         VARCHAR(100),
    ncbi_taxon_id BIGINT,                      -- ID oficial en NCBI
    fetched_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (species_id)
);

-- Papers científicos (fuente: Semantic Scholar)
CREATE TABLE papers (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    species_id        UUID NOT NULL REFERENCES species(id) ON DELETE CASCADE,
    title             TEXT NOT NULL,
    authors           TEXT,
    year              INTEGER,
    doi               VARCHAR(255),
    url               TEXT,
    fetched_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice de papers por especie
CREATE INDEX idx_papers_species ON papers (species_id);

-- ═══════════════════════════════════════════════════════════════════
--  3. TRAZABILIDAD DE FUENTES (principio de confiabilidad)
-- ═══════════════════════════════════════════════════════════════════

-- Registra qué fuente proveyó cada dato de cada especie
CREATE TABLE species_sources (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    species_id  UUID NOT NULL REFERENCES species(id) ON DELETE CASCADE,
    field_name  VARCHAR(100) NOT NULL,          -- conservation_status, habitat...
    source_name VARCHAR(100) NOT NULL,          -- iNaturalist, IUCN, NCBI, Semantic Scholar
    reference   TEXT,                           -- Referencia específica / URL
    fetched_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sources_species ON species_sources (species_id);

-- ═══════════════════════════════════════════════════════════════════
--  4. CAPA GEOESPACIAL (GLOBO 3D)
-- ═══════════════════════════════════════════════════════════════════

-- Ubicaciones / observaciones de una especie con coordenadas reales
CREATE TABLE species_locations (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    species_id  UUID NOT NULL REFERENCES species(id) ON DELETE CASCADE,
    place_name  VARCHAR(255),                   -- Colombia, Bogotá...
    geom        GEOGRAPHY(POINT, 4326) NOT NULL, -- Coordenadas para el globo
    is_default  BOOLEAN DEFAULT FALSE,           -- Ubicación principal mostrada
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice geoespacial para consultas rápidas del globo
CREATE INDEX idx_locations_geom ON species_locations USING GIST (geom);

-- Índice por especie
CREATE INDEX idx_locations_species ON species_locations (species_id);

-- ═══════════════════════════════════════════════════════════════════
--  5. CHATBOT Y ACTIVIDAD
-- ═══════════════════════════════════════════════════════════════════

-- Historial de conversaciones del chatbot (planes Estudiante+)
CREATE TABLE chat_history (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    message    TEXT NOT NULL,
    response   TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_user ON chat_history (user_id);

-- Actividad de usuario para el algoritmo de recomendaciones
CREATE TABLE user_activity (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    action     VARCHAR(100) NOT NULL,           -- view_species, search, chat...
    species_id UUID REFERENCES species(id) ON DELETE SET NULL,
    timestamp  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON user_activity (user_id);
CREATE INDEX idx_activity_species ON user_activity (species_id);

-- ═══════════════════════════════════════════════════════════════════
--  6. ÍNDICES DE BÚSQUEDA
-- ═══════════════════════════════════════════════════════════════════

-- Búsqueda por nombre tolerante a errores: "javali" encuentra "jaguardi"
CREATE INDEX idx_species_name_trgm
    ON species USING GIN
    (common_name_es gin_trgm_ops, common_name_en gin_trgm_ops, scientific_name gin_trgm_ops);

-- Búsqueda semántica para el chatbot (pgvector)
CREATE INDEX idx_species_embedding
    ON species USING ivfflat (name_embedding vector_cosine_ops);

-- Búsqueda por categoría
CREATE INDEX idx_species_category ON species (category);

-- ═══════════════════════════════════════════════════════════════════
--  7. VISTAS POR PLAN (seguridad a nivel de base de datos)
-- ═══════════════════════════════════════════════════════════════════
--  El backend elige qué vista consultar según el plan del usuario.
--  Así es imposible que un plan acceda a datos de otro.

-- Plan CASUAL: solo información básica
CREATE VIEW v_species_casual AS
SELECT
    s.id,
    s.scientific_name,
    s.common_name_es,
    s.common_name_en,
    s.category,
    s.image_url,
    s.observations_count
FROM species s;

-- Plan ESTUDIANTE: básico + intermedio (fisionomía, hábitat, alimentación, estado)
CREATE VIEW v_species_student AS
SELECT
    s.id,
    s.scientific_name,
    s.common_name_es,
    s.common_name_en,
    s.category,
    s.image_url,
    s.observations_count,
    c.conservation_status,
    c.habitat,
    c.diet,
    c.morphology
FROM species s
LEFT JOIN conservation c ON c.species_id = s.id;

-- Plan INVESTIGADOR: todo (taxonomía, población, amenazas, papers, cuidados)
CREATE VIEW v_species_researcher AS
SELECT
    s.id,
    s.scientific_name,
    s.common_name_es,
    s.common_name_en,
    s.category,
    s.image_url,
    s.observations_count,
    c.conservation_status,
    c.habitat,
    c.diet,
    c.morphology,
    c.population_estimate,
    c.threats,
    c.care_wild,
    c.care_captivity,
    t.kingdom, t.phylum, t.class, t.order_name, t.family, t.genus,
    t.ncbi_taxon_id
FROM species s
LEFT JOIN conservation c ON c.species_id = s.id
LEFT JOIN taxonomy t      ON t.species_id   = s.id;

-- Vista de fuentes: cada dato con su fuente citada
CREATE VIEW v_species_with_sources AS
SELECT
    s.id,
    s.scientific_name,
    s.common_name_es,
    sf.field_name,
    sf.source_name,
    sf.reference
FROM species s
LEFT JOIN species_sources sf ON sf.species_id = s.id;

-- ═══════════════════════════════════════════════════════════════════
--  8. FUNCIONES Y TRIGGERS
-- ═══════════════════════════════════════════════════════════════════

-- Actualiza updated_at automáticamente
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_species_updated_at
    BEFORE UPDATE ON species
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Al activar una suscripción, actualiza el plan del usuario
CREATE OR REPLACE FUNCTION apply_subscription_plan()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'ACTIVE' THEN
        UPDATE users SET plan = NEW.plan WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_subscription_apply_plan
    AFTER INSERT OR UPDATE OF status ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION apply_subscription_plan();

-- ═══════════════════════════════════════════════════════════════════
--  9. DATOS DE EJEMPLO (opcional — para desarrollo)
-- ═══════════════════════════════════════════════════════════════════

-- Usuario administrador por defecto (password: admin123, debe cambiarse)
INSERT INTO users (name, email, password_hash, role, plan) VALUES
('Administrador', 'admin@natureearth.app', 'HASH_BCRYPT_AQUI', 'ADMIN', 'RESEARCHER');

-- Especie de ejemplo: Jaguardi
INSERT INTO species (scientific_name, common_name_es, common_name_en, category, image_url, observations_count) VALUES
('Panthera onca', 'Jaguardi', 'Jaguar', 'Mammalia', 'https://static.inaturalist.org/photos/1.jpg', 15234);

INSERT INTO conservation (species_id, conservation_status, habitat, diet, morphology, population_estimate, threats, care_wild, care_captivity) VALUES
(
    (SELECT id FROM species WHERE scientific_name = 'Panthera onca'),
    'NT',
    'Selvas tropicales, bosques ribereños, pantanos',
    'Carnívoro: venados, pecaríes, capibaras',
    'Mayor felino de América, cuerpo robusto, manchas en roseta',
    64000,
    'Pérdida de hábitat, caza furtiva, conflicto con ganaderos',
    'Evitar acercamiento; contactar autoridades ambientales si se encuentra herido',
    'Requiere recinto grande, dieta carnívora balanceada y enriquecimiento ambiental'
);

INSERT INTO taxonomy (species_id, kingdom, phylum, class, order_name, family, genus, ncbi_taxon_id) VALUES
(
    (SELECT id FROM species WHERE scientific_name = 'Panthera onca'),
    'Animalia', 'Chordata', 'Mammalia', 'Carnivora', 'Felidae', 'Panthera', 30600
);

-- Fuentes citadas
INSERT INTO species_sources (species_id, field_name, source_name, reference) VALUES
((SELECT id FROM species WHERE scientific_name = 'Panthera onca'), 'image_url', 'iNaturalist', 'https://www.inaturalist.org/taxa/41963'),
((SELECT id FROM species WHERE scientific_name = 'Panthera onca'), 'conservation_status', 'IUCN', 'https://www.iucnredlist.org/species/15953/50654693'),
((SELECT id FROM species WHERE scientific_name = 'Panthera onca'), 'ncbi_taxon_id', 'NCBI', 'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=30600');

-- Ubicación de ejemplo
INSERT INTO species_locations (species_id, place_name, geom, is_default) VALUES
((SELECT id FROM species WHERE scientific_name = 'Panthera onca'), 'Colombia', ST_SetSRID(ST_MakePoint(-74.2973, 4.5709), 4326), TRUE);

COMMIT;

-- ═══════════════════════════════════════════════════════════════════
--  RESUMEN DE CONSULTAS ÚTILES
-- ═══════════════════════════════════════════════════════════════════

-- Búsqueda con tolerancia a errores (pg_trgm)
-- SELECT * FROM v_species_casual
-- WHERE common_name_es % 'javali';

-- Búsqueda semántica (pgvector) — el chatbot responde por significado
-- SELECT * FROM species
-- ORDER BY name_embedding <=> $1
-- LIMIT 5;

-- Especies por región (PostGIS)
-- SELECT s.common_name_es FROM species s
-- JOIN species_locations l ON l.species_id = s.id
-- WHERE ST_DWithin(l.geom, ST_MakePoint(-74.2973, 4.5709)::geography, 500000);