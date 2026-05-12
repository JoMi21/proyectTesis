-- Script actualizado para el nuevo flujo (Guardar primero, analizar despues)

DROP TABLE IF EXISTS public.reportes_analizados; -- Borramos la anterior si existia

CREATE TABLE IF NOT EXISTS public.reportes_logistica (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    file_name TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    mechanic_notes TEXT,
    analysis_data JSONB, -- Se llenara cuando se ejecute el analisis
    status TEXT DEFAULT 'pendiente' -- 'pendiente' o 'analizado'
);

-- Habilitar seguridad
ALTER TABLE public.reportes_logistica ENABLE ROW LEVEL SECURITY;

-- Politicas
CREATE POLICY "Permitir todo anonimo" 
ON public.reportes_logistica 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);
