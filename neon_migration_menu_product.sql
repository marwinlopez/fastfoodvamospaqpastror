-- Migración: vincular un ítem de menú directamente con un producto de
-- inventario (además de recetas, ya soportado por recipeId), para
-- platillos que son un producto tal cual (ej. una bebida embotellada).

ALTER TABLE "menu" ADD COLUMN IF NOT EXISTS "productId" VARCHAR(100) REFERENCES "products"("id");
