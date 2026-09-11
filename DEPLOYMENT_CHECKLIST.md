# CTools — Deployment Checklist

Use this checklist before and after deploying CTools for a client.

---

## 🟢 Pre-Deployment Checklist

- [ ] PostgreSQL database created & `DATABASE_URL` configured
- [ ] `JWT_SECRET` generated (32+ characters)
- [ ] Supabase project created & `ctools-media` public storage bucket initialized
- [ ] `SUPABASE_SERVICE_ROLE_KEY` & `NEXT_PUBLIC_SUPABASE_URL` configured
- [ ] Paystack account activated & API keys copied (`PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`)
- [ ] Paystack Webhook URL configured to `https://[domain]/api/webhooks/paystack`
- [ ] SMTP host, port, credentials & `SMTP_SECURE` configured
- [ ] `npx prisma db push` executed successfully against target database
- [ ] `npx prisma validate` passed with 0 errors
- [ ] `npm run lint` passed with 0 errors
- [ ] `npm run build` passed with 0 errors

---

## 🟡 Post-Deployment Checklist

- [ ] Visited `/admin/setup` and created initial merchant administrator account
- [ ] Verified `/admin/setup` returns `403 Forbidden` on subsequent visits
- [ ] Store Settings configured in `/admin/settings` (Store Name, Logo, Favicon, Contact Info, Theme Colors)
- [ ] Shipping configuration updated in `/admin/shipping` (Free / Flat Rate / Negotiable)
- [ ] Email notification preferences configured in `/admin/settings` (Sender Email, Merchant Alert Email)
- [ ] Categories, Brands, and Products published in Admin Console
- [ ] Homepage CMS sections enabled, ordered, and populated in `/admin/homepage`

---

## 🔒 Security Verification Checklist

- [ ] Server secrets (`JWT_SECRET`, `PAYSTACK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_PASS`) are NOT exposed in client JavaScript bundles
- [ ] `/api/settings/public` endpoint returns ONLY public storefront fields (no email secrets)
- [ ] Guest & customer requests to `/api/admin/*` are blocked with `401 Unauthorized` or `403 Forbidden`
- [ ] Order total calculations and payment verification remain server-authoritative
- [ ] Media upload endpoint enforces file size (<= 5MB) and MIME type whitelist server-side
- [ ] Test purchase completed successfully and order status verified in `/admin/orders`
