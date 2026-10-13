BEGIN;

-- Keep existing summaries keys intact. This UUID identifies the displayed version.
ALTER TABLE public.summaries
    ADD COLUMN summary_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.summaries ADD CONSTRAINT summaries_summary_id_key UNIQUE (summary_id);

CREATE FUNCTION public.refresh_summary_version() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
    IF ROW(NEW.persona_id, NEW.title, NEW.category, NEW.source, NEW.news_url, NEW.content, NEW.published)
       IS DISTINCT FROM
       ROW(OLD.persona_id, OLD.title, OLD.category, OLD.source, OLD.news_url, OLD.content, OLD.published) THEN
        NEW.summary_id := gen_random_uuid();
    ELSE
        NEW.summary_id := OLD.summary_id;
    END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER summaries_refresh_version BEFORE UPDATE ON public.summaries
FOR EACH ROW EXECUTE FUNCTION public.refresh_summary_version();

CREATE TABLE public.scraps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Deliberately no FK: the snapshot survives summary expiry/replacement.
    summary_id uuid NOT NULL,
    persona_id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    news_url text NOT NULL,
    source text NOT NULL DEFAULT '',
    category text NOT NULL DEFAULT '',
    saved_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT scraps_user_summary_key UNIQUE (user_id, summary_id)
);
CREATE INDEX scraps_user_saved_idx ON public.scraps (user_id, saved_at DESC, id DESC);
ALTER TABLE public.scraps ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.scraps FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON public.scraps TO authenticated;
GRANT ALL ON public.scraps TO service_role;
CREATE POLICY scraps_select_own ON public.scraps FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);
CREATE POLICY scraps_delete_own ON public.scraps FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = user_id);
-- Inserts are backend-only: clients cannot forge snapshots or saved_at.
COMMIT;
