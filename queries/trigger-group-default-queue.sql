-- Define a trigger que envia todos os tickets de grupos para
-- a fila de suporte

DROP TRIGGER IF EXISTS default_group_support_queue ON "Tickets";

CREATE OR REPLACE FUNCTION set_default_queue()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."isGroup" = TRUE THEN
        NEW."queueId" := 2;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER default_group_support_queue
BEFORE INSERT OR UPDATE OF status ON public."Tickets"
FOR EACH ROW
EXECUTE FUNCTION set_default_queue();
