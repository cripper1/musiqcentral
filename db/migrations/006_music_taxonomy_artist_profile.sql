-- MusIQ Central | Migration 006 | Controlled music taxonomy and artist profiles
-- DEV review required before execution. Additive only; no rights or publication authority.
BEGIN;
CREATE TABLE catalog.genre (
 genre_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 code TEXT NOT NULL UNIQUE,
 name TEXT NOT NULL,
 kind TEXT NOT NULL CHECK (kind IN ('genre','style')),
 description TEXT,
 active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CONSTRAINT ck_genre_code CHECK (code ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
CREATE TABLE catalog.genre_parent (
 genre_id BIGINT NOT NULL REFERENCES catalog.genre(genre_id),
 parent_genre_id BIGINT NOT NULL REFERENCES catalog.genre(genre_id),
 PRIMARY KEY (genre_id,parent_genre_id),
 CHECK (genre_id <> parent_genre_id)
);
CREATE INDEX idx_genre_parent_parent ON catalog.genre_parent(parent_genre_id);
CREATE TABLE catalog.genre_alias (
 alias_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 genre_id BIGINT NOT NULL REFERENCES catalog.genre(genre_id),
 alias TEXT NOT NULL,
 alias_normalized TEXT NOT NULL,
 UNIQUE(genre_id,alias_normalized)
);
CREATE INDEX idx_genre_alias_lookup ON catalog.genre_alias(alias_normalized);
CREATE TABLE catalog.genre_external_reference (
 reference_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 genre_id BIGINT NOT NULL REFERENCES catalog.genre(genre_id),
 source_code TEXT NOT NULL,
 external_id TEXT NOT NULL,
 source_label TEXT,
 UNIQUE(source_code,external_id)
);
CREATE INDEX idx_genre_external_genre ON catalog.genre_external_reference(genre_id);
CREATE TABLE artist.channel_genre (
 channel_id BIGINT NOT NULL REFERENCES artist.artist_channel(channel_id),
 genre_id BIGINT NOT NULL REFERENCES catalog.genre(genre_id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(channel_id,genre_id)
);
CREATE INDEX idx_channel_genre_genre ON artist.channel_genre(genre_id);
CREATE TABLE catalog.recording_genre (
 recording_id BIGINT NOT NULL REFERENCES catalog.recording(recording_id),
 genre_id BIGINT NOT NULL REFERENCES catalog.genre(genre_id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(recording_id,genre_id)
);
CREATE INDEX idx_recording_genre_genre ON catalog.recording_genre(genre_id);
CREATE TABLE artist.channel_profile (
 channel_id BIGINT PRIMARY KEY REFERENCES artist.artist_channel(channel_id),
 biography TEXT NOT NULL DEFAULT '',
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CHECK (char_length(biography) <= 5000)
);
-- Curated initial broad genres. External references are not invented.
INSERT INTO catalog.genre(code,name,kind) VALUES
 ('rock','Rock','genre'),('pop','Pop','genre'),('hip-hop','Hip-Hop','genre'),
 ('r-and-b','R&B','genre'),('country','Country','genre'),('blues','Blues','genre'),
 ('jazz','Jazz','genre'),('electronic','Electronic','genre'),('folk','Folk','genre'),
 ('classical','Classical','genre'),('latin','Latin','genre'),('reggae','Reggae','genre'),
 ('metal','Metal','genre'),('punk','Punk','genre'),('gospel','Gospel','genre'),
 ('world','World','genre');
GRANT SELECT ON catalog.genre,catalog.genre_parent,catalog.genre_alias,catalog.genre_external_reference TO musiqcentral_dev_app;
GRANT SELECT,INSERT,DELETE ON artist.channel_genre TO musiqcentral_dev_app;
GRANT SELECT,INSERT,UPDATE ON artist.channel_profile TO musiqcentral_dev_app;
GRANT SELECT ON catalog.recording_genre TO musiqcentral_dev_app;
COMMIT;
-- Follow-up migration: curated styles, vetted external IDs and cycle-prevention policy.
-- Do not execute this migration automatically; review schema and grants first.
