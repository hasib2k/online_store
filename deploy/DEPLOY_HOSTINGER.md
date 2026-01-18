# Hostinger VPS deployment checklist (Next.js App Router)

This is a minimal focused guide to deploy this project on a Hostinger VPS (Ubuntu + Node.js). 

Prerequisites
- Ubuntu 20.04+ on VPS
- Node.js 18+ installed
- PM2 installed globally (`npm i -g pm2`)
- Nginx + Certbot for TLS

Steps
1. Clone repo to server
```bash
cd /var/www
git clone <your-repo-url> online_store
cd online_store
```

2. Install dependencies
```bash
npm ci
```

3. Set environment
```bash
cp .env.example .env
# edit .env and set ADMIN_PASSWORD, DATABASE_URL, NEXT_PUBLIC_BASE_URL, NEXTAUTH_SECRET
```

4. Prisma (migrations)
- If you created migrations locally, run:
```bash
npx prisma migrate deploy
npx prisma generate
```
- If you haven't, create and test migrations locally and commit them before running deploy.

5. Build
```bash
npm run build
```

6. Start with PM2
```bash
pm2 start deploy/ecosystem.config.js --env production
pm2 save
pm2 startup systemd
# run the printed command (sudo) to enable PM2 on boot
```

7. Nginx
- Copy `deploy/nginx.conf.example` to `/etc/nginx/sites-available/online_store` and replace `example.com`.
- Enable site and reload:
```bash
ln -s /etc/nginx/sites-available/online_store /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```
- Obtain TLS certs using Certbot:
```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

Notes & best practices
- Keep `.env` on the server only and out of git.
- Use Postgres (recommended) and run migrations.
- Replace header-based admin authentication with session cookies (HttpOnly) for production.
- Add rate-limiting for admin endpoints.

Optional
- Use PM2 cluster mode for multi-core servers (see `deploy/ecosystem.config.js`).
- Add `scripts/migrate-orders.ts` to import `data/orders.json` into your DB (I added a helper script in `scripts/`).

