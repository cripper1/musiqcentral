-- MusiQ Central | Migration 005 | DEV only; requires migrations 001-004
-- Private draft upload; no publication, governance, commerce or rights inference.
BEGIN;
CREATE SCHEMA IF NOT EXISTS media;
CREATE TABLE catalog.channel_recording (
 channel_recording_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 channel_id BIGINT NOT NULL REFERENCES artist.artist_channel(channel_id),
 recording_id BIGINT NOT NULL REFERENCES catalog.recording(recording_id),
 created_by_party_id BIGINT NOT NULL REFERENCES core.party(party_id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(channel_id,recording_id)
);
CREATE INDEX idx_channel_recording_recording ON catalog.channel_recording(recording_id);
CREATE TABLE media.audio_asset (
 audio_asset_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 asset_guid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
 recording_id BIGINT NOT NULL REFERENCES catalog.recording(recording_id),
 uploaded_by_party_id BIGINT NOT NULL REFERENCES core.party(party_id),
 storage_key TEXT NOT NULL UNIQUE,
 original_filename TEXT NOT NULL,
 content_type TEXT NOT NULL CHECK(content_type IN ('audio/mpeg','audio/wav','audio/x-wav','audio/flac','audio/mp4','audio/aac','audio/ogg')),
 declared_bytes BIGINT NOT NULL CHECK(declared_bytes > 0 AND declared_bytes <= 104857600),
 state TEXT NOT NULL DEFAULT 'pending_upload' CHECK(state IN ('pending_upload','uploaded','failed')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 uploaded_at TIMESTAMPTZ,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CONSTRAINT ck_audio_asset_uploaded_at CHECK ((state='uploaded')=(uploaded_at IS NOT NULL))
);
CREATE INDEX idx_audio_asset_recording ON media.audio_asset(recording_id);
CREATE INDEX idx_audio_asset_pending ON media.audio_asset(created_at) WHERE state='pending_upload';
GRANT USAGE ON SCHEMA artist,catalog,media TO musiqcentral_dev_app;
GRANT SELECT,INSERT ON artist.artist_channel,artist.channel_party TO musiqcentral_dev_app;
GRANT SELECT,INSERT ON catalog.recording,catalog.channel_recording TO musiqcentral_dev_app;
GRANT SELECT,INSERT,UPDATE ON media.audio_asset TO musiqcentral_dev_app;
GRANT USAGE ON SEQUENCE artist.artist_channel_channel_id_seq,artist.channel_party_channel_party_id_seq,catalog.recording_recording_id_seq,catalog.channel_recording_channel_recording_id_seq,media.audio_asset_audio_asset_id_seq TO musiqcentral_dev_app;
COMMIT;
SELECT to_regclass('catalog.channel_recording') AS channel_recording,to_regclass('media.audio_asset') AS audio_asset;
-- If unused, revert only via separately reviewed destructive migration.
