ALTER TABLE gemini_generations
    ADD COLUMN IF NOT EXISTS failure_reason TEXT;

ALTER TABLE gemini_generations
    ADD COLUMN IF NOT EXISTS provider_status_code INTEGER;
