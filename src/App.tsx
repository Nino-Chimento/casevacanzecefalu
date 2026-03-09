import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
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
  const t = uiText[language]

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    getValues,
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
              <h3>{t.bookingFormTitle}</h3>
              <p>{t.bookingFormSubtitle}</p>

              <form className="booking-form" onSubmit={handleBookingSubmit}>
                <label className="form-field">
                  <span>{t.propertyLabel}</span>
                  <select
                    {...register('propertyId', {
                      required: t.validationRequired,
                    })}
                  >
                    {homes.length === 0 && (
                      <option value="">{t.propertyPlaceholder}</option>
                    )}
                    {homes.map((home) => (
                      <option key={home.id} value={home.id}>
                        {home.name}
                      </option>
                    ))}
                  </select>
                  {errors.propertyId && (
                    <small className="field-error">{errors.propertyId.message}</small>
                  )}
                </label>

                <label className="form-field">
                  <span>{t.guestsLabel}</span>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    {...register('guests', {
                      required: t.validationRequired,
                      valueAsNumber: true,
                      min: { value: 1, message: t.validationGuestsMin },
                      max: { value: 4, message: t.validationGuestsMax },
                    })}
                  />
                  {errors.guests && (
                    <small className="field-error">{errors.guests.message}</small>
                  )}
                </label>

                <label className="form-field">
                  <span>{t.checkInLabel}</span>
                  <input
                    type="date"
                    {...register('checkIn', {
                      required: t.validationRequired,
                    })}
                  />
                  {errors.checkIn && (
                    <small className="field-error">{errors.checkIn.message}</small>
                  )}
                </label>

                <label className="form-field">
                  <span>{t.checkOutLabel}</span>
                  <input
                    type="date"
                    {...register('checkOut', {
                      required: t.validationRequired,
                      validate: (value, formValues) =>
                        value > formValues.checkIn || t.validationDateOrder,
                    })}
                  />
                  {errors.checkOut && (
                    <small className="field-error">{errors.checkOut.message}</small>
                  )}
                </label>

                <label className="form-field">
                  <span>{t.emailLabel}</span>
                  <input
                    type="email"
                    {...register('email', {
                      required: t.validationRequired,
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: t.validationEmail,
                      },
                    })}
                  />
                  {errors.email && (
                    <small className="field-error">{errors.email.message}</small>
                  )}
                </label>

                <label className="form-field">
                  <span>{t.whatsappLabel}</span>
                  <input
                    type="tel"
                    placeholder="+39 333 1234567"
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
                  {errors.whatsapp && (
                    <small className="field-error">{errors.whatsapp.message}</small>
                  )}
                </label>

                <button className="submit-btn" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t.sendingLabel : t.submitLabel}
                </button>

                {bookingResult && (
                  <p
                    className={`submit-message ${bookingResult.type === 'success' ? 'success' : 'error'
                      }`}
                  >
                    {bookingResult.message}
                  </p>
                )}
              </form>
            </section>
          </>
        )}
      </main>

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
