-- Starter migration for PostgreSQL. Review and run migrations locally using `npx prisma migrate dev`.
-- This SQL creates the `Order` table matching the Prisma model in schema.prisma.
-- It uses the `pgcrypto` extension for UUID generation; ensure your Postgres server allows creating extensions.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "Order" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "productName" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "shipping" INTEGER NOT NULL,
  "total" INTEGER NOT NULL,
  "area" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);
