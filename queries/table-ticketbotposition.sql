-- public.ticketbotposition definição

-- Drop table

-- DROP TABLE public.ticketbotposition;

CREATE TABLE public.ticketbotposition (
	wa_id varchar NOT NULL,
	wa_name varchar NULL,
	current_step int4 NULL,
	ticketid int4 NULL,
	last_interaction timestamp NULL,
	queue_entered_at timestamp NULL,
	CONSTRAINT ticketbotposition_pk PRIMARY KEY (wa_id),
	CONSTRAINT ticketbotposition_ticketid_fkey FOREIGN KEY (ticketid) REFERENCES public."Tickets"(id)
);

-- Table Triggers

create trigger trigger_alteracao_fila after
update
    of queue_entered_at on
    public.ticketbotposition for each row
    when ((old.queue_entered_at is distinct
from
    new.queue_entered_at)) execute function notificar_alteracao_fila();