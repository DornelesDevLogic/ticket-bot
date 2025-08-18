-- Define a trigger que notifica o backend para enviar uma mensagem
-- de avaliação para o usuário quando um ticket for fechado.

-- 1) Drop the old trigger and function, if they exist
DROP TRIGGER IF EXISTS trigger_notificar_ticket_finalizado
  ON "TicketTraking";

DROP FUNCTION IF EXISTS notificar_ticket_finalizado();

-- 2) Create the new function
CREATE OR REPLACE FUNCTION notificar_ticket_finalizado()
RETURNS trigger AS $$
DECLARE
  v_wa_id            text;
  v_group_wa_jid     text;
  v_is_group         boolean;
  v_pre_tt_timestamp timestamp;
  v_msg_rec_exists   boolean := false;
  v_payload          text;
BEGIN
  --------------------------------------------------------------------------------
  -- A) Determine whether this ticket is marked as a “group” chat or not
  --------------------------------------------------------------------------------
  SELECT t."isGroup"
    INTO STRICT v_is_group
  FROM "Tickets" t
  WHERE t.id = NEW."ticketId";
  -- (At this point, if the ticket row does not exist, Postgres will throw;
  --  that’s fine—too often means a bad foreign key.)

  --------------------------------------------------------------------------------
  -- B) Try to fetch the most recent prior “finishedAt” from an earlier TicketTraking
  --------------------------------------------------------------------------------
  BEGIN
    SELECT tt."finishedAt"
      INTO v_pre_tt_timestamp
    FROM "TicketTraking" tt
    WHERE tt."ticketId"   = NEW."ticketId"
      AND tt."createdAt" < NEW."createdAt"
    ORDER BY tt."finishedAt" DESC
    LIMIT 1;
    -- If we get here, v_pre_tt_timestamp is set to the last time this ticket was closed.
    -- We’ll use that to filter “only messages arriving after the last close.”

  EXCEPTION WHEN NO_DATA_FOUND THEN
    -- No previous tracking row exists. On *first* tracking, we want to skip timestamp filtering
    v_msg_rec_exists := FALSE;
  END;

  --------------------------------------------------------------------------------
  -- C) Fetch the message info differently depending on whether we found a prior close
  --------------------------------------------------------------------------------
  IF FOUND THEN
    -- “FOUND” is TRUE if the SELECT above successfully populated v_pre_tt_timestamp.
    -- Now pick the *latest* incoming message whose createdAt is strictly after that timestamp:
    BEGIN
      SELECT
        regexp_replace(m."participant", '\D+', '', 'g'),
        m."remoteJid"
      INTO STRICT v_wa_id, v_group_wa_jid
      FROM "Messages" m
      WHERE m."ticketId"   = NEW."ticketId"
        AND m."createdAt" > v_pre_tt_timestamp
        AND m."fromMe"     = false
      ORDER BY m."createdAt" DESC
      LIMIT 1;
      v_msg_rec_exists := TRUE;

    EXCEPTION WHEN NO_DATA_FOUND THEN
      -- There was a prior close, but no messages after it → treat as “no message available”
      v_wa_id        := NULL;
      v_group_wa_jid := NULL;
    END;

  ELSE
    -- We did NOT find any prior TicketTraking → this is the FIRST tracking.
    -- Simply pick the *latest* incoming message for this ticket, ignoring timestamps entirely.
    BEGIN
      SELECT
        regexp_replace(m."participant", '\D+', '', 'g'),
        m."remoteJid"
      INTO STRICT v_wa_id, v_group_wa_jid
      FROM "Messages" m
      WHERE m."ticketId" = NEW."ticketId"
        AND m."fromMe"   = false
      ORDER BY m."createdAt" DESC
      LIMIT 1;
      v_msg_rec_exists := TRUE;

    EXCEPTION WHEN NO_DATA_FOUND THEN
      -- There are no messages at all in this ticket. We still want to notify, but send NULLs.
      v_wa_id        := NULL;
      v_group_wa_jid := NULL;
    END;
  END IF;

  --------------------------------------------------------------------------------
  -- D) Build the JSON payload and fire pg_notify
  --------------------------------------------------------------------------------
  v_payload := json_build_object(
                 'ticketTrakingId', NEW.id,
                 'wa_id',           v_wa_id,
                 'group_wa_jid',    v_group_wa_jid
               )::text;

  PERFORM pg_notify('ticket_finalizado', v_payload);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) Recreate the trigger to invoke the function
CREATE TRIGGER trigger_notificar_ticket_finalizado
  AFTER UPDATE OF "finishedAt"
  ON "TicketTraking"
  FOR EACH ROW
  WHEN (
    OLD."finishedAt" IS DISTINCT FROM NEW."finishedAt"
    AND NEW."finishedAt" IS NOT NULL
  )
  EXECUTE FUNCTION notificar_ticket_finalizado();


-- Testes --
SELECT tt."finishedAt", tt.id
      FROM "TicketTraking" tt
     WHERE tt."ticketId"  = 130
       AND tt."createdAt" < '2025-06-06 11:14:48.207 -0300'
     ORDER BY tt."finishedAt" desc
     LIMIT 1;

SELECT
    regexp_replace(m."participant", '\D+', '', 'g')   AS wa_id,
    m."remoteJid"   AS group_wa_jid,
    m."id"
FROM "Messages" m
WHERE m."ticketId"  = 429
  AND m."createdAt" > '2025-06-06 11:54:24.837 -0300' -- finishedAt do anterior
  and m."fromMe" = false
ORDER BY m."createdAt"
LIMIT 1;

  SELECT MIN(m."createdAt")
  FROM "Messages" m
  WHERE m."ticketId" = 429
    AND m."fromMe"   = false;