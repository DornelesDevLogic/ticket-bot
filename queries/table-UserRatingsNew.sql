-- public."UserRatingsNew" definição

-- Drop table

-- DROP TABLE public."UserRatingsNew";

CREATE TABLE public."UserRatingsNew" (
	"TicketTrakingId" int4 NULL,
	rate int4 NULL,
	"comment" text NULL,
	CONSTRAINT userratingsnew_unique UNIQUE ("TicketTrakingId"),
	CONSTRAINT "userratingcomments_TicketTrakingId_fkey" FOREIGN KEY ("TicketTrakingId") REFERENCES public."TicketTraking"(id)
);