import { Resend } from 'resend'

type BookingRequestBody = {
  propertyId?: string
  propertyName?: string
  guests?: number
  checkIn?: string
  checkOut?: string
  email?: string
  whatsapp?: string | null
}

type VercelRequest = {
  method?: string
  body?: BookingRequestBody
}

type VercelResponse = {
  status: (code: number) => VercelResponse
  json: (body: unknown) => void
}

const TO_EMAIL = 'saninoc84@gmail.com'

function isValidEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value)
}

function isValidWhatsapp(value: string): boolean {
  return /^[+]?[- 0-9()]{6,20}$/.test(value)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const body = req.body ?? {}

  const propertyName = String(body.propertyName ?? '').trim()
  const guests = Number(body.guests)
  const checkIn = String(body.checkIn ?? '').trim()
  const checkOut = String(body.checkOut ?? '').trim()
  const email = String(body.email ?? '').trim()
  const whatsapp = String(body.whatsapp ?? '').trim()

  if (!propertyName || !checkIn || !checkOut || !email) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  if (!Number.isFinite(guests) || guests < 1 || guests > 4) {
    return res.status(400).json({ message: 'Guests must be between 1 and 4' })
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email' })
  }

  if (whatsapp && !isValidWhatsapp(whatsapp)) {
    return res.status(400).json({ message: 'Invalid WhatsApp number' })
  }

  if (checkOut <= checkIn) {
    return res.status(400).json({ message: 'Check-out must be after check-in' })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  const resendFrom =
    process.env.RESEND_FROM || 'Case Vacanze Cefalù <onboarding@resend.dev>'

  if (!resendApiKey) {
    return res.status(500).json({ message: 'RESEND_API_KEY is missing' })
  }

  const resend = new Resend(resendApiKey)

  const messageLines = [
    'Nuova richiesta prenotazione',
    '',
    `Casa: ${propertyName}`,
    `Ospiti: ${guests}`,
    `Check-in: ${checkIn}`,
    `Check-out: ${checkOut}`,
    `Email cliente: ${email}`,
    `WhatsApp: ${whatsapp || 'non fornito'}`,
  ]

  try {
    const { error } = await resend.emails.send({
      from: resendFrom,
      to: TO_EMAIL,
      replyTo: email,
      subject: `Richiesta prenotazione - ${propertyName}`,
      text: messageLines.join('\n'),
    })

    if (error) {
      return res.status(500).json({ message: 'Failed to send email' })
    }

    return res.status(200).json({ ok: true })
  } catch {
    return res.status(500).json({ message: 'Failed to send email' })
  }
}
