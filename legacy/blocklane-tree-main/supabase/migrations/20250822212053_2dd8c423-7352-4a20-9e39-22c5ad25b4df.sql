-- Create function to notify external API when tickets change
CREATE OR REPLACE FUNCTION notify_external_api()
RETURNS trigger AS $$
DECLARE
  payload jsonb;
BEGIN
  -- Build payload with operation type and ticket data
  IF TG_OP = 'DELETE' then
    payload = jsonb_build_object(
      'operation', TG_OP,
      'table', 'tickets',
      'old_data', row_to_json(OLD),
      'timestamp', now()
    );
  ELSE
    payload = jsonb_build_object(
      'operation', TG_OP,
      'table', 'tickets',
      'data', row_to_json(NEW),
      'old_data', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE null END,
      'timestamp', now()
    );
  END IF;

  -- Send notification that will be picked up by the edge function
  PERFORM pg_notify('ticket_sync', payload::text);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for tickets table
DROP TRIGGER IF EXISTS ticket_sync_trigger ON tickets;
CREATE TRIGGER ticket_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_external_api();

-- Create triggers for related tables that might be important
DROP TRIGGER IF EXISTS ticket_messages_sync_trigger ON ticket_messages;
CREATE TRIGGER ticket_messages_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_external_api();

DROP TRIGGER IF EXISTS vendor_assignments_sync_trigger ON vendor_assignments;
CREATE TRIGGER vendor_assignments_sync_trigger
  AFTER INSERT OR UPDATE OR DELETE ON vendor_assignments
  FOR EACH ROW
  EXECUTE FUNCTION notify_external_api();