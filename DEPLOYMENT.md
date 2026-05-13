# ServeFlow Deployment Guide

## 1. Database

Use a PostgreSQL database provider.

Add:

```env
DATABASE_URL=
```

Then run:

```bash
pnpm dlx prisma db push
pnpm dlx prisma generate
```

## 2. Clerk

Create a Clerk app and add:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

## 3. Paystack

Create Paystack plans and add:

```env
PAYSTACK_SECRET_KEY=
PAYSTACK_STARTER_PLAN_CODE=
PAYSTACK_GROWTH_PLAN_CODE=
PAYSTACK_PREMIUM_PLAN_CODE=
```

Webhook URL:

```txt
https://your-domain.com/api/webhooks/paystack
```

## 4. WhatsApp Cloud API

Add:

```env
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_API_VERSION=v21.0
WHATSAPP_SEND_ENABLED=false
```

Webhook URL:

```txt
https://your-domain.com/api/webhooks/whatsapp
```

## 5. Vercel

Add all environment variables in Vercel dashboard.

Set:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 6. Final Safety

Keep:

```env
WHATSAPP_SEND_ENABLED=false
```

until all test flows are confirmed.
