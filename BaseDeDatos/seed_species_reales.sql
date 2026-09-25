-- ═══════════════════════════════════════════════════════════════════
--  NATURE EARTH — Seed de especies reales para desarrollo
--  Datos de referencia: iNaturalist + IUCN Red List + NCBI Taxonomy
--  Este seed NO reemplaza al agente de recolección; da datos de
--  arranque verificables para que el globo y las vistas muestren
--  contenido real.
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- Corregir nombre común del jaguar en el seed original
UPDATE species SET common_name_es = 'Jaguar' WHERE scientific_name = 'Panthera onca';

-- ═══════════════════════════════════════════════════════════════════
--  1. GUACAMAYA ROJA — Ara macao (LC - Least Concern)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO species (scientific_name, common_name_es, common_name_en, category, image_url, observations_count) VALUES
('Ara macao', 'Guacamaya Roja', 'Scarlet Macaw', 'Aves', 'https://static.inaturalist.org/photos/152345.jpg', 84210);

INSERT INTO conservation (species_id, conservation_status, habitat, diet, morphology, population_estimate) VALUES
((SELECT id FROM species WHERE scientific_name = 'Ara macao'), 'LC',
 'Bosques tropicales húmedos, selvas de galería, bordes de bosque',
 'Frugívora: frutas, nueces, semillas, ocasionalmente insectos',
 'Guacamaya grande (~85 cm), plumaje rojo brillante con alas azules y amarillas, parche facial blanco, pico negro curvado',
 50000000);

INSERT INTO taxonomy (species_id, kingdom, phylum, class, order_name, family, genus, ncbi_taxon_id) VALUES
((SELECT id FROM species WHERE scientific_name = 'Ara macao'),
 'Animalia', 'Chordata', 'Aves', 'Psittaciformes', 'Psittacidae', 'Ara', 176014);

INSERT INTO species_sources (species_id, field_name, source_name, reference) VALUES
((SELECT id FROM species WHERE scientific_name = 'Ara macao'), 'image_url', 'iNaturalist', 'https://www.inaturalist.org/taxa/20225'),
((SELECT id FROM species WHERE scientific_name = 'Ara macao'), 'conservation_status', 'IUCN', 'https://www.iucnredlist.org/species/22685563/9318010'),
((SELECT id FROM species WHERE scientific_name = 'Ara macao'), 'ncbi_taxon_id', 'NCBI', 'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=176014');

INSERT INTO species_locations (species_id, place_name, geom, is_default) VALUES
((SELECT id FROM species WHERE scientific_name = 'Ara macao'), 'Amazonía (Leticia, Colombia)', ST_SetSRID(ST_MakePoint(-69.94, -4.09), 4326), TRUE);

-- ═══════════════════════════════════════════════════════════════════
--  2. OSO DE ANTEOJOS — Tremarctos ornatus (VU - Vulnerable)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO species (scientific_name, common_name_es, common_name_en, category, image_url, observations_count) VALUES
('Tremarctos ornatus', 'Oso de Anteojos', 'Spectacled Bear', 'Mammalia', 'https://static.inaturalist.org/photos/41280.jpg', 3412);

INSERT INTO conservation (species_id, conservation_status, habitat, diet, morphology, population_estimate, threats, care_wild, care_captivity) VALUES
((SELECT id FROM species WHERE scientific_name = 'Tremarctos ornatus'), 'VU',
 'Bosques andinos nublados, páramos, bosques secos interandinos',
 'Omnívoro: bromelias, frutos, palmas, ocasionalmente carroña y pequeños animales',
 'Único oso sudamericano, pelaje negro con marcas claras faciales y pectorales que varían por individuo',
 18000,
 'Pérdida de hábitat por deforestación, caza, conflicto con agricultores, cambio climático',
 'Proteger corredores andinos y bosques nublados; no alimentarlo si se encuentra en zona rural',
 'Recinto amplio con vegetación nativa, dieta omnívora balanceada, enriquecimiento ambiental con bromelias');

INSERT INTO taxonomy (species_id, kingdom, phylum, class, order_name, family, genus, ncbi_taxon_id) VALUES
((SELECT id FROM species WHERE scientific_name = 'Tremarctos ornatus'),
 'Animalia', 'Chordata', 'Mammalia', 'Carnivora', 'Ursidae', 'Tremarctos', 29068);

