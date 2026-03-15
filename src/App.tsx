import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Lightbox from 'yet-another-react-lightbox'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/styles.css'
import './App.css'
import { getVacationHomes } from './services/propertiesService'
import type { VacationHome } from './types/property'

type Language = 'it' | 'en' | 'es' | 'fr'

type BookingFormValues = {
  propertyId: string
  guests: number
  checkIn: string
  checkOut: string
  email: string
  whatsapp?: string
}

type AvailabilityRange = {
  startDate: string
  endDate: string
}

const uiText = {
  it: {
    languageSelector: 'Selettore lingua',
    heroEyebrow: 'Case vacanze a Cefalù',
    heroTitle: 'Due abitazioni nel cuore della costa siciliana',
    heroText:
      'Scopri Casa Thalassa e Casa al Vecchio Molo: due soluzioni curate per soggiorni rilassanti tra mare, centro storico e autenticità.',
    heroCta: 'Scopri le abitazioni',
    loading: 'Caricamento abitazioni...',
    loadError: 'Non è stato possibile caricare le abitazioni al momento.',
    mapLabel: 'Posizione',
    openGallery: 'Apri galleria',
    photos: 'foto',
    booking: '🛎️ Vedi annuncio',
    openMaps: '🗺️ Apri in Maps',
    directions: '🚗 Ottieni indicazioni',
    closeGallery: 'Chiudi galleria',
    prevPhoto: 'Foto precedente',
    nextPhoto: 'Foto successiva',
    photo: 'Foto',
    of: 'di',
    keyboardHint: 'usa ← → per navigare, Esc per chiudere',
    bookingFormTitle: 'Richiedi informazioni per prenotare',
    bookingFormSubtitle:
      'Compila il form: ti ricontattiamo via email con disponibilità e dettagli.',
    propertyLabel: 'Casa',
    propertyPlaceholder: 'Seleziona una casa',
    guestsLabel: 'Numero ospiti (max 4)',
    checkInLabel: 'Data check-in',
    checkOutLabel: 'Data check-out',
    emailLabel: 'Email',
    whatsappLabel: 'Numero WhatsApp (opzionale)',
    submitLabel: 'Invia richiesta',
    sendingLabel: 'Invio in corso...',
    bookingSuccess: 'Richiesta inviata correttamente. Ti risponderemo al più presto.',
    bookingError: 'Errore durante l’invio della richiesta. Riprova.',
    validationRequired: 'Campo obbligatorio',
    validationGuestsMin: 'Minimo 1 ospite',
    validationGuestsMax: 'Massimo 4 ospiti',
    validationEmail: 'Inserisci un indirizzo email valido',
    validationDateOrder: 'La data di check-out deve essere successiva al check-in',
    validationWhatsapp: 'Inserisci un numero WhatsApp valido',
    availabilityLoading: 'Verifica disponibilita in corso...',
    availabilitySynced: 'Disponibilita sincronizzata da Booking.com.',
    availabilityUnavailable: 'Le date selezionate non sono disponibili.',
    availabilityError: 'Impossibile verificare la disponibilita adesso.',
    availabilityLocalDev:
      'Sincronizzazione disponibilita non attiva in npm run dev. Usa vercel dev o produzione.',
    availabilityInvalidToken:
      'Link iCal Booking non valido o scaduto. Rigenera il link da Extranet e aggiornalo.',
    availabilityFeedUnavailable:
      'Feed Booking temporaneamente non disponibile. Prova di nuovo tra poco.',
  },
  en: {
    languageSelector: 'Language selector',
    heroEyebrow: 'Vacation homes in Cefalù',
    heroTitle: 'Two homes in the heart of the Sicilian coast',
    heroText:
      'Discover Casa Thalassa and Casa al Vecchio Molo: two curated homes for relaxing stays between the sea, old town charm, and authentic atmosphere.',
    heroCta: 'Discover homes',
    loading: 'Loading homes...',
    loadError: 'We could not load the homes at the moment.',
    mapLabel: 'Location',
    openGallery: 'Open gallery',
    photos: 'photos',
    booking: '🛎️ View listing',
    openMaps: '🗺️ Open in Maps',
    directions: '🚗 Get directions',
    closeGallery: 'Close gallery',
    prevPhoto: 'Previous photo',
    nextPhoto: 'Next photo',
    photo: 'Photo',
    of: 'of',
    keyboardHint: 'use ← → to navigate, Esc to close',
    bookingFormTitle: 'Request booking information',
    bookingFormSubtitle:
      'Fill out the form and we will contact you by email with availability and details.',
    propertyLabel: 'Home',
    propertyPlaceholder: 'Select a home',
    guestsLabel: 'Number of guests (max 4)',
    checkInLabel: 'Check-in date',
    checkOutLabel: 'Check-out date',
    emailLabel: 'Email',
    whatsappLabel: 'WhatsApp number (optional)',
    submitLabel: 'Send request',
    sendingLabel: 'Sending...',
    bookingSuccess: 'Request sent successfully. We will get back to you soon.',
    bookingError: 'Error sending request. Please try again.',
    validationRequired: 'Required field',
    validationGuestsMin: 'Minimum 1 guest',
    validationGuestsMax: 'Maximum 4 guests',
    validationEmail: 'Please enter a valid email address',
    validationDateOrder: 'Check-out date must be after check-in',
    validationWhatsapp: 'Please enter a valid WhatsApp number',
    availabilityLoading: 'Checking availability...',
    availabilitySynced: 'Availability synced from Booking.com.',
    availabilityUnavailable: 'Selected dates are not available.',
    availabilityError: 'We cannot verify availability right now.',
    availabilityLocalDev:
      'Availability sync is not active in npm run dev. Use vercel dev or production.',
    availabilityInvalidToken:
      'Booking iCal link is invalid or expired. Regenerate it in the Extranet and update it.',
    availabilityFeedUnavailable:
      'Booking feed is temporarily unavailable. Please try again later.',
  },
  es: {
    languageSelector: 'Selector de idioma',
    heroEyebrow: 'Casas vacacionales en Cefalú',
    heroTitle: 'Dos viviendas en el corazón de la costa siciliana',
    heroText:
      'Descubre Casa Thalassa y Casa al Vecchio Molo: dos opciones cuidadas para estancias relajantes entre mar, centro histórico y autenticidad.',
    heroCta: 'Descubrir alojamientos',
    loading: 'Cargando alojamientos...',
    loadError: 'No ha sido posible cargar los alojamientos en este momento.',
    mapLabel: 'Ubicación',
    openGallery: 'Abrir galería',
    photos: 'fotos',
    booking: '🛎️ Ver anuncio',
    openMaps: '🗺️ Abrir en Maps',
    directions: '🚗 Obtener indicaciones',
    closeGallery: 'Cerrar galería',
    prevPhoto: 'Foto anterior',
    nextPhoto: 'Siguiente foto',
    photo: 'Foto',
    of: 'de',
    keyboardHint: 'usa ← → para navegar, Esc para cerrar',
    bookingFormTitle: 'Solicita información para reservar',
    bookingFormSubtitle:
      'Completa el formulario: te contactaremos por email con disponibilidad y detalles.',
    propertyLabel: 'Alojamiento',
    propertyPlaceholder: 'Selecciona un alojamiento',
    guestsLabel: 'Número de huéspedes (máx. 4)',
    checkInLabel: 'Fecha de check-in',
    checkOutLabel: 'Fecha de check-out',
    emailLabel: 'Email',
    whatsappLabel: 'Número de WhatsApp (opcional)',
    submitLabel: 'Enviar solicitud',
    sendingLabel: 'Enviando...',
    bookingSuccess: 'Solicitud enviada correctamente. Te responderemos lo antes posible.',
    bookingError: 'Error al enviar la solicitud. Inténtalo de nuevo.',
    validationRequired: 'Campo obligatorio',
    validationGuestsMin: 'Mínimo 1 huésped',
    validationGuestsMax: 'Máximo 4 huéspedes',
    validationEmail: 'Introduce un email válido',
    validationDateOrder: 'La fecha de check-out debe ser posterior al check-in',
    validationWhatsapp: 'Introduce un número de WhatsApp válido',
    availabilityLoading: 'Comprobando disponibilidad...',
    availabilitySynced: 'Disponibilidad sincronizada desde Booking.com.',
    availabilityUnavailable: 'Las fechas seleccionadas no están disponibles.',
    availabilityError: 'No podemos verificar la disponibilidad ahora.',
    availabilityLocalDev:
      'La sincronizacion de disponibilidad no esta activa en npm run dev. Usa vercel dev o produccion.',
    availabilityInvalidToken:
      'El enlace iCal de Booking no es valido o ha caducado. Regeneralo en Extranet y actualizalo.',
    availabilityFeedUnavailable:
      'El feed de Booking no esta disponible temporalmente. Intentalo mas tarde.',
  },
  fr: {
    languageSelector: 'Sélecteur de langue',
    heroEyebrow: 'Maisons de vacances à Cefalù',
    heroTitle: 'Deux logements au cœur de la côte sicilienne',
    heroText:
      'Découvrez Casa Thalassa et Casa al Vecchio Molo : deux solutions soignées pour des séjours relaxants entre mer, centre historique et authenticité.',
    heroCta: 'Découvrir les logements',
    loading: 'Chargement des logements...',
    loadError: 'Impossible de charger les logements pour le moment.',
    mapLabel: 'Emplacement',
    openGallery: 'Ouvrir la galerie',
    photos: 'photos',
    booking: '🛎️ Voir l’annonce',
    openMaps: '🗺️ Ouvrir dans Maps',
    directions: '🚗 Obtenir l’itinéraire',
    closeGallery: 'Fermer la galerie',
    prevPhoto: 'Photo précédente',
    nextPhoto: 'Photo suivante',
    photo: 'Photo',
    of: 'sur',
    keyboardHint: 'utilisez ← → pour naviguer, Esc pour fermer',
    bookingFormTitle: 'Demander des informations pour réserver',
    bookingFormSubtitle:
      'Remplissez le formulaire : nous vous contacterons par e-mail avec disponibilités et détails.',
    propertyLabel: 'Logement',
    propertyPlaceholder: 'Sélectionnez un logement',
    guestsLabel: 'Nombre de voyageurs (max 4)',
    checkInLabel: 'Date d’arrivée',
    checkOutLabel: 'Date de départ',
    emailLabel: 'E-mail',
    whatsappLabel: 'Numéro WhatsApp (optionnel)',
    submitLabel: 'Envoyer la demande',
    sendingLabel: 'Envoi en cours...',
    bookingSuccess: 'Demande envoyée avec succès. Nous vous répondrons au plus vite.',
    bookingError: 'Erreur lors de l’envoi de la demande. Réessayez.',
    validationRequired: 'Champ obligatoire',
    validationGuestsMin: 'Minimum 1 voyageur',
    validationGuestsMax: 'Maximum 4 voyageurs',
    validationEmail: 'Veuillez saisir une adresse e-mail valide',
    validationDateOrder: 'La date de départ doit être postérieure à la date d’arrivée',
    validationWhatsapp: 'Veuillez saisir un numéro WhatsApp valide',
    availabilityLoading: 'Verification des disponibilites en cours...',
    availabilitySynced: 'Disponibilites synchronisees depuis Booking.com.',
    availabilityUnavailable: 'Les dates selectionnees ne sont pas disponibles.',
    availabilityError: 'Impossible de verifier les disponibilites pour le moment.',
    availabilityLocalDev:
      'La synchronisation des disponibilites n est pas active avec npm run dev. Utilisez vercel dev ou la production.',
    availabilityInvalidToken:
      'Le lien iCal Booking est invalide ou expire. Regenez-le dans l Extranet et mettez-le a jour.',
    availabilityFeedUnavailable:
      'Le flux Booking est temporairement indisponible. Reessayez plus tard.',
  },
} as const

