# YojanaSetu

A bilingual, privacy-first front-end for helping people explore public-welfare entitlements.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run lint
npm run build
npm run preview
```

## Current product boundary

The app now uses a production Vite build, validates document images locally, and supports mobile camera capture. The scheme catalogue and eligibility logic are **demo data**: it must be connected to an owned, reviewed scheme-rules service before it is presented as an eligibility decision or used with real government identity documents. The client deliberately does not upload the selected image.

Before public launch, add authenticated server-side integrations for OCR, verified rules, consent/audit logging, support escalation, and regularly reviewed official application URLs.