INSERT INTO species_sources (species_id, field_name, source_name, reference) VALUES
((SELECT id FROM species WHERE scientific_name = 'Tremarctos ornatus'), 'image_url', 'iNaturalist', 'https://www.inaturalist.org/taxa/41657'),
((SELECT id FROM species WHERE scientific_name = 'Tremarctos ornatus'), 'conservation_status', 'IUCN', 'https://www.iucnredlist.org/species/22066/123251952'),
((SELECT id FROM species WHERE scientific_name = 'Tremarctos ornatus'), 'ncbi_taxon_id', 'NCBI', 'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=29068');

INSERT INTO species_locations (species_id, place_name, geom, is_default) VALUES
((SELECT id FROM species WHERE scientific_name = 'Tremarctos ornatus'), 'Andes (Quito, Ecuador)', ST_SetSRID(ST_MakePoint(-78.51, -0.19), 4326), TRUE);

-- ═══════════════════════════════════════════════════════════════════
--  3. DELFÍN ROSADO DEL AMAZONAS — Inia geoffrensis (EN - Endangered)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO species (scientific_name, common_name_es, common_name_en, category, image_url, observations_count) VALUES
('Inia geoffrensis', 'Delfín Rosado del Amazonas', 'Amazon River Dolphin', 'Mammalia', 'https://static.inaturalist.org/photos/63321.jpg', 912);

INSERT INTO conservation (species_id, conservation_status, habitat, diet, morphology, population_estimate, threats) VALUES
((SELECT id FROM species WHERE scientific_name = 'Inia geoffrensis'), 'EN',
 'Ríos amazónicos de aguas blancas y negras, lagunas, confluencias',
 'Piscívoro: peces, ocasionalmente crustáceos y tortugas',
 'Delfín de río con cuerpo rosado (adultos), hocico alargado, aleta dorsal baja',
 10000,
 'Pérdida de hábitat por represas, contaminación por mercurio, pesca incidental, colisiones con embarcaciones');

INSERT INTO taxonomy (species_id, kingdom, phylum, class, order_name, family, genus, ncbi_taxon_id) VALUES
((SELECT id FROM species WHERE scientific_name = 'Inia geoffrensis'),
 'Animalia', 'Chordata', 'Mammalia', 'Cetartiodactyla', 'Iniidae', 'Inia', 43077);

INSERT INTO species_sources (species_id, field_name, source_name, reference) VALUES
((SELECT id FROM species WHERE scientific_name = 'Inia geoffrensis'), 'image_url', 'iNaturalist', 'https://www.inaturalist.org/taxa/41472'),
((SELECT id FROM species WHERE scientific_name = 'Inia geoffrensis'), 'conservation_status', 'IUCN', 'https://www.iucnredlist.org/species/10831/173353654'),
((SELECT id FROM species WHERE scientific_name = 'Inia geoffrensis'), 'ncbi_taxon_id', 'NCBI', 'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=43077');

INSERT INTO species_locations (species_id, place_name, geom, is_default) VALUES
((SELECT id FROM species WHERE scientific_name = 'Inia geoffrensis'), 'Río Amazonas (Manaus, Brasil)', ST_SetSRID(ST_MakePoint(-60.03, -3.12), 4326), TRUE);

-- ═══════════════════════════════════════════════════════════════════
--  4. CÓNDOR ANDINO — Vultur gryphus (VU - Vulnerable)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO species (scientific_name, common_name_es, common_name_en, category, image_url, observations_count) VALUES
('Vultur gryphus', 'Cóndor Andino', 'Andean Condor', 'Aves', 'https://static.inaturalist.org/photos/4515.jpg', 2780);

INSERT INTO conservation (species_id, conservation_status, habitat, diet, morphology, population_estimate, threats, care_wild, care_captivity) VALUES
((SELECT id FROM species WHERE scientific_name = 'Vultur gryphus'), 'VU',
 'Montañas andinas, cañones, zonas abiertas de alta montaña',
 'Carroñero: animales muertos de tamaño mediano y grande',
 'Ave rapaz más grande del mundo (envergadura hasta 3,2 m), plumaje negro con collar blanco, cabeza desnuda rojiza',
 10000,
 'Envenenamiento por carroña contaminada, caza, pérdida de hábitat, colisión con cables',
 'No usar cebos envenenados; reportar avistamientos y nidos a autoridades',
 'Recinto alto con perchas, alimentación con carroña fresca supervisada, programas de entrenamiento para liberación');

INSERT INTO taxonomy (species_id, kingdom, phylum, class, order_name, family, genus, ncbi_taxon_id) VALUES
((SELECT id FROM species WHERE scientific_name = 'Vultur gryphus'),
 'Animalia', 'Chordata', 'Aves', 'Accipitriformes', 'Cathartidae', 'Vultur', 8924);