type HomeTranslation = {
  location: string
  description: string
  highlights: string[]
}

const homeTextByLanguage: Record<
  Exclude<Language, 'it'>,
  Record<string, HomeTranslation>
> = {
  en: {
    'casa-thalassa-cefalu': {
      location: 'Cefalù, Sicily',
      description:
        'A home designed for guests who want to experience Cefalù through comfort, sea views, and walks in the historic center.',
      highlights: [
        'Strategic location for beach and old town',
        'Welcoming atmosphere for couples and families',
        'Perfect base to explore the Sicilian coastline',
      ],
    },
    'casa-al-vecchio-molo': {
      location: 'Cefalù, Sicily',
      description:
        'A character-filled home, ideal for a relaxing stay just a short walk from Cefalù’s main landmarks.',
      highlights: [
        'Charming and authentic setting',
        'Convenient for restaurants, harbor, and seafront',
        'Great for short or weekly stays',
      ],
    },
  },
  es: {
    'casa-thalassa-cefalu': {
      location: 'Cefalú, Sicilia',
      description:
        'Un alojamiento pensado para quienes quieren vivir Cefalú entre confort, vistas al mar y paseos por el casco histórico.',
      highlights: [
        'Ubicación estratégica para playa y casco antiguo',
        'Ambiente acogedor para parejas y familias',
        'Base perfecta para explorar la costa siciliana',
      ],
    },
    'casa-al-vecchio-molo': {
      location: 'Cefalú, Sicilia',
      description:
        'Un alojamiento con encanto, ideal para una estancia relajante a pocos pasos de los principales puntos de interés de Cefalú.',
      highlights: [
        'Entorno auténtico y con encanto',
        'Cómodo para restaurantes, puerto y paseo marítimo',
        'Ideal para estancias cortas o semanales',
      ],
    },
  },
  fr: {
    'casa-thalassa-cefalu': {
      location: 'Cefalù, Sicile',
      description:
        'Un logement pensé pour ceux qui veulent vivre Cefalù entre confort, vue mer et promenades dans le centre historique.',
      highlights: [
        'Emplacement stratégique pour la plage et la vieille ville',
        'Ambiance chaleureuse pour couples et familles',
        'Point de départ idéal pour explorer la côte sicilienne',
      ],
    },
    'casa-al-vecchio-molo': {
      location: 'Cefalù, Sicile',
      description:
        'Un logement de caractère, idéal pour un séjour relaxant à quelques pas des principaux sites de Cefalù.',
      highlights: [
        'Cadre authentique et plein de charme',
        'Pratique pour restaurants, port et front de mer',
        'Parfait pour des séjours courts ou hebdomadaires',
      ],
    },
  },
}

