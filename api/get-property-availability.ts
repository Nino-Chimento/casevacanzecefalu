type AvailabilityRange = {
  startDate: string
  endDate: string
}

type VercelRequest = {
  method?: string
  query?: {
    propertyId?: string
  }
}

type VercelResponse = {
  status: (code: number) => VercelResponse
  json: (body: unknown) => void
}

const CALENDAR_BY_PROPERTY_ID: Record<string, string> = {
  'casa-thalassa-cefalu':
    'https://ical.booking.com/v1/export?t=4fd156b6-02b8-4177-832a-25f4a9af5982',
  'casa-al-vecchio-molo':
    'https://ical.booking.com/v1/export?t=c8ef116d-f049-4dc7-93c5-f309a71e85dc',
}

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return toIsoDate(date)
}

function normalizeIcsDate(rawValue: string): string | null {
  const compact = rawValue.trim().replace(/[^0-9]/g, '')
  if (compact.length < 8) {
    return null
  }

  const yyyy = compact.slice(0, 4)
  const mm = compact.slice(4, 6)
  const dd = compact.slice(6, 8)
  return `${yyyy}-${mm}-${dd}`
}

function unfoldIcsLines(icsText: string): string[] {
  const rawLines = icsText.replace(/\r/g, '').split('\n')
  const unfolded: string[] = []

  for (const line of rawLines) {
    if (!line) {
      continue
    }

    if ((line.startsWith(' ') || line.startsWith('\t')) && unfolded.length > 0) {
      unfolded[unfolded.length - 1] += line.slice(1)
      continue
    }

    unfolded.push(line)
  }

  return unfolded
}

function mergeRanges(ranges: AvailabilityRange[]): AvailabilityRange[] {
  if (ranges.length < 2) {
    return ranges
  }

  const sorted = [...ranges].sort((a, b) => a.startDate.localeCompare(b.startDate))
  const merged: AvailabilityRange[] = [sorted[0]]

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index]
    const last = merged[merged.length - 1]

    if (current.startDate <= last.endDate) {
      if (current.endDate > last.endDate) {
        last.endDate = current.endDate
      }
      continue
    }

    merged.push({ ...current })
  }

  return merged
}

function parseBlockedRangesFromIcs(icsText: string): AvailabilityRange[] {
  const lines = unfoldIcsLines(icsText)
  const ranges: AvailabilityRange[] = []
  let insideEvent = false
  let currentStart: string | null = null
  let currentEnd: string | null = null

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      insideEvent = true
      currentStart = null
      currentEnd = null
      continue
    }

    if (line === 'END:VEVENT') {
      if (insideEvent && currentStart) {
        const normalizedEnd =
          currentEnd && currentEnd > currentStart ? currentEnd : addDays(currentStart, 1)

        ranges.push({
          startDate: currentStart,
          endDate: normalizedEnd,
        })
      }

      insideEvent = false
      currentStart = null
      currentEnd = null
      continue
    }

    if (!insideEvent) {
      continue
    }

    if (line.startsWith('DTSTART')) {
      const value = line.split(':').slice(1).join(':')
      currentStart = normalizeIcsDate(value)
      continue
    }

    if (line.startsWith('DTEND')) {
      const value = line.split(':').slice(1).join(':')
      currentEnd = normalizeIcsDate(value)
    }
  }

  return mergeRanges(ranges)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const propertyId = String(req.query?.propertyId ?? '').trim()

  if (!propertyId) {
    return res.status(400).json({ message: 'propertyId is required' })
  }

  const calendarUrl = CALENDAR_BY_PROPERTY_ID[propertyId]

  if (!calendarUrl) {
    return res.status(200).json({ unavailableRanges: [], source: 'none' })
  }

  try {
    const response = await fetch(calendarUrl)
    if (!response.ok) {
      let responseText = ''

      try {
        responseText = await response.text()
      } catch {
        responseText = ''
      }

      if (response.status === 400 && /invalid token/i.test(responseText)) {
        return res.status(200).json({
          unavailableRanges: [],
          source: 'invalid-token',
          propertyId,
          lastSyncAt: new Date().toISOString(),
        })
      }

      return res.status(200).json({
        unavailableRanges: [],
        source: 'unavailable',
        propertyId,
        lastSyncAt: new Date().toISOString(),
      })
    }

    const icsText = await response.text()
    const unavailableRanges = parseBlockedRangesFromIcs(icsText)

    return res.status(200).json({
      unavailableRanges,
      source: 'booking-ical',
      propertyId,
      lastSyncAt: new Date().toISOString(),
    })
  } catch {
    return res.status(200).json({
      unavailableRanges: [],
      source: 'unavailable',
      propertyId,
      lastSyncAt: new Date().toISOString(),
    })
  }
}
