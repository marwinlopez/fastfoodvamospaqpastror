-- Migración: empresas (multi-tenant)
-- Cada empresa (tenant) tiene sus datos de marca, moneda y tema.
-- Todas las tablas de negocio llevan "companyId" para poder aislar
-- los datos por empresa (los registros existentes quedan en la
-- empresa por defecto "company-default").

CREATE TABLE IF NOT EXISTS "companies" (
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
VALUES ('company-default', 'PA Q'' PASTOR', 'Venta de comida')
ON CONFLICT ("id") DO NOTHING;

-- Base multi-tenant: companyId en cada tabla de negocio
ALTER TABLE "staff"      ADD COLUMN IF NOT EXISTS "companyId" VARCHAR(100) DEFAULT 'company-default' REFERENCES "companies"("id");
ALTER TABLE "products"   ADD COLUMN IF NOT EXISTS "companyId" VARCHAR(100) DEFAULT 'company-default' REFERENCES "companies"("id");
ALTER TABLE "recipes"    ADD COLUMN IF NOT EXISTS "companyId" VARCHAR(100) DEFAULT 'company-default' REFERENCES "companies"("id");
ALTER TABLE "menu"       ADD COLUMN IF NOT EXISTS "companyId" VARCHAR(100) DEFAULT 'company-default' REFERENCES "companies"("id");
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "companyId" VARCHAR(100) DEFAULT 'company-default' REFERENCES "companies"("id");
ALTER TABLE "units"      ADD COLUMN IF NOT EXISTS "companyId" VARCHAR(100) DEFAULT 'company-default' REFERENCES "companies"("id");
ALTER TABLE "roles"      ADD COLUMN IF NOT EXISTS "companyId" VARCHAR(100) DEFAULT 'company-default' REFERENCES "companies"("id");