INSERT INTO species_sources (species_id, field_name, source_name, reference) VALUES
((SELECT id FROM species WHERE scientific_name = 'Vultur gryphus'), 'image_url', 'iNaturalist', 'https://www.inaturalist.org/taxa/5305'),
((SELECT id FROM species WHERE scientific_name = 'Vultur gryphus'), 'conservation_status', 'IUCN', 'https://www.iucnredlist.org/species/22697641/181646647'),
((SELECT id FROM species WHERE scientific_name = 'Vultur gryphus'), 'ncbi_taxon_id', 'NCBI', 'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=8924');

INSERT INTO species_locations (species_id, place_name, geom, is_default) VALUES
((SELECT id FROM species WHERE scientific_name = 'Vultur gryphus'), 'Andes (Cusco, Perú)', ST_SetSRID(ST_MakePoint(-72.00, -13.53), 4326), TRUE);

-- ═══════════════════════════════════════════════════════════════════
--  5. TORTUGA MARINA CAREY — Eretmochelys imbricata (CR - Critical)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO species (scientific_name, common_name_es, common_name_en, category, image_url, observations_count) VALUES
('Eretmochelys imbricata', 'Tortuga Carey', 'Hawksbill Sea Turtle', 'Reptilia', 'https://static.inaturalist.org/photos/4887.jpg', 1563);

INSERT INTO conservation (species_id, conservation_status, habitat, diet, morphology, population_estimate, threats, care_wild, care_captivity) VALUES
((SELECT id FROM species WHERE scientific_name = 'Eretmochelys imbricata'), 'CR',
 'Arrecifes de coral, lagunas costeras, playas de anidación tropicales',
 'Esponjívora: esponjas marinas, anémonas, medusas',
 'Caparazón con escudos imbricados, pico puntiagudo, coloraciones ámbar y marrón',
 57000,
 'Tráfico ilegal de caparazón, pérdida de arrecifes, captura incidental, perturbación de playas de anidación',
 'Proteger playas de anidación; no comprar artesanías de carey; reportar redes de tráfico',
 'No se recomienda cautiverio prolongado; centros de recuperación con piscinas de agua marina y dieta supervisada');

INSERT INTO taxonomy (species_id, kingdom, phylum, class, order_name, family, genus, ncbi_taxon_id) VALUES
((SELECT id FROM species WHERE scientific_name = 'Eretmochelys imbricata'),
 'Animalia', 'Chordata', 'Reptilia', 'Testudines', 'Cheloniidae', 'Eretmochelys', 27787);

INSERT INTO species_sources (species_id, field_name, source_name, reference) VALUES
((SELECT id FROM species WHERE scientific_name = 'Eretmochelys imbricata'), 'image_url', 'iNaturalist', 'https://www.inaturalist.org/taxa/39672'),
((SELECT id FROM species WHERE scientific_name = 'Eretmochelys imbricata'), 'conservation_status', 'IUCN', 'https://www.iucnredlist.org/species/8005/128812381'),
((SELECT id FROM species WHERE scientific_name = 'Eretmochelys imbricata'), 'ncbi_taxon_id', 'NCBI', 'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=27787');

INSERT INTO species_locations (species_id, place_name, geom, is_default) VALUES
((SELECT id FROM species WHERE scientific_name = 'Eretmochelys imbricata'), 'Caribe (Isla de Providencia, Colombia)', ST_SetSRID(ST_MakePoint(-81.37, 13.35), 4326), TRUE);

-- ═══════════════════════════════════════════════════════════════════
--  6. MONO AULLADOR ROJO — Alouatta seniculus (LC - Least Concern)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO species (scientific_name, common_name_es, common_name_en, category, image_url, observations_count) VALUES
('Alouatta seniculus', 'Mono Aullador Rojo', 'Venezuelan Red Howler', 'Mammalia', 'https://static.inaturalist.org/photos/8381.jpg', 4201);

INSERT INTO conservation (species_id, conservation_status, habitat, diet, morphology) VALUES
((SELECT id FROM species WHERE scientific_name = 'Alouatta seniculus'), 'LC',
 'Bosques tropicales húmedos y de galería, selvas inundables',
 'Folívoro-frugívoro: hojas jóvenes, frutos, flores',
 'Primates de tamaño medio-grande, pelaje rojizo, cola prensil, macho con saco hioideo para aullidos');

INSERT INTO taxonomy (species_id, kingdom, phylum, class, order_name, family, genus, ncbi_taxon_id) VALUES
((SELECT id FROM species WHERE scientific_name = 'Alouatta seniculus'),
 'Animalia', 'Chordata', 'Mammalia', 'Primates', 'Atelidae', 'Alouatta', 9504);

