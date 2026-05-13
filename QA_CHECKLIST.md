# ServeFlow QA Checklist

## Auth

- [ ] Sign up works
- [ ] Sign in works
- [ ] Dashboard is protected
- [ ] User creates default restaurant

## Restaurant Setup

- [ ] Business profile saves
- [ ] WhatsApp Phone Number ID saves
- [ ] Menu items save/edit/delete
- [ ] FAQs save/edit/delete
- [ ] Delivery zones save/delete

## Automation

- [ ] Automation saves
- [ ] Automation pauses/resumes
- [ ] Automation deletes
- [ ] Automation usage count increases from webhook

## WhatsApp Webhook

- [ ] GET verification returns challenge
- [ ] Mock POST creates conversation
- [ ] Menu request returns real menu
- [ ] Delivery request returns delivery zone fee
- [ ] Order intent creates order
- [ ] Address message updates order address
- [ ] WHATSAPP_SEND_ENABLED=false prevents real sending

## Inbox

- [ ] Conversations appear
- [ ] Messages appear
- [ ] Human takeover works
- [ ] Resume bot works
- [ ] Manual reply saves

## Orders

- [ ] Manual order creates
- [ ] WhatsApp order creates
- [ ] Delivery fee is added
- [ ] Order details page opens
- [ ] Status update works
- [ ] Status update saves message to conversation

## Customers

- [ ] Customers list loads
- [ ] Customer profile opens
- [ ] Message history shows
- [ ] Order history shows

## Billing

- [ ] Billing page loads subscription
- [ ] Plan usage shows
- [ ] Checkout initializes
- [ ] Paystack webhook rejects unsigned requests
- [ ] Paystack webhook activates subscription with valid event

## Production

- [ ] Env checklist shows missing/set variables
- [ ] Deployment checklist is accessible
- [ ] NEXT_PUBLIC_APP_URL is correct
- [ ] Webhook URLs are set in Paystack and Meta
