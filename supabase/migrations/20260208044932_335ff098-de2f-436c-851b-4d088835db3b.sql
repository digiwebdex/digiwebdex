-- Make ticket_number have a default to allow inserts without specifying it
-- The trigger will override this with the proper formatted number
ALTER TABLE public.support_tickets 
    ALTER COLUMN ticket_number SET DEFAULT '';