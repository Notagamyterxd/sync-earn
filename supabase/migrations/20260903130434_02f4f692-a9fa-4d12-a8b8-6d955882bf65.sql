
grant execute on function public.add_balance(uuid, numeric, text, text, text, jsonb) to service_role;
grant execute on function public.credit_earning(uuid, numeric, text, text, jsonb) to service_role;
grant execute on function public.has_role(uuid, public.app_role) to service_role;
