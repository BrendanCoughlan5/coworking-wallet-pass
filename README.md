# Foxglove Cowork - fake Google Wallet pass

A pretend coworking membership pass you can add to Google Wallet on a Pixel. It's a **Generic pass**
with the class and object embedded in a signed JWT, so there are no API calls and no dependencies:
you just need a Wallet issuer ID and a service account key.

## One-time setup (about 10 minutes)

1. **Google Cloud project**: go to https://console.cloud.google.com, create a project (e.g. `wallet-test`).
2. **Enable the API**: APIs & Services -> Library -> search **Google Wallet API** -> Enable.
3. **Service account**: IAM & Admin -> Service Accounts -> Create. Name it anything, no roles needed.
   Open it -> Keys -> Add key -> Create new key -> **JSON**. Save the file as `keys/service-account.json`
   in this repo (it's gitignored).
4. **Wallet issuer account**: go to https://pay.google.com/business/console, sign up as an issuer, and
   copy your **Issuer ID** (a long number like `3388000000012345678`) from the Google Wallet API page.
5. **Authorize the service account**: in the Wallet console -> Users -> Invite a user -> enter the
   service account's email (the `client_email` in the JSON) with **Developer** (or Admin) access.
6. **Add yourself as a test user** (needed while the issuer is in demo mode): Wallet console ->
   Google Wallet API -> **Test accounts** -> add the Google account signed into your Pixel's wallet.

## Generate and add the pass

```bash
cp .env.example .env     # then edit ISSUER_ID and MEMBER_NAME
npm run pass             # Node 18+
```

It prints a `https://pay.google.com/gp/v/save/...` link (also written to `save-link.txt`).
Send it to your phone (message it to yourself, email, AirDrop-equivalent) and open it on the Pixel ->
tap **Add to Google Wallet**. Then open Wallet -> the pass -> show the QR code.

## Customizing

Everything lives in `generate-pass.mjs`: name, colors, fields, barcode, logo (`LOGO_URL` must be a
public HTTPS image). Re-run to get a new link; each run creates a new pass object.

## Notes

- Demo-mode issuers can only add passes for test accounts. Publishing for everyone requires Google's review.
- Never commit `keys/` or `.env`.
