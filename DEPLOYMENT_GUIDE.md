# CTools — Multi-Client Ecommerce Production Deployment Guide

This guide provides step-by-step instructions for deploying a new instance of **CTools** for a merchant or client.

---

## 📋 Architecture & Technology Stack

- **Framework**: Next.js 16 (App Router + React Server Components)
- **Database**: PostgreSQL (Supabase PostgreSQL / Managed Postgres) via Prisma ORM
- **Object Storage**: Supabase Storage (`ctools-media` bucket)
- **Payments**: Paystack API (Inline Payment & Webhooks)
- **Email Notifications**: Provider-Agnostic SMTP (Nodemailer)
- **Hosting Target**: Vercel Serverless / Node.js Runtime

---

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Create Supabase Project
1. Log into [Supabase Console](https://supabase.com/).
2. Create a new project named `ctools-[client-name]`.
3. Copy the **Transaction Pooler Connection String** (`DATABASE_URL`).

### Step 2: Configure Supabase Storage Bucket
1. In Supabase Dashboard, navigate to **Storage**.
2. Create a new bucket named `ctools-media`.
3. Toggle **Public Bucket** to `ON`.
4. Copy `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from Project Settings -> API.

### Step 3: Configure Paystack Account
1. Log into [Paystack Dashboard](https://dashboard.paystack.com/).
2. In Settings -> API Keys & Webhooks, copy your **Secret Key** (`PAYSTACK_SECRET_KEY`) and **Public Key** (`NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`).
3. Set Webhook URL to: `https://[client-domain].vercel.app/api/webhooks/paystack`.

### Step 4: Configure SMTP Email Credentials
1. Obtain SMTP provider credentials (Mailtrap, SendGrid, Amazon SES, or Postmark).
2. Copy `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_SECURE`.

### Step 5: Configure Environment Variables
Create `.env` based on `.env.example`:

```env
# Database
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgboiler=true"

# JWT Authentication Secret (32+ random characters)
JWT_SECRET="your-super-secret-jwt-key-32-chars-long"

# Paystack API Keys
PAYSTACK_SECRET_KEY="sk_live_xxxxxxxxx"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_live_xxxxxxxxx"

# Supabase Storage Integration
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# SMTP Email Notifications
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=587
SMTP_USER="smtp_user"
SMTP_PASS="smtp_pass"
SMTP_SECURE="false"
```

### Step 6: Deploy Database Schema & Client
Run the following commands locally or in CI/CD pipeline:

```bash
npx prisma db push
npx prisma generate
```

### Step 7: Deploy Frontend to Vercel
1. Import repository into [Vercel](https://vercel.com).
2. Add all environment variables from Step 5 to Vercel Project Settings.
3. Build command: `npm run build`.
4. Deploy project.

### Step 8: Initialize First Administrator Account
1. Open browser and visit: `https://[client-domain].vercel.app/admin/setup`.
2. Enter Merchant Admin Name, Email, and Password.
3. Submit form. The platform creates the primary administrator account and locks the setup route (`403 Forbidden` on future visits).

### Step 9: Configure Merchant Store Settings
1. Log into `/admin/settings`.
2. Update **Store Name**, **Description**, **Contact Email**, **Phone**, **WhatsApp**, and **Address**.
3. Upload **Store Logo** and **Favicon** using the Media Library.
4. Set **Primary & Secondary Theme Colors**.

### Step 10: Configure Shipping & Notifications
1. In `/admin/shipping`, configure shipping mode (`FREE`, `FLAT_RATE`, or `NEGOTIABLE`).
2. In `/admin/settings`, configure **Notification Sender Email** and **Merchant Alert Email**.

### Step 11: Add Categories & Products
1. In `/admin/categories`, add main categories and subcategories.
2. In `/admin/brands`, create product brands.
3. In `/admin/products/new`, create products, set prices, stock levels, variants, and upload images.

### Step 12: Configure Homepage CMS
1. In `/admin/homepage`, enable, reorder, and edit sections (Hero, Featured Products, Promo Banners, Testimonials).

### Step 13: Perform Verification Test Order
1. Open storefront (`/`).
2. Browse products, add an item to cart, proceed to checkout, enter shipping address, apply coupon, and test payment integration.
3. Verify order appears in `/admin/orders` and customer receives confirmation email.

---

## 🔒 Security Best Practices

1. **Never expose `PAYSTACK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `SMTP_PASS`** to client code.
2. **Never check `.env` into Git**. `.env.example` should contain placeholders only.
3. **Verify admin protection**: Unauthenticated attempts to access `/api/admin/*` must return `401/403`.
