-- Migración: stock de productos en unidades individuales
-- Semántica del modelo de producto:
--   precioCompra         = precio del empaque completo (ej. la caja)
--   cantidadEmpaque      = unidades por empaque (ej. 36 botellas)
--   cantidadPresentacion = contenido por unidad (ej. 244)
--   unidadMedida         = unidad del contenido (ej. Mililitros)
--   stock                = unidades individuales disponibles (ej. botellas)

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "stock" NUMERIC(20, 4) DEFAULT 0;

-- Los registros existentes usaban cantidadEmpaque como stock en la UI:
-- inicializar el stock con ese valor una sola vez.
UPDATE "products" SET "stock" = COALESCE("cantidadEmpaque", 0) WHERE "stock" = 0;
