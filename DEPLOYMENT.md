# ServeFlow Production Deployment

## 1. Database

- Create a production PostgreSQL database.
- Add `DATABASE_URL` to production environment variables.
- Run:

```bash
pnpm dlx prisma db push
pnpm dlx prisma generate
```

## 2. App URL

Set:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 3. WhatsApp Cloud API

Set:

```env
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_API_VERSION=v21.0
WHATSAPP_SEND_ENABLED=false
```

Webhook callback:

```txt
https://your-domain.com/api/webhooks/whatsapp
```

Enable real sending only after inbound testing works:

```env
WHATSAPP_SEND_ENABLED=true
```

## 4. AI

Set:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=
AI_MODEL=gpt-5.2-mini
AI_RESPONSES_ENABLED=false
```

Enable AI only after restaurant data is complete.

## 5. Media / Replicate

Set only if using media generation:

```env
REPLICATE_API_TOKEN=
REPLICATE_IMAGE_MODEL=black-forest-labs/flux-schnell
MEDIA_GENERATION_ENABLED=false
```

## 6. Final Checks

- Run security review.
- Run mobile audit.
- Test pilot restaurant.
- Confirm WhatsApp test send.
- Confirm AI cost limits.
- Confirm report export.

## 7. Real Pilot Launch

Before onboarding a real restaurant:

- Complete restaurant profile.
- Add menu, delivery zones, FAQs, and knowledge base.
- Configure WhatsApp webhook.
- Test inbound message.
- Test manual reply.
- Test AI suggestion.
- Test blocked AI safety.
- Test order flow.
- Test human takeover.
- Keep auto-reply disabled until owner approves.
- Approve go-live only after all pilot tests pass.

## Batch 98 Complete

```txt
Production checklist added
Env status helper added
Deployment readiness page added
Production env example added
Deployment notes file added
Final check links updated
```
