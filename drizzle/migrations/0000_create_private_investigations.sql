CREATE TABLE public.investigation_cases (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL DEFAULT auth.uid(),
 title text NOT NULL CHECK (length(trim(title)) > 0),
 description text NOT NULL DEFAULT '',
 investigator text NOT NULL CHECK (length(trim(investigator)) > 0),
 subject text NOT NULL CHECK (subject IN ('Person','Vehicle','Both')),
 query text NOT NULL DEFAULT '',
 incident_date date,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investigation_cases TO authenticated;
GRANT ALL ON public.investigation_cases TO service_role;
ALTER TABLE public.investigation_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investigators own their cases" ON public.investigation_cases FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TABLE public.case_evidence (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 case_id uuid NOT NULL REFERENCES public.investigation_cases(id) ON DELETE CASCADE,
 user_id uuid NOT NULL DEFAULT auth.uid(),
 storage_path text NOT NULL UNIQUE,
 filename text NOT NULL,
 mime_type text NOT NULL CHECK (mime_type IN ('image/jpeg','image/png','video/mp4','video/webm')),
 size_bytes bigint NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 52428800),
 camera_id text NOT NULL DEFAULT '',
 location text NOT NULL DEFAULT '',
 captured_at timestamptz,
 notes text NOT NULL DEFAULT '',
 review_status text NOT NULL DEFAULT 'Requires Investigator Verification' CHECK (review_status IN ('Requires Investigator Verification','Confirmed by Investigator','Rejected by Investigator','Further Review')),
 review_note text NOT NULL DEFAULT '',
 reviewed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (storage_path LIKE user_id::text || '/' || case_id::text || '/%')
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_evidence TO authenticated;
GRANT ALL ON public.case_evidence TO service_role;
ALTER TABLE public.case_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investigators own case evidence" ON public.case_evidence FOR ALL TO authenticated USING (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.investigation_cases c WHERE c.id = case_id AND c.user_id = auth.uid())) WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.investigation_cases c WHERE c.id = case_id AND c.user_id = auth.uid()));
CREATE INDEX case_evidence_case_idx ON public.case_evidence(case_id);
CREATE INDEX investigation_cases_user_idx ON public.investigation_cases(user_id);
CREATE POLICY "Private evidence upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'case-evidence' AND (storage.foldername(name))[1] = auth.uid()::text AND EXISTS (SELECT 1 FROM public.investigation_cases c WHERE c.id::text = (storage.foldername(name))[2] AND c.user_id = auth.uid()));
CREATE POLICY "Private evidence read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'case-evidence' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Private evidence cleanup" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'case-evidence' AND (storage.foldername(name))[1] = auth.uid()::text);