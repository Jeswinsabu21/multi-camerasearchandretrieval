ALTER TABLE public.case_evidence ADD COLUMN latitude double precision, ADD COLUMN longitude double precision;
ALTER TABLE public.investigation_cases ADD COLUMN attributes text[] NOT NULL DEFAULT '{}';