-- Improve canonical mandi price page and series-history query plans.
-- The indexes are partial: invalid/non-positive prices are excluded from every
-- canonical market card and page result, so these indexes match the API's filter.
CREATE INDEX IF NOT EXISTS idx_nmp_valid_latest
  ON public.national_market_price_observations (observation_date DESC, id DESC)
  WHERE modal_price > 0;

CREATE INDEX IF NOT EXISTS idx_nmp_valid_commodity_latest
  ON public.national_market_price_observations (commodity_code, observation_date DESC, id DESC)
  WHERE modal_price > 0;

CREATE INDEX IF NOT EXISTS idx_nmp_valid_mandi_latest
  ON public.national_market_price_observations (mandi_code, observation_date DESC, id DESC)
  WHERE modal_price > 0;

CREATE INDEX IF NOT EXISTS idx_nmp_valid_state_commodity_latest
  ON public.national_market_price_observations (state_code, commodity_code, observation_date DESC, id DESC)
  WHERE modal_price > 0;

CREATE INDEX IF NOT EXISTS idx_nmp_valid_series_dates
  ON public.national_market_price_observations
    (commodity_code, mandi_code, state_code, variety, grade, observation_date DESC)
  WHERE modal_price > 0;

CREATE OR REPLACE FUNCTION public.get_market_price_series_date_count(
  p_commodity_code text,
  p_mandi_code text,
  p_state_code text,
  p_variety text,
  p_grade text
)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
  SELECT COUNT(DISTINCT observation_date)::bigint
  FROM public.national_market_price_observations
  WHERE modal_price > 0
    AND commodity_code = p_commodity_code
    AND mandi_code IS NOT DISTINCT FROM p_mandi_code
    AND state_code IS NOT DISTINCT FROM p_state_code
    AND variety IS NOT DISTINCT FROM p_variety
    AND grade IS NOT DISTINCT FROM p_grade;
$function$;

REVOKE ALL ON FUNCTION public.get_market_price_series_date_count(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_market_price_series_date_count(text, text, text, text, text) TO anon, authenticated, service_role;
