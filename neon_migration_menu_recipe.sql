-- Migración: vincular un ítem de menú con la receta que lo produce.
-- Permite auto-completar precio, stock (porciones producibles) y
-- descripción (ingredientes) desde la receta al crear/editar el platillo.

ALTER TABLE "menu" ADD COLUMN IF NOT EXISTS "recipeId" VARCHAR(100) REFERENCES "recipes"("id");
