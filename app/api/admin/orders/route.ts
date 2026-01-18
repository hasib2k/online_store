import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(req: Request) {
  try {
    // Accept either header-based admin password (legacy) or session cookie
    const adminPassword = process.env.ADMIN_PASSWORD;
    const cookieHeader = req.headers.get('cookie') || null;
    const { getCookieFromHeader, verifyAdminToken } = await import('../../../../lib/adminAuth');
    const sessionToken = getCookieFromHeader(cookieHeader);
    const headerProvided = req.headers.get('x-admin-password') || '';
    const headerOk = adminPassword ? headerProvided === adminPassword : false;
    const cookieOk = verifyAdminToken(sessionToken);
    if (adminPassword) {
      if (!headerOk && !cookieOk) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
    }
    // Try to read from both Prisma (if available) and local file, then merge.
    let dbRows: any[] = [];
    if (process.env.DATABASE_URL) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        dbRows = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
        try { await prisma.$disconnect(); } catch (e) {}
      } catch (e) {
        console.error('Prisma read failed, continuing with file fallback', e);
        dbRows = [];
      }
    }

    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'orders.json');
    let fileOrders: any[] = [];
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      fileOrders = JSON.parse(raw || '[]');
    } catch (e) {
      fileOrders = [];
    }

    // Normalize numeric IDs in file orders when possible and attach a raw ISO timestamp when available
    const parseDisplayDate = (s: string) => {
      if (!s || typeof s !== 'string') return null;
      // Accept formats like: DD-MM-YYYY, hh:mm:ss AM/PM or DD-MM-YYYY, hh:mm AM/PM (seconds optional)
      const m = s.match(/(\d{2})-(\d{2})-(\d{4}),\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)/i);
      if (!m) return null;
      const day = Number(m[1]);
      const month = Number(m[2]) - 1;
      const year = Number(m[3]);
      let hour = Number(m[4]);
      const minute = Number(m[5]);
      const second = m[6] ? Number(m[6]) : 0;
      const ampm = (m[7] || '').toUpperCase();
      if (ampm === 'PM' && hour < 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
      const dt = new Date(year, month, day, hour, minute, second);
      return isNaN(dt.getTime()) ? null : dt.toISOString();
    };

    fileOrders = fileOrders.map((f: any) => ({
      ...f,
      id: !isNaN(Number(f.id)) ? String(Number(f.id)) : String(f.id),
      createdAtRaw: f.createdAt ? (parseDisplayDate(f.createdAt) || null) : null,
    }));

    // Helper to format dates like file fallback (DD-MM-YYYY, hh:mm:ss AM/PM)
    const formatDateForDisplay = (d = new Date()) => {
      const dt = new Date(d);
      const day = String(dt.getDate()).padStart(2, '0');
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      const year = dt.getFullYear();
      let hours = dt.getHours();
      const minutes = String(dt.getMinutes()).padStart(2, '0');
      const seconds = String(dt.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      if (hours === 0) hours = 12;
      const hourStr = String(hours).padStart(2, '0');
      return `${day}-${month}-${year}, ${hourStr}:${minutes}:${seconds} ${ampm}`;
    };

    // Normalize DB rows' createdAt (with seconds) and include raw ISO; coerce numeric IDs
    const dbFormatted = dbRows.map((r: any) => {
      const num = Number(r.id);
      const idStr = !isNaN(num) ? String(num) : String(r.id);
      return {
        ...r,
        id: idStr,
        createdAt: r.createdAt ? formatDateForDisplay(r.createdAt) : '',
        createdAtRaw: r.createdAt ? (new Date(r.createdAt)).toISOString() : '',
      };
    });

    const dbIds = new Set(dbFormatted.map((r: any) => String(r.id)));
    // Merge with file orders, skipping file entries that match DB ids
    let merged = [
      ...dbFormatted,
      ...fileOrders.filter((f: any) => !dbIds.has(String(f.id))),
    ];

    // Final dedupe by signature (phone|address|total|customerName) prefer DB entries
    const seen = new Set<string>();
    const deduped: any[] = [];
    for (const item of merged) {
      const key = `${String(item.phone||'')}|${String(item.address||'')}|${String(item.total||'')}|${String(item.customerName||'')}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(item);
    }
    merged = deduped;

    // Ensure each item has a comparable raw timestamp for sorting (prefer DB raw ISO, then file-derived raw)
    merged = merged.map((it: any) => ({
      ...it,
      createdAtRaw: it.createdAtRaw || (it.createdAtRaw === null ? null : (it.createdAtRaw || null)) || (it.createdAt ? null : null),
    }));

    // Deterministic generated key from existing id (stable across requests)
    const deterministicKeyFromId = (id: string, len = 10) => {
      if (!id) return null;
      // simple deterministic hash (djb2) -> letters A-Z
      let h = 5381;
      for (let i = 0; i < id.length; i++) {
        h = ((h << 5) + h) + id.charCodeAt(i); /* h * 33 + c */
        h = h & 0xffffffff;
      }
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let s = '';
      let v = Math.abs(h);
      for (let i = 0; i < len; i++) {
        s += letters[v % letters.length];
        v = Math.floor(v / letters.length) || (v ^ 0x1234567);
      }
      return s;
    };

    // Sort newest first. Use createdAtRaw ISO when available, otherwise try Date.parse(createdAt), otherwise keep original order.
    merged.sort((a: any, b: any) => {
      const ta = a.createdAtRaw ? Date.parse(a.createdAtRaw) : (a.createdAt ? Date.parse(a.createdAt) : 0);
      const tb = b.createdAtRaw ? Date.parse(b.createdAtRaw) : (b.createdAt ? Date.parse(b.createdAt) : 0);
      return (tb || 0) - (ta || 0);
    });

    // Ensure every order has a stable generatedKey property (prefer existing, otherwise deterministic from id)
    merged = merged.map((it: any) => ({
      ...it,
      generatedKey: it.generatedKey || it.key || deterministicKeyFromId(String(it.id)) || String(it.id),
    }));

    // Attach a simple sequential displayId (1,2,3...) for UI display (newest order -> displayId 1)
    const withDisplay = merged.map((it: any, idx: number) => ({
      ...it,
      displayId: idx + 1,
    }));

    return NextResponse.json({ orders: withDisplay });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Accept header or session cookie for admin actions (delete/complete/pending)
    const adminPassword2 = process.env.ADMIN_PASSWORD;
    const cookieHeader2 = req.headers.get('cookie') || null;
    const { getCookieFromHeader: getCookie2, verifyAdminToken: verify2 } = await import('../../../../lib/adminAuth');
    const sessionToken2 = getCookie2(cookieHeader2);
    const provided2 = req.headers.get('x-admin-password') || '';
    const headerOk2 = adminPassword2 ? provided2 === adminPassword2 : false;
    const cookieOk2 = verify2(sessionToken2);
    if (adminPassword2) {
      if (!headerOk2 && !cookieOk2) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await req.json().catch(() => ({}));
    const { id, action } = body || {};
    if (!id || !action) {
      return NextResponse.json({ message: 'Missing id or action' }, { status: 400 });
    }

    // If DATABASE_URL is present, try Prisma update/delete
    if (process.env.DATABASE_URL) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        if (action === 'delete') {
          await prisma.order.delete({ where: { id: String(id) } });
          try { await prisma.$disconnect(); } catch (e) {}
          return NextResponse.json({ ok: true, message: 'Deleted' });
        }

        if (action === 'complete' || action === 'pending') {
          const status = action === 'complete' ? 'completed' : 'pending';
          const updated = await prisma.order.update({ where: { id: String(id) }, data: { status } });
          try { await prisma.$disconnect(); } catch (e) {}
          return NextResponse.json({ ok: true, order: updated });
        }
      } catch (e) {
        console.error('Prisma update failed, falling back to file', e);
      }
    }

    // File fallback
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'orders.json');
    let orders: any[] = [];
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      orders = JSON.parse(raw || '[]');
    } catch (e) {
      orders = [];
    }

    const idx = orders.findIndex((o: any) => String(o.id) === String(id));
    if (idx === -1) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (action === 'delete') {
      orders.splice(idx, 1);
    } else if (action === 'complete' || action === 'pending') {
      orders[idx].status = action === 'complete' ? 'completed' : 'pending';
    } else {
      return NextResponse.json({ message: 'Unknown action' }, { status: 400 });
    }

    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(orders, null, 2), 'utf8');

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin orders POST error', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
