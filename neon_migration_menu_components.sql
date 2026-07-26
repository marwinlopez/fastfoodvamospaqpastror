-- Migración: componentes de un platillo (combo), para platillos armados con
-- varias recetas/productos a la vez (ej. Hamburguesa + Refresco + Papas),
-- en vez de un solo vínculo. Un platillo "simple" es, con este modelo, un
-- combo de un único componente.

CREATE TABLE IF NOT EXISTS "menu_components" (
  "id" VARCHAR(100) PRIMARY KEY,
  "menuId" VARCHAR(100) NOT NULL REFERENCES "menu"("id") ON DELETE CASCADE,
  "recipeId" VARCHAR(100) REFERENCES "recipes"("id"),
  "productId" VARCHAR(100) REFERENCES "products"("id"),
  "quantity" NUMERIC(20, 4) DEFAULT 1,
  "description" VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS "idx_menu_components_menu_id" ON "menu_components" ("menuId");