const whatsappContacts = ['+393204465901', '+393281474979', '+393281474838']

function App() {
  const [language, setLanguage] = useState<Language>('it')
  const [homes, setHomes] = useState<VacationHome[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxSlides, setLightboxSlides] = useState<
    Array<{ src: string; alt: string }>
  >([])
  const [bookingResult, setBookingResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [unavailableRanges, setUnavailableRanges] = useState<AvailabilityRange[]>([])
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState(false)
  const [isAvailabilityApiSupported, setIsAvailabilityApiSupported] = useState(true)
  const [isAvailabilityTokenInvalid, setIsAvailabilityTokenInvalid] = useState(false)
  const [isAvailabilityFeedUnavailable, setIsAvailabilityFeedUnavailable] =
    useState(false)
  const t = uiText[language]

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    setError: setFieldError,
    clearErrors,
    getValues,
    watch,
    trigger,
  } = useForm<BookingFormValues>({
    defaultValues: {
      propertyId: '',
      guests: 1,
      checkIn: '',
      checkOut: '',
      email: '',
      whatsapp: '',
    },
  })

  useEffect(() => {
    const loadHomes = async () => {
      try {
        const data = await getVacationHomes()
        setHomes(data)
      } catch {
        setError('load-error')
      } finally {
        setIsLoading(false)
      }
    }

    void loadHomes()
  }, [])

  useEffect(() => {
    if (homes.length > 0 && !getValues('propertyId')) {
      setValue('propertyId', homes[0].id)
    }
  }, [homes, getValues, setValue])

  const selectedPropertyId = watch('propertyId')
  const selectedCheckIn = watch('checkIn')
  const selectedCheckOut = watch('checkOut')

  const getTodayIsoDate = () => {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const todayIsoDate = getTodayIsoDate()

  const addDaysToIsoDate = (isoDate: string, days: number) => {
    const date = new Date(`${isoDate}T00:00:00.000Z`)
    date.setUTCDate(date.getUTCDate() + days)
    return date.toISOString().slice(0, 10)
  }

  const getNextBlockedStartAfter = (date: string) => {
    if (!date) {
      return undefined
    }

    return unavailableRanges.find((range) => range.startDate > date)?.startDate
  }

  const shouldDisableCheckInDate = (date: Dayjs) => {
    const isoDate = date.format('YYYY-MM-DD')
    return isoDate < todayIsoDate || isDateBlocked(isoDate)
  }

  const shouldDisableCheckOutDate = (date: Dayjs) => {
    const isoDate = date.format('YYYY-MM-DD')

    if (isoDate < todayIsoDate) {
      return true
    }

    if (!selectedCheckIn) {
      return false
    }

    if (isoDate <= selectedCheckIn) {
      return true
    }

    return hasDateOverlap(selectedCheckIn, isoDate)
  }

  const hasDateOverlap = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      return false
    }

    return unavailableRanges.some(
      (range) => checkIn < range.endDate && checkOut > range.startDate,
    )
  }

  const isDateBlocked = (date: string) => {
    if (!date) {
      return false
    }

    return unavailableRanges.some(
      (range) => date >= range.startDate && date < range.endDate,
    )
  }

  useEffect(() => {
    const loadAvailability = async () => {
      if (!selectedPropertyId) {
        setUnavailableRanges([])
        setAvailabilityError(false)
        setIsAvailabilityApiSupported(true)
        setIsAvailabilityTokenInvalid(false)
        setIsAvailabilityFeedUnavailable(false)
        setIsAvailabilityLoading(false)
        return
      }

      setIsAvailabilityLoading(true)
      setAvailabilityError(false)
      setIsAvailabilityTokenInvalid(false)
      setIsAvailabilityFeedUnavailable(false)

      try {
        const response = await fetch(
          `/api/get-property-availability?propertyId=${encodeURIComponent(selectedPropertyId)}`,
        )

        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
          setUnavailableRanges([])
          setAvailabilityError(false)
          setIsAvailabilityApiSupported(false)
          return
        }

        setIsAvailabilityApiSupported(true)

        if (!response.ok) {
          throw new Error('availability-error')
        }

        const data = (await response.json()) as {
          unavailableRanges?: AvailabilityRange[]
          source?: string
        }

        setUnavailableRanges(data.unavailableRanges ?? [])
        setIsAvailabilityTokenInvalid(data.source === 'invalid-token')
        setIsAvailabilityFeedUnavailable(data.source === 'unavailable')
      } catch {
        setUnavailableRanges([])
        setAvailabilityError(true)
        setIsAvailabilityApiSupported(true)
        setIsAvailabilityTokenInvalid(false)
        setIsAvailabilityFeedUnavailable(false)
      } finally {
        setIsAvailabilityLoading(false)
      }
    }

    void loadAvailability()
  }, [selectedPropertyId])

  useEffect(() => {
    if (!selectedCheckIn && !selectedCheckOut) {
      return
    }

    void trigger(['checkIn', 'checkOut'])
  }, [unavailableRanges, selectedCheckIn, selectedCheckOut, trigger])

  const onSubmitBooking = async (values: BookingFormValues) => {
    const selectedHome = homes.find((home) => home.id === values.propertyId)

    const response = await fetch('/api/send-booking-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        propertyId: values.propertyId,
        propertyName: selectedHome?.name ?? values.propertyId,
        guests: values.guests,
        checkIn: values.checkIn,
        checkOut: values.checkOut,
        email: values.email,
        whatsapp: values.whatsapp || null,
      }),
    })

    if (!response.ok) {
      throw new Error('send-error')
    }

    setBookingResult({ type: 'success', message: t.bookingSuccess })
    reset({
      propertyId: selectedHome?.id ?? homes[0]?.id ?? '',
      guests: 1,
      checkIn: '',
      checkOut: '',
      email: '',
      whatsapp: '',
    })
  }

  const handleBookingSubmit = handleSubmit(async (values) => {
    setBookingResult(null)
    try {
      await onSubmitBooking(values)
    } catch {
      setBookingResult({ type: 'error', message: t.bookingError })
    }
  })

  const openGallery = (home: VacationHome, index = 0) => {
    if (!home.galleryImages || home.galleryImages.length === 0) {
      return
    }

    setLightboxSlides(
      home.galleryImages.map((image, imageIndex) => ({
        src: image,
        alt: `${home.name} - ${t.photo.toLowerCase()} ${imageIndex + 1}`,
      })),
    )
    setLightboxIndex(index)
    setIsLightboxOpen(true)
  }

  const getMapQuery = (home: VacationHome) =>
    home.mapQuery || home.address || `${home.name} ${home.location}`

  const getMapsSearchUrl = (query: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

  const getMapsEmbedUrl = (query: string) =>
    `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`

  const getMapsDirectionsUrl = (query: string) =>
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=driving`

  const getLocalizedHome = (home: VacationHome) => {
    if (language === 'it') {
      return {
        location: home.location,
        description: home.description,
        highlights: home.highlights,
      }
    }

    const translation = homeTextByLanguage[language]?.[home.id]
    return {
      location: translation?.location ?? home.location,
      description: translation?.description ?? home.description,
      highlights: translation?.highlights ?? home.highlights,
    }
  }

  const getWhatsappPrefilledMessage = () => {
    if (language === 'en') {
      return 'Hello, I would like booking information about your homes in Cefalu.'
    }

    if (language === 'es') {
      return 'Hola, me gustaria recibir informacion para reservar sus alojamientos en Cefalu.'
    }

    if (language === 'fr') {
      return 'Bonjour, je souhaite recevoir des informations pour reserver vos logements a Cefalu.'
    }

    return 'Ciao, vorrei ricevere informazioni per prenotare le vostre case vacanze a Cefalu.'
  }

  const getWhatsappUrl = (phone: string) => {
    const normalizedPhone = phone.replace(/[^0-9]/g, '')
    const text = encodeURIComponent(getWhatsappPrefilledMessage())
    return `https://wa.me/${normalizedPhone}?text=${text}`
  }

  const contactAllWhatsappNumbers = () => {
    const openedTabs = whatsappContacts.map(() => window.open('', '_blank'))

    whatsappContacts.forEach((phone, index) => {
      const tab = openedTabs[index]
      const url = getWhatsappUrl(phone)

      if (tab) {
        tab.location.href = url
        return
      }

      window.open(url, '_blank', 'noopener,noreferrer')
    })
  }

  return (
    <div className="site-wrapper">
      <header className="hero">
        <div className="lang-switch" role="group" aria-label={t.languageSelector}>
          <button
            type="button"
            className={`lang-btn ${language === 'it' ? 'active' : ''}`}
            onClick={() => setLanguage('it')}
          >
            🇮🇹 IT
          </button>
          <button
            type="button"
            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
          >
            🇬🇧 EN
          </button>
          <button
            type="button"
            className={`lang-btn ${language === 'es' ? 'active' : ''}`}
            onClick={() => setLanguage('es')}
          >
            🇪🇸 ES
          </button>
          <button
            type="button"
            className={`lang-btn ${language === 'fr' ? 'active' : ''}`}
            onClick={() => setLanguage('fr')}
          >
            🇫🇷 FR
          </button>
        </div>
        <p className="eyebrow">{t.heroEyebrow}</p>
        <h1>{t.heroTitle}</h1>
        <p className="hero-text">{t.heroText}</p>
        <a className="primary-btn" href="#abitazioni">
          {t.heroCta}
        </a>
      </header>

      <main className="content" id="abitazioni">
        {isLoading && <p className="info">{t.loading}</p>}
        {error && <p className="info error">{t.loadError}</p>}

        {!isLoading && !error && (
          <>
            <section className="home-grid">
              {homes.map((home) => {
                const mapQuery = getMapQuery(home)
                const localizedHome = getLocalizedHome(home)

                return (
                  <article key={home.id} className="home-card">
                    <button
                      type="button"
                      className="cover-button"
                      onClick={() => openGallery(home)}
                    >
                      <img
                        className="home-image"
                        src={home.coverImage}
                        alt={`Vista della struttura ${home.name}`}
                      />
                    </button>
                    <div className="home-body">
                      <h2>{home.name}</h2>
                      <p className="location">{localizedHome.location}</p>
                      <p className="description-text">{localizedHome.description}</p>
                      <ul>
                        {localizedHome.highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>

                      <div className="map-section">
                        <p className="map-label">{t.mapLabel}</p>
                        <p className="map-address">{home.address}</p>
                        <iframe
                          className="map-embed"
                          src={getMapsEmbedUrl(mapQuery)}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title={`Mappa di ${home.name}`}
                        />
                      </div>

                      <div className="actions">
                        {home.galleryImages && home.galleryImages.length > 0 && (
                          <button
                            type="button"
                            className="gallery-btn"
                            onClick={() => openGallery(home)}
                          >
                            {t.openGallery} ({home.galleryImages.length} {t.photos})
                          </button>
                        )}
                        <a
                          className="action-link action-booking"
                          href={home.bookingUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t.booking}
                        </a>
                        <a
                          className="action-link action-maps"
                          href={getMapsSearchUrl(mapQuery)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t.openMaps}
                        </a>
                        <a
                          className="action-link action-directions"
                          href={getMapsDirectionsUrl(mapQuery)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t.directions}
                        </a>
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>

            <section className="booking-form-section">
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid #c7d2fe',
                  boxShadow: '0 16px 30px rgba(30, 64, 175, 0.12)',
                }}
              >
                <Box
                  sx={{
                    background: 'linear-gradient(90deg, #003b95 0%, #0057d9 100%)',
                    color: '#fff',
                    px: { xs: 2, md: 3 },
                    py: { xs: 1.5, md: 2 },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 900,
                      color: '#ffffff',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.35)',
                    }}
                  >
                    {t.bookingFormTitle}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white !important' }}>
                    {t.bookingFormSubtitle}
                  </Typography>
                </Box>

                <Box sx={{ p: { xs: 1.25, md: 1.5 }, backgroundColor: '#fff' }}>
                  {selectedPropertyId && isAvailabilityLoading && (
                    <Alert severity="info" sx={{ mb: 1 }}>
                      {t.availabilityLoading}
                    </Alert>
                  )}
                  {selectedPropertyId &&
                    !isAvailabilityLoading &&
                    !isAvailabilityApiSupported && (
                      <Alert severity="info" sx={{ mb: 1 }}>
                        {t.availabilityLocalDev}
                      </Alert>
                    )}
                  {selectedPropertyId &&
                    !isAvailabilityLoading &&
                    isAvailabilityTokenInvalid && (
                      <Alert severity="error" sx={{ mb: 1 }}>
                        {t.availabilityInvalidToken}
                      </Alert>
                    )}
                  {selectedPropertyId &&
                    !isAvailabilityLoading &&
                    isAvailabilityFeedUnavailable && (
                      <Alert severity="warning" sx={{ mb: 1 }}>
                        {t.availabilityFeedUnavailable}
                      </Alert>
                    )}
                  {selectedPropertyId &&
                    !isAvailabilityLoading &&
                    !availabilityError &&
                    isAvailabilityApiSupported &&
                    !isAvailabilityTokenInvalid &&
                    !isAvailabilityFeedUnavailable && (
                      <Alert severity="success" sx={{ mb: 1 }}>
                        {t.availabilitySynced}
                      </Alert>
                    )}
                  {selectedPropertyId &&
                    availabilityError &&
                    isAvailabilityApiSupported && (
                      <Alert severity="error" sx={{ mb: 1 }}>
                        {t.availabilityError}
                      </Alert>
                    )}

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box
                      component="form"
                      onSubmit={handleBookingSubmit}
                      sx={{
                        display: 'grid',
                        gap: 1,
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1}
                        sx={{
                          '& .MuiFormControl-root': {
                            flex: 1,
                          },
                        }}
                      >
                        <TextField
                          select
                          label={t.propertyLabel}
                          size="small"
                          error={Boolean(errors.propertyId)}
                          helperText={errors.propertyId?.message}
                          {...register('propertyId', {
                            required: t.validationRequired,
                          })}
                        >
                          {homes.length === 0 && (
                            <MenuItem value="">{t.propertyPlaceholder}</MenuItem>
                          )}
                          {homes.map((home) => (
                            <MenuItem key={home.id} value={home.id}>
                              {home.name}
                            </MenuItem>
                          ))}
                        </TextField>

                        <TextField
                          label={t.guestsLabel}
                          type="number"
                          size="small"
                          error={Boolean(errors.guests)}
                          helperText={errors.guests?.message}
                          inputProps={{ min: 1, max: 4 }}
                          {...register('guests', {
                            required: t.validationRequired,
                            valueAsNumber: true,
                            min: { value: 1, message: t.validationGuestsMin },
                            max: { value: 4, message: t.validationGuestsMax },
                          })}
                        />

                        <Controller
                          name="checkIn"
                          control={control}
                          rules={{
                            required: t.validationRequired,
                            validate: (value) =>
                              !value ||
                              !isDateBlocked(value) ||
                              t.availabilityUnavailable,
                          }}
                          render={({ field, fieldState }) => (
                            <DatePicker
                              label={t.checkInLabel}
                              value={field.value ? dayjs(field.value) : null}
                              onChange={(newValue) => {
                                if (!newValue) {
                                  field.onChange('')
                                  clearErrors('checkIn')
                                  return
                                }

                                const nextCheckIn = newValue.format('YYYY-MM-DD')

                                if (shouldDisableCheckInDate(newValue)) {
                                  field.onChange('')
                                  setFieldError('checkIn', {
                                    type: 'manual',
                                    message: t.availabilityUnavailable,
                                  })
                                  return
                                }

                                field.onChange(nextCheckIn)
                                clearErrors('checkIn')

                                if (!selectedCheckOut) {
                                  return
                                }

                                if (selectedCheckOut <= nextCheckIn) {
                                  setValue('checkOut', '', {
                                    shouldValidate: true,
                                    shouldTouch: true,
                                  })
                                  setFieldError('checkOut', {
                                    type: 'manual',
                                    message: t.validationDateOrder,
                                  })
                                  return
                                }

                                if (hasDateOverlap(nextCheckIn, selectedCheckOut)) {
                                  setValue('checkOut', '', {
                                    shouldValidate: true,
                                    shouldTouch: true,
                                  })
                                  setFieldError('checkOut', {
                                    type: 'manual',
                                    message: t.availabilityUnavailable,
                                  })
                                  return
                                }

                                clearErrors('checkOut')
                              }}
                              shouldDisableDate={shouldDisableCheckInDate}
                              minDate={dayjs(todayIsoDate)}
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  error: Boolean(fieldState.error),
                                  helperText: fieldState.error?.message,
                                },
                                day: {
                                  sx: {
                                    '&.Mui-disabled': {
                                      color: '#94a3b8',
                                      backgroundColor: '#f1f5f9',
                                    },
                                  },
                                },
                              }}
                            />
                          )}
                        />

                        <Controller
                          name="checkOut"
                          control={control}
                          rules={{
                            required: t.validationRequired,
                            validate: (value, formValues) => {
                              if (value <= formValues.checkIn) {
                                return t.validationDateOrder
                              }

                              if (hasDateOverlap(formValues.checkIn, value)) {
                                return t.availabilityUnavailable
                              }

                              return true
                            },
                          }}
                          render={({ field, fieldState }) =>
                            (() => {
                              const nextBlockedStart = selectedCheckIn
                                ? getNextBlockedStartAfter(selectedCheckIn)
                                : undefined

                              return (
                                <DatePicker
                                  label={t.checkOutLabel}
                                  value={field.value ? dayjs(field.value) : null}
                                  onChange={(newValue) => {
                                    const nextCheckOut = newValue
                                      ? newValue.format('YYYY-MM-DD')
                                      : ''

                                    if (!nextCheckOut) {
                                      field.onChange('')
                                      clearErrors('checkOut')
                                      return
                                    }

                                    if (nextCheckOut <= selectedCheckIn) {
                                      field.onChange('')
                                      setFieldError('checkOut', {
                                        type: 'manual',
                                        message: t.validationDateOrder,
                                      })
                                      return
                                    }

                                    if (hasDateOverlap(selectedCheckIn, nextCheckOut)) {
                                      field.onChange('')
                                      setFieldError('checkOut', {
                                        type: 'manual',
                                        message: t.availabilityUnavailable,
                                      })
                                      return
                                    }

                                    field.onChange(nextCheckOut)
                                    clearErrors('checkOut')
                                  }}
                                  shouldDisableDate={shouldDisableCheckOutDate}
                                  minDate={
                                    selectedCheckIn
                                      ? dayjs(addDaysToIsoDate(selectedCheckIn, 1))
                                      : dayjs(todayIsoDate)
                                  }
                                  maxDate={
                                    nextBlockedStart ? dayjs(nextBlockedStart) : undefined
                                  }
                                  disabled={!selectedCheckIn}
                                  slotProps={{
                                    textField: {
                                      size: 'small',
                                      error: Boolean(fieldState.error),
                                      helperText: fieldState.error?.message,
                                    },
                                    day: {
                                      sx: {
                                        '&.Mui-disabled': {
                                          color: '#94a3b8',
                                          backgroundColor: '#f1f5f9',
                                        },
                                      },
                                    },
                                  }}
                                />
                              )
                            })()
                          }
                        />
                      </Stack>

                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                        <TextField
                          label={t.emailLabel}
                          type="email"
                          size="small"
                          fullWidth
                          error={Boolean(errors.email)}
                          helperText={errors.email?.message}
                          {...register('email', {
                            required: t.validationRequired,
                            pattern: {
                              value: /^\S+@\S+\.\S+$/,
                              message: t.validationEmail,
                            },
                          })}
                        />

                        <TextField
                          label={t.whatsappLabel}
                          type="tel"
                          size="small"
                          fullWidth
                          placeholder="+39 333 1234567"
                          error={Boolean(errors.whatsapp)}
                          helperText={errors.whatsapp?.message}
                          {...register('whatsapp', {
                            validate: (value) => {
                              if (!value) {
                                return true
                              }
                              return /^[+]?[- 0-9()]{6,20}$/.test(value)
                                ? true
                                : t.validationWhatsapp
                            },
                          })}
                        />

                        <Button
                          type="submit"
                          variant="contained"
                          disableElevation
                          disabled={isSubmitting}
                          sx={{
                            minWidth: { xs: '100%', md: 220 },
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            borderRadius: 1.5,
                            backgroundColor: '#febb02',
                            color: '#1a1a1a',
                            '&:hover': {
                              backgroundColor: '#f5ad00',
                            },
                          }}
                        >
                          {isSubmitting ? t.sendingLabel : t.submitLabel}
                        </Button>
                      </Stack>

                      {bookingResult && (
                        <Alert
                          severity={
                            bookingResult.type === 'success' ? 'success' : 'error'
                          }
                        >
                          {bookingResult.message}
                        </Alert>
                      )}
                    </Box>
                  </LocalizationProvider>
                </Box>
              </Paper>
            </section>
          </>
        )}
      </main>

      <button
        type="button"
        className="whatsapp-float-button"
        onClick={contactAllWhatsappNumbers}
        aria-label="Contattami su WhatsApp"
        title="Contattami su WhatsApp"
      >
        <WhatsAppIcon fontSize="medium" />
      </button>

      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
        on={{ view: ({ index }) => setLightboxIndex(index) }}
        plugins={[Thumbnails]}
        controller={{ closeOnBackdropClick: true }}
        thumbnails={{ border: 0, borderRadius: 8, gap: 8 }}
      />
    </div>
  )
}

export default App
