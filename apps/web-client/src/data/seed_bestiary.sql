-- Seed for Bestiary with clean 3D Bedrock & GLTF model paths

INSERT INTO wiki_articles (id, slug, title, category, description, model_3d_url, texture_url, boss_hp, boss_damage, boss_location, boss_drops, content) VALUES (201, 'red-panda', '#203 • Red Panda', '🐉 Bestiario & Criaturas 3D', 'Ficha técnica y visor 3D interactivo de Red Panda en CrystalTides SMP.', '/models/crittersandcompanions\red_panda.geo.json', '/models/crittersandcompanions/red_panda.png', '20 HP', '0', 'Bosque de Bambú', ARRAY['Bambú Especial', 'Semillas de Bambú'], '## Red Panda

**Ubicación principal:** Bosque de Bambú

**Comportamiento:** Entidad del mod `crittersandcompanions` que habita en las mazmorras y regiones especiales del servidor.

### Estrategia de Combate
- Mantener distancia si la criatura posee ataques de zona o estados alterados.
- Utilizar armamento mítico o pociones de protección antes del combate.') ON CONFLICT (slug) DO UPDATE SET model_3d_url = EXCLUDED.model_3d_url, texture_url = EXCLUDED.texture_url;
INSERT INTO wiki_articles (id, slug, title, category, description, model_3d_url, texture_url, boss_hp, boss_damage, boss_location, boss_drops, content) VALUES (202, 'dumbo-octopus', '#205 • Dumbo Octopus', '🐉 Bestiario & Criaturas 3D', 'Ficha técnica y visor 3D interactivo de Dumbo Octopus en CrystalTides SMP.', '/models/crittersandcompanions\dumbo_octopus.geo.json', '/models/crittersandcompanions/dumbo_octopus.png', '25 HP', '0', 'Océanos Profundos', ARRAY['Tinta Luminosa'], '## Dumbo Octopus

**Ubicación principal:** Océanos Profundos

**Comportamiento:** Entidad del mod `crittersandcompanions` que habita en las mazmorras y regiones especiales del servidor.

### Estrategia de Combate
- Mantener distancia si la criatura posee ataques de zona o estados alterados.
- Utilizar armamento mítico o pociones de protección antes del combate.') ON CONFLICT (slug) DO UPDATE SET model_3d_url = EXCLUDED.model_3d_url, texture_url = EXCLUDED.texture_url;
INSERT INTO wiki_articles (id, slug, title, category, description, model_3d_url, texture_url, boss_hp, boss_damage, boss_location, boss_drops, content) VALUES (203, 'otter', '#210 • Otter', '🐉 Bestiario & Criaturas 3D', 'Ficha técnica y visor 3D interactivo de Otter en CrystalTides SMP.', '/models/crittersandcompanions\otter.geo.json', '/models/crittersandcompanions/otter.png', '30 HP', '0', 'Ríos de Montaña', ARRAY['Pescado Fresco'], '## Otter

**Ubicación principal:** Ríos de Montaña

**Comportamiento:** Entidad del mod `crittersandcompanions` que habita en las mazmorras y regiones especiales del servidor.

### Estrategia de Combate
- Mantener distancia si la criatura posee ataques de zona o estados alterados.
- Utilizar armamento mítico o pociones de protección antes del combate.') ON CONFLICT (slug) DO UPDATE SET model_3d_url = EXCLUDED.model_3d_url, texture_url = EXCLUDED.texture_url;
INSERT INTO wiki_articles (id, slug, title, category, description, model_3d_url, texture_url, boss_hp, boss_damage, boss_location, boss_drops, content) VALUES (204, 'ferret', '#214 • Ferret', '🐉 Bestiario & Criaturas 3D', 'Ficha técnica y visor 3D interactivo de Ferret en CrystalTides SMP.', '/models/crittersandcompanions\ferret.geo.json', '/models/crittersandcompanions/ferret.png', '15 HP', '0', 'Bosques Templados', ARRAY['Baya Silvestre'], '## Ferret

**Ubicación principal:** Bosques Templados

**Comportamiento:** Entidad del mod `crittersandcompanions` que habita en las mazmorras y regiones especiales del servidor.

### Estrategia de Combate
- Mantener distancia si la criatura posee ataques de zona o estados alterados.
- Utilizar armamento mítico o pociones de protección antes del combate.') ON CONFLICT (slug) DO UPDATE SET model_3d_url = EXCLUDED.model_3d_url, texture_url = EXCLUDED.texture_url;
INSERT INTO wiki_articles (id, slug, title, category, description, model_3d_url, texture_url, boss_hp, boss_damage, boss_location, boss_drops, content) VALUES (205, 'chesed', '#216 • Chesed', '🐉 Bestiario & Criaturas 3D', 'Ficha técnica y visor 3D interactivo de Chesed en CrystalTides SMP.', '/models/fdbosses\chesed.geo.json', NULL, '1,200 HP', '35', 'Altar de Qliphoth (Dimensión Abisal)', ARRAY['Cristal Kinetic', 'Chesed Core (100%)', '500 KC'], '## Chesed

**Ubicación principal:** Altar de Qliphoth (Dimensión Abisal)

**Comportamiento:** Entidad del mod `fdbosses` que habita en las mazmorras y regiones especiales del servidor.

### Estrategia de Combate
- Mantener distancia si la criatura posee ataques de zona o estados alterados.
- Utilizar armamento mítico o pociones de protección antes del combate.') ON CONFLICT (slug) DO UPDATE SET model_3d_url = EXCLUDED.model_3d_url, texture_url = EXCLUDED.texture_url;
INSERT INTO wiki_articles (id, slug, title, category, description, model_3d_url, texture_url, boss_hp, boss_damage, boss_location, boss_drops, content) VALUES (206, 'geburah', '#217 • Geburah', '🐉 Bestiario & Criaturas 3D', 'Ficha técnica y visor 3D interactivo de Geburah en CrystalTides SMP.', '/models/fdbosses\geburah.geo.json', NULL, '1,500 HP', '45 (Ignora Armadura)', 'Fortaleza del Juicio', ARRAY['Espada Geburah', 'Reliquia Carmesí', '750 KC'], '## Geburah

**Ubicación principal:** Fortaleza del Juicio

**Comportamiento:** Entidad del mod `fdbosses` que habita en las mazmorras y regiones especiales del servidor.

### Estrategia de Combate
- Mantener distancia si la criatura posee ataques de zona o estados alterados.
- Utilizar armamento mítico o pociones de protección antes del combate.') ON CONFLICT (slug) DO UPDATE SET model_3d_url = EXCLUDED.model_3d_url, texture_url = EXCLUDED.texture_url;
INSERT INTO wiki_articles (id, slug, title, category, description, model_3d_url, texture_url, boss_hp, boss_damage, boss_location, boss_drops, content) VALUES (207, 'malkuth', '#218 • Malkuth', '🐉 Bestiario & Criaturas 3D', 'Ficha técnica y visor 3D interactivo de Malkuth en CrystalTides SMP.', '/models/fdbosses\malkuth.geo.json', NULL, '1,800 HP', '50', 'Templo de Malkuth', ARRAY['Malkuth Shield', 'Núcleo Elemental', '1,000 KC'], '## Malkuth

**Ubicación principal:** Templo de Malkuth

**Comportamiento:** Entidad del mod `fdbosses` que habita en las mazmorras y regiones especiales del servidor.

### Estrategia de Combate
- Mantener distancia si la criatura posee ataques de zona o estados alterados.
- Utilizar armamento mítico o pociones de protección antes del combate.') ON CONFLICT (slug) DO UPDATE SET model_3d_url = EXCLUDED.model_3d_url, texture_url = EXCLUDED.texture_url;
INSERT INTO wiki_articles (id, slug, title, category, description, model_3d_url, texture_url, boss_hp, boss_damage, boss_location, boss_drops, content) VALUES (208, 'automaton', '#220 • Automaton', '🐉 Bestiario & Criaturas 3D', 'Ficha técnica y visor 3D interactivo de Automaton en CrystalTides SMP.', '/models/mobs_of_mythology\automaton.geo.json', '/models/mobs_of_mythology\automaton.png', '450 HP', '20', 'Ruinas Griegas Antiguas', ARRAY['Engranaje Mítico', 'Polvo de Bronce', '250 KC'], '## Automaton

**Ubicación principal:** Ruinas Griegas Antiguas

**Comportamiento:** Entidad del mod `mobs_of_mythology` que habita en las mazmorras y regiones especiales del servidor.

### Estrategia de Combate
- Mantener distancia si la criatura posee ataques de zona o estados alterados.
- Utilizar armamento mítico o pociones de protección antes del combate.') ON CONFLICT (slug) DO UPDATE SET model_3d_url = EXCLUDED.model_3d_url, texture_url = EXCLUDED.texture_url;
INSERT INTO wiki_articles (id, slug, title, category, description, model_3d_url, texture_url, boss_hp, boss_damage, boss_location, boss_drops, content) VALUES (209, 'basilisk', '#221 • Basilisk', '🐉 Bestiario & Criaturas 3D', 'Ficha técnica y visor 3D interactivo de Basilisk en CrystalTides SMP.', '/models/mobs_of_mythology\basilisk.geo.json', '/models/mobs_of_mythology\basilisk.png', '350 HP', '25 (Veneno II)', 'Ciénaga Mitológica', ARRAY['Escama de Basilisco', 'Ojo Mirada de Piedra', '300 KC'], '## Basilisk

**Ubicación principal:** Ciénaga Mitológica

**Comportamiento:** Entidad del mod `mobs_of_mythology` que habita en las mazmorras y regiones especiales del servidor.

### Estrategia de Combate
- Mantener distancia si la criatura posee ataques de zona o estados alterados.
- Utilizar armamento mítico o pociones de protección antes del combate.') ON CONFLICT (slug) DO UPDATE SET model_3d_url = EXCLUDED.model_3d_url, texture_url = EXCLUDED.texture_url;
INSERT INTO wiki_articles (id, slug, title, category, description, model_3d_url, texture_url, boss_hp, boss_damage, boss_location, boss_drops, content) VALUES (210, 'chupacabra', '#222 • Chupacabra', '🐉 Bestiario & Criaturas 3D', 'Ficha técnica y visor 3D interactivo de Chupacabra en CrystalTides SMP.', '/models/mobs_of_mythology\chupacabra.geo.json', '/models/mobs_of_mythology\chupacabra.png', '180 HP', '15', 'Desierto de Noche', ARRAY['Colmillo Sangriento', 'Piel Seca', '100 KC'], '## Chupacabra

**Ubicación principal:** Desierto de Noche

**Comportamiento:** Entidad del mod `mobs_of_mythology` que habita en las mazmorras y regiones especiales del servidor.

### Estrategia de Combate
- Mantener distancia si la criatura posee ataques de zona o estados alterados.
- Utilizar armamento mítico o pociones de protección antes del combate.') ON CONFLICT (slug) DO UPDATE SET model_3d_url = EXCLUDED.model_3d_url, texture_url = EXCLUDED.texture_url;
INSERT INTO wiki_articles (id, slug, title, category, description, model_3d_url, texture_url, boss_hp, boss_damage, boss_location, boss_drops, content) VALUES (211, 'drake', '#223 • Drake', '🐉 Bestiario & Criaturas 3D', 'Ficha técnica y visor 3D interactivo de Drake en CrystalTides SMP.', '/models/mobs_of_mythology\drake.geo.json', NULL, '600 HP', '30 (Aliento de Fuego)', 'Cumbres de Dragones', ARRAY['Escama de Dragón', 'Corazón Igneo', '400 KC'], '## Drake

**Ubicación principal:** Cumbres de Dragones

**Comportamiento:** Entidad del mod `mobs_of_mythology` que habita en las mazmorras y regiones especiales del servidor.

### Estrategia de Combate
- Mantener distancia si la criatura posee ataques de zona o estados alterados.
- Utilizar armamento mítico o pociones de protección antes del combate.') ON CONFLICT (slug) DO UPDATE SET model_3d_url = EXCLUDED.model_3d_url, texture_url = EXCLUDED.texture_url;
INSERT INTO wiki_articles (id, slug, title, category, description, model_3d_url, texture_url, boss_hp, boss_damage, boss_location, boss_drops, content) VALUES (212, 'pegasus', '#226 • Pegasus', '🐉 Bestiario & Criaturas 3D', 'Ficha técnica y visor 3D interactivo de Pegasus en CrystalTides SMP.', '/models/mobs_of_mythology\pegasus.geo.json', '/models/mobs_of_mythology\pegasus.png', '80 HP', '5', 'Praderas Celestiales', ARRAY['Pluma Celestial', 'Polvo Estelar'], '## Pegasus

**Ubicación principal:** Praderas Celestiales

**Comportamiento:** Entidad del mod `mobs_of_mythology` que habita en las mazmorras y regiones especiales del servidor.

### Estrategia de Combate
- Mantener distancia si la criatura posee ataques de zona o estados alterados.
- Utilizar armamento mítico o pociones de protección antes del combate.') ON CONFLICT (slug) DO UPDATE SET model_3d_url = EXCLUDED.model_3d_url, texture_url = EXCLUDED.texture_url;
INSERT INTO wiki_articles (id, slug, title, category, description, model_3d_url, texture_url, boss_hp, boss_damage, boss_location, boss_drops, content) VALUES (213, 'wendigo', '#228 • Wendigo', '🐉 Bestiario & Criaturas 3D', 'Ficha técnica y visor 3D interactivo de Wendigo en CrystalTides SMP.', '/models/mobs_of_mythology\wendigo.geo.json', '/models/mobs_of_mythology\wendigo.png', '500 HP', '28 (Lentitud III)', 'Bosques Nevados Profundos', ARRAY['Cuerno Helado', 'Carne Congelada', '350 KC'], '## Wendigo

**Ubicación principal:** Bosques Nevados Profundos

**Comportamiento:** Entidad del mod `mobs_of_mythology` que habita en las mazmorras y regiones especiales del servidor.

### Estrategia de Combate
- Mantener distancia si la criatura posee ataques de zona o estados alterados.
- Utilizar armamento mítico o pociones de protección antes del combate.') ON CONFLICT (slug) DO UPDATE SET model_3d_url = EXCLUDED.model_3d_url, texture_url = EXCLUDED.texture_url;
INSERT INTO wiki_articles (id, slug, title, category, description, model_3d_url, texture_url, boss_hp, boss_damage, boss_location, boss_drops, content) VALUES (214, 'merchant-ribbit', '#240 • Merchant Ribbit', '🐉 Bestiario & Criaturas 3D', 'Ficha técnica y visor 3D interactivo de Merchant Ribbit en CrystalTides SMP.', '/models/ribbits\merchant_ribbit.geo.json', NULL, '100 HP', '0', 'Mercados Flotantes de Ranas', ARRAY['Intercambio de Esmeraldas y KC'], '## Merchant Ribbit

**Ubicación principal:** Mercados Flotantes de Ranas

**Comportamiento:** Entidad del mod `ribbits` que habita en las mazmorras y regiones especiales del servidor.

### Estrategia de Combate
- Mantener distancia si la criatura posee ataques de zona o estados alterados.
- Utilizar armamento mítico o pociones de protección antes del combate.') ON CONFLICT (slug) DO UPDATE SET model_3d_url = EXCLUDED.model_3d_url, texture_url = EXCLUDED.texture_url;
INSERT INTO wiki_articles (id, slug, title, category, description, model_3d_url, texture_url, boss_hp, boss_damage, boss_location, boss_drops, content) VALUES (215, 'sorcerer-ribbit', '#243 • Sorcerer Ribbit', '🐉 Bestiario & Criaturas 3D', 'Ficha técnica y visor 3D interactivo de Sorcerer Ribbit en CrystalTides SMP.', '/models/ribbits\sorcerer_ribbit.geo.json', NULL, '90 HP', '12 (Pociones)', 'Pueblos de Ranas del Pantano', ARRAY['Sombrero Mágico', 'Verruca del Pantano'], '## Sorcerer Ribbit

**Ubicación principal:** Pueblos de Ranas del Pantano

**Comportamiento:** Entidad del mod `ribbits` que habita en las mazmorras y regiones especiales del servidor.

### Estrategia de Combate
- Mantener distancia si la criatura posee ataques de zona o estados alterados.
- Utilizar armamento mítico o pociones de protección antes del combate.') ON CONFLICT (slug) DO UPDATE SET model_3d_url = EXCLUDED.model_3d_url, texture_url = EXCLUDED.texture_url;
