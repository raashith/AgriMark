-- Database Migration: 18_delivery_address_integrity.sql
-- Purpose: Add unique partial index for single default address per user and automatic default fallback triggers.

-- Enforce at most one default address per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_delivery_addresses_one_default_per_user
    ON public.delivery_addresses (user_id)
    WHERE (is_default = true);

-- Trigger function: Ensure setting is_default = true automatically clears previous default
CREATE OR REPLACE FUNCTION ensure_single_default_delivery_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE public.delivery_addresses
        SET is_default = false
        WHERE user_id = NEW.user_id
          AND id <> NEW.id
          AND is_default = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_single_default_delivery_address ON public.delivery_addresses;
CREATE TRIGGER trigger_ensure_single_default_delivery_address
    BEFORE INSERT OR UPDATE OF is_default ON public.delivery_addresses
    FOR EACH ROW
    WHEN (NEW.is_default = true)
    EXECUTE FUNCTION ensure_single_default_delivery_address();

-- Trigger function: Promote next address when default address is deleted
CREATE OR REPLACE FUNCTION handle_delivery_address_deletion()
RETURNS TRIGGER AS $$
DECLARE
    next_id UUID;
BEGIN
    IF OLD.is_default = true THEN
        SELECT id INTO next_id
        FROM public.delivery_addresses
        WHERE user_id = OLD.user_id AND id <> OLD.id
        ORDER BY created_at DESC
        LIMIT 1;

        IF next_id IS NOT NULL THEN
            UPDATE public.delivery_addresses
            SET is_default = true
            WHERE id = next_id;
        END IF;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_handle_delivery_address_deletion ON public.delivery_addresses;
CREATE TRIGGER trigger_handle_delivery_address_deletion
    AFTER DELETE ON public.delivery_addresses
    FOR EACH ROW
    EXECUTE FUNCTION handle_delivery_address_deletion();
