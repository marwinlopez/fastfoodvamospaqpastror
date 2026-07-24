-- Migración: mano de obra (labor cost) por receta
-- labor = arreglo JSON de colaboradores involucrados en la preparación:
--   [{ "role": "COCINERO", "hourlyRate": 12.50, "hours": 0.5 }, ...]
-- Costo mano de obra = Σ (hourlyRate × hours)
-- Costo receta = (insumos + mano de obra) / (1 - merma/100)

ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "labor" JSONB DEFAULT '[]';
