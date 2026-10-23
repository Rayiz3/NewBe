BEGIN;

-- Run within the Auth deletion transaction. If cleanup fails, Auth deletion
-- rolls back too. Handles the existing public.users FK regardless of its action.
CREATE FUNCTION public.cleanup_deleted_account() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
    DELETE FROM public.scraps WHERE user_id = OLD.id;
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
END;
$$;
REVOKE ALL ON FUNCTION public.cleanup_deleted_account() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER newbe_cleanup_deleted_account
BEFORE DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.cleanup_deleted_account();

COMMIT;
