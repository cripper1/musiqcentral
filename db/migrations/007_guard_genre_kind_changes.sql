-- MusIQ Central | Migration 007 | Guard taxonomy kind changes | DEV
-- Requires Migration 006 already applied. Additive; no existing rows changed.
BEGIN;

CREATE FUNCTION catalog.validate_genre_kind_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.kind IS NOT DISTINCT FROM OLD.kind THEN
    RETURN NEW;
  END IF;

  -- A top-level genre cannot become a style while artists use it as primary.
  IF NEW.kind = 'style' AND EXISTS (
    SELECT 1
    FROM artist.channel_genre cg
    WHERE cg.genre_id = NEW.genre_id
      AND cg.is_primary = TRUE
  ) THEN
    RAISE EXCEPTION
      'Cannot change classification % to style: used as an artist primary genre',
      OLD.code;
  END IF;

  -- A style with parents cannot become a top-level genre. Parent edges
  -- are only valid for classifications whose kind is style.
  IF NEW.kind = 'genre' AND EXISTS (
    SELECT 1
    FROM catalog.genre_parent gp
    WHERE gp.genre_id = NEW.genre_id
  ) THEN
    RAISE EXCEPTION
      'Cannot change classification % to genre: remove its parent relationships first',
      OLD.code;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_genre_kind_change
BEFORE UPDATE OF kind ON catalog.genre
FOR EACH ROW
EXECUTE FUNCTION catalog.validate_genre_kind_change();

COMMIT;

-- Read-only verification:
-- SELECT tgname FROM pg_trigger
-- WHERE tgrelid = 'catalog.genre'::regclass
--   AND tgname = 'trg_validate_genre_kind_change'
--   AND NOT tgisinternal;
