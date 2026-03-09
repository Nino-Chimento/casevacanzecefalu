# Case Vacanze Cefalù

Applicazione React + Vite con pagina abitazioni e form richiesta prenotazione.

## Form email prenotazione

Il form invia una richiesta a `POST /api/send-booking-request` con:

- casa selezionata
- numero ospiti (massimo 4)
- date check-in/check-out
- email
- numero WhatsApp (opzionale)

L'endpoint invia l'email a `saninoc84@gmail.com`.

## Variabili ambiente (Vercel)

Configura queste variabili nel progetto Vercel:

- `RESEND_API_KEY`
- `RESEND_FROM` (opzionale, default: `Case Vacanze Cefalù <onboarding@resend.dev>`)

Con Resend non servono host/porta SMTP: basta la API key.

## Avvio locale

```bash
npm install
npm run dev
```
