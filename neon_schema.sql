-- Script DDL para inicializar la base de datos en Neon PostgreSQL.
-- Copia y pega esto en la sección 'SQL Editor' de tu consola de Neon.

-- Eliminar tablas existentes para empezar de cero
DROP TABLE IF EXISTS "ingredients" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "recipes" CASCADE;
DROP TABLE IF EXISTS "menu" CASCADE;
DROP TABLE IF EXISTS "staff" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "units" CASCADE;
DROP TABLE IF EXISTS "divisas" CASCADE;
DROP TABLE IF EXISTS "companies" CASCADE;

-- 0. Tabla Empresas (multi-tenant): datos de marca, moneda y tema por tenant
CREATE TABLE "companies" (
  "id" VARCHAR(100) PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "slogan" VARCHAR(255),
  "phone" VARCHAR(50),
  "address" VARCHAR(255),
  "currency" VARCHAR(10) DEFAULT 'USD',
  "currencySymbol" VARCHAR(5) DEFAULT '$',
  "themeMode" VARCHAR(10) DEFAULT 'system', -- light | dark | system
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

INSERT INTO "companies" ("id", "name", "slogan")
VALUES ('company-default', 'PA Q'' PASTOR', 'Venta de comida');

-- 1. Tabla Divisas
CREATE TABLE "divisas" (
  "name" VARCHAR(100) PRIMARY KEY,
  "quote" NUMERIC(20, 4) NOT NULL,
  "sources" VARCHAR(100)
);

-- 2. Tabla Unidades de Medida
CREATE TABLE "units" (
  "id" VARCHAR(100) PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL UNIQUE,
  "companyId" VARCHAR(100) DEFAULT 'company-default' REFERENCES "companies"("id")
);

-- 3. Tabla Categorías
CREATE TABLE "categories" (
  "id" VARCHAR(100) PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL UNIQUE,
  "companyId" VARCHAR(100) DEFAULT 'company-default' REFERENCES "companies"("id")
);

-- 4. Tabla Productos (Ingredientes crudos/Insumos)
-- precioCompra         = precio del empaque completo (ej. la caja)
-- cantidadEmpaque      = unidades por empaque (ej. 36 botellas)
-- cantidadPresentacion = contenido por unidad (ej. 244)
-- unidadMedida         = unidad del contenido (ej. Mililitros)
-- stock                = unidades individuales disponibles (ej. botellas)
CREATE TABLE "products" (
  "id" VARCHAR(100) PRIMARY KEY,
  "producto" VARCHAR(255) NOT NULL,
  "precioCompra" NUMERIC(20, 4) DEFAULT 0,
  "cantidadPresentacion" NUMERIC(20, 4) DEFAULT 0,
  "cantidadEmpaque" NUMERIC(20, 4) DEFAULT 0,
  "unidadMedida" VARCHAR(100),
  "unidadMedidaId" VARCHAR(100) REFERENCES "units"("id") ON DELETE SET NULL,
  "codigoBarra" VARCHAR(100),
  "stock" NUMERIC(20, 4) DEFAULT 0,
  "companyId" VARCHAR(100) DEFAULT 'company-default' REFERENCES "companies"("id")
);

-- 5. Tabla Recetas (Sub-recetas y recetas de preparación)
-- labor = [{ "role": "COCINERO", "hourlyRate": 12.50, "hours": 0.5 }, ...]
-- cost  = (insumos + Σ(hourlyRate×hours)) / (1 - merma/100)
CREATE TABLE "recipes" (
  "id" VARCHAR(100) PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "cost" NUMERIC(20, 4) DEFAULT 0,
  "profit" NUMERIC(20, 4) DEFAULT 0,
  "price" NUMERIC(20, 4) DEFAULT 0,
  "weight" NUMERIC(20, 4) DEFAULT 0,
  "merma" NUMERIC(20, 4) DEFAULT 0,
  "coin" VARCHAR(10) DEFAULT 'USD',
  "isActive" BOOLEAN DEFAULT TRUE,
  "labor" JSONB DEFAULT '[]',
  "companyId" VARCHAR(100) DEFAULT 'company-default' REFERENCES "companies"("id")
);

-- 6. Tabla Ingredientes (Detalle de cada receta)
CREATE TABLE "ingredients" (
  "id" VARCHAR(100) PRIMARY KEY,
  "recipeId" VARCHAR(100) NOT NULL REFERENCES "recipes"("id") ON DELETE CASCADE,
  "productId" VARCHAR(100) REFERENCES "products"("id") ON DELETE SET NULL,
  "subRecipeId" VARCHAR(100) REFERENCES "recipes"("id") ON DELETE SET NULL,
  "description" VARCHAR(255),
  "unitOfMeasurement" VARCHAR(50),
  "quantityUnitOfMeasurement" NUMERIC(20, 4) DEFAULT 0,
  "quantity" NUMERIC(20, 4) DEFAULT 0,
  "cost" NUMERIC(20, 4) DEFAULT 0,
  "isActive" BOOLEAN DEFAULT TRUE
);

-- 7. Tabla Roles de Personal
CREATE TABLE "roles" (
  "id" VARCHAR(100) PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL UNIQUE,
  "permissions" TEXT[] DEFAULT '{}'::TEXT[],
  "companyId" VARCHAR(100) DEFAULT 'company-default' REFERENCES "companies"("id")
);

-- 8. Tabla Personal (Staff)
CREATE TABLE "staff" (
  "id" VARCHAR(100) PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(255),
  "phone" VARCHAR(100),
  "roleId" VARCHAR(100) REFERENCES "roles"("id") ON DELETE SET NULL,
  "isActive" BOOLEAN DEFAULT TRUE,
  "passwordHash" VARCHAR(255),
  "companyId" VARCHAR(100) DEFAULT 'company-default' REFERENCES "companies"("id")
);

-- Índice único parcial (ignora email vacío/NULL) e insensible a mayúsculas,
-- para poder usar el email como identificador de login.
CREATE UNIQUE INDEX staff_email_unique_idx
  ON "staff" (LOWER("email"))
  WHERE "email" IS NOT NULL AND "email" <> '';

-- 9. Tabla Menú (Platos listos para la venta)
CREATE TABLE "menu" (
  "id" VARCHAR(100) PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "price" NUMERIC(20, 4) DEFAULT 0,
  "description" TEXT,
  "category" VARCHAR(100),
  "imageUrl" TEXT,
  "stock" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT TRUE,
  "recipeId" VARCHAR(100) REFERENCES "recipes"("id"),
  "productId" VARCHAR(100) REFERENCES "products"("id"),
  "companyId" VARCHAR(100) DEFAULT 'company-default' REFERENCES "companies"("id")
);

-- 9b. Componentes de un platillo (combo): varias recetas/productos a la vez
CREATE TABLE "menu_components" (
  "id" VARCHAR(100) PRIMARY KEY,
  "menuId" VARCHAR(100) NOT NULL REFERENCES "menu"("id") ON DELETE CASCADE,
  "recipeId" VARCHAR(100) REFERENCES "recipes"("id"),
  "productId" VARCHAR(100) REFERENCES "products"("id"),
  "quantity" NUMERIC(20, 4) DEFAULT 1,
  "description" VARCHAR(255)
);
