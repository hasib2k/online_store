/*
  Simple migration helper: import orders from data/orders.json into Prisma DB.
  Usage (after `npx prisma generate`):
    node -r ts-node/register scripts/migrate-orders.ts

  Notes:
  - This script expects Prisma client is configured and `prisma` package is installed.
  - It will attempt to dedupe by phone+address+total+customerName.
  - Run in a safe environment and backup your DB before running.
*/

import fs from 'fs';
import path from 'path';

async function main() {
  const dataPath = path.join(process.cwd(), 'data', 'orders.json');
  if (!fs.existsSync(dataPath)) {
    console.error('No data/orders.json found; nothing to migrate.');
    process.exit(1);
  }

  const raw = fs.readFileSync(dataPath, 'utf8');
  const orders = JSON.parse(raw || '[]');
  if (!orders.length) {
    console.log('No orders to migrate.');
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    for (const o of orders) {
      const where = {
        phone: o.phone || '',
        address: o.address || '',
        total: Number(o.total) || 0,
        customerName: o.customerName || '',
      };

      const exists = await prisma.order.findFirst({ where });
      if (exists) {
        console.log('Skipping duplicate:', where);
        continue;
      }

      // Map fields if schema differs; assumes Order model uses these fields
      await prisma.order.create({
        data: {
          id: String(o.id || o.generatedKey || undefined),
          productName: o.productName || o.productName || 'product',
          price: Number(o.price || 0),
          quantity: Number(o.quantity || 1),
          shipping: Number(o.shipping || 0),
          total: Number(o.total || 0),
          area: o.area || 'inside',
          customerName: o.customerName || o.name || '',
          phone: o.phone || '',
          address: o.address || '',
          status: o.status === 'completed' ? 'completed' : 'pending',
          // createdAt will default to now() if not provided by schema
        },
      });
      console.log('Imported order for', o.customerName || o.phone);
    }
  } catch (e) {
    console.error('Migration failed', e);
  } finally {
    try { await prisma.$disconnect(); } catch (e) {}
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
