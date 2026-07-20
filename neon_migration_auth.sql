-- Migración: soporte de login (email + contraseña) para staff.
-- Copia y pega esto en la sección 'SQL Editor' de tu consola de Neon.

ALTER TABLE "staff" ADD COLUMN IF NOT EXISTS "passwordHash" VARCHAR(255);

-- Índice único parcial (ignora filas con email vacío/NULL, que ya existen hoy)
-- e insensible a mayúsculas, para usar el email como identificador de login.
CREATE UNIQUE INDEX IF NOT EXISTS staff_email_unique_idx
  ON "staff" (LOWER("email"))
  WHERE "email" IS NOT NULL AND "email" <> '';