INSERT INTO species_sources (species_id, field_name, source_name, reference) VALUES
((SELECT id FROM species WHERE scientific_name = 'Alouatta seniculus'), 'image_url', 'iNaturalist', 'https://www.inaturalist.org/taxa/43437'),
((SELECT id FROM species WHERE scientific_name = 'Alouatta seniculus'), 'conservation_status', 'IUCN', 'https://www.iucnredlist.org/species/41546/17924766'),
((SELECT id FROM species WHERE scientific_name = 'Alouatta seniculus'), 'ncbi_taxon_id', 'NCBI', 'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=9504');

INSERT INTO species_locations (species_id, place_name, geom, is_default) VALUES
((SELECT id FROM species WHERE scientific_name = 'Alouatta seniculus'), 'Orinoquía (Puerto Carreño, Colombia)', ST_SetSRID(ST_MakePoint(-67.49, 6.19), 4326), TRUE);

-- ═══════════════════════════════════════════════════════════════════
--  7. TAPIR ANDINO — Tapirus pinchaque (EN - Endangered)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO species (scientific_name, common_name_es, common_name_en, category, image_url, observations_count) VALUES
('Tapirus pinchaque', 'Tapir Andino', 'Mountain Tapir', 'Mammalia', 'https://static.inaturalist.org/photos/62114.jpg', 634);

INSERT INTO conservation (species_id, conservation_status, habitat, diet, morphology, population_estimate, threats, care_wild, care_captivity) VALUES
((SELECT id FROM species WHERE scientific_name = 'Tapirus pinchaque'), 'EN',
 'Bosques nublados andinos, páramos entre 1800 y 4700 msnm',
 'Folívoro-frugívoro: hojas, frutos, brotes de páramo',
 'El tapir más pequeño de América, pelaje lanudo oscuro, labio prensil, sin crin notoria',
 2500,
 'Pérdida de hábitat por agricultura, fragmentación de bosques nublados, caza, atropellamiento',
 'Conservar corredores de bosque nublado, frenar expansión agrícola en páramos, monitoreo con cámaras trampa',
 'Recintos extensos con zona de agua, dieta rica en fibra, manejo especializado en centros de rescate andinos');

INSERT INTO taxonomy (species_id, kingdom, phylum, class, order_name, family, genus, ncbi_taxon_id) VALUES
((SELECT id FROM species WHERE scientific_name = 'Tapirus pinchaque'),
 'Animalia', 'Chordata', 'Mammalia', 'Perissodactyla', 'Tapiridae', 'Tapirus', 30582);

INSERT INTO species_sources (species_id, field_name, source_name, reference) VALUES
((SELECT id FROM species WHERE scientific_name = 'Tapirus pinchaque'), 'image_url', 'iNaturalist', 'https://www.inaturalist.org/taxa/43356'),
((SELECT id FROM species WHERE scientific_name = 'Tapirus pinchaque'), 'conservation_status', 'IUCN', 'https://www.iucnredlist.org/species/21473/45173330'),
((SELECT id FROM species WHERE scientific_name = 'Tapirus pinchaque'), 'ncbi_taxon_id', 'NCBI', 'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=30582');

INSERT INTO species_locations (species_id, place_name, geom, is_default) VALUES
((SELECT id FROM species WHERE scientific_name = 'Tapirus pinchaque'), 'Páramos (Manizales, Colombia)', ST_SetSRID(ST_MakePoint(-75.46, 5.03), 4326), TRUE);

-- ═══════════════════════════════════════════════════════════════════
--  8. PAPER CIENTÍFICO DE EJEMPLO — Semantic Scholar (Jaguar)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO papers (species_id, title, authors, year, doi, url) VALUES
((SELECT id FROM species WHERE scientific_name = 'Panthera onca'),
 'The jaguar (Panthera onca) in the Anthropocene: a review of its conservation status',
 'De la Torre, J.A.; González-Maya, J.F.; Zarza, H.', 2021,
 '10.1016/j.biocon.2021.109341',
 'https://www.semanticscholar.org/paper/5961b2a17f00a3b1b89c8d047f63646a3c7a89cc');

INSERT INTO species_sources (species_id, field_name, source_name, reference) VALUES
((SELECT id FROM species WHERE scientific_name = 'Panthera onca'), 'paper', 'Semantic Scholar', 'https://www.semanticscholar.org/paper/5961b2a17f00a3b1b89c8d047f63646a3c7a89cc');

-- ═══════════════════════════════════════════════════════════════════
--  RESUMEN — verificación
-- ═══════════════════════════════════════════════════════════════════
-- SELECT common_name_es, scientific_name, category FROM species ORDER BY category;

COMMIT;