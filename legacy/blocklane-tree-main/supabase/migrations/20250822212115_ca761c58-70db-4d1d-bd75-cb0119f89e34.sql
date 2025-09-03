-- Fix the search path security issue for the notify_external_api function
CREATE OR REPLACE FUNCTION notify_external_api()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  payload jsonb;
BEGIN
  -- Build payload with operation type and ticket data
  IF TG_OP = 'DELETE' then
    payload = jsonb_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'old_data', row_to_json(OLD),
      'timestamp', now()
    );
  ELSE
    payload = jsonb_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'data', row_to_json(NEW),
      'old_data', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE null END,
      'timestamp', now()
    );
  END IF;

  -- Send notification that will be picked up by the edge function
  PERFORM pg_notify('ticket_sync', payload::text);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;