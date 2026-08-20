# Hardcoded Copywriting Audit

All Spanish text currently baked into the code that should be configurable per client.

---

## 1. SEO Metadata (Page Titles & Descriptions)

| File | Text |
|------|------|
| `src/app/page.tsx` | Title fallback: "Casas y pisos, alquiler y venta" |
| `src/app/page.tsx` | Description fallback: "¿Buscas casa? Pisos y casas en venta o alquiler." |
| `src/app/contacto/page.tsx` | Title: "Contacto" |
| `src/app/contacto/page.tsx` | Description: "Póngase en contacto con nuestro equipo de expertos inmobiliarios. Le ayudamos con la compra, venta y alquiler de propiedades." |
| `src/app/vender/page.tsx` | Title: "Vender tu Propiedad" |
| `src/app/vender/page.tsx` | Description: "Publica tu inmueble y llega a miles de compradores potenciales." |
| `src/app/faqs/page.tsx` | Title: "Preguntas Frecuentes (FAQs)" |
| `src/app/faqs/page.tsx` | Description: "Encuentra respuestas a las preguntas más comunes..." |
| `src/app/aviso-legal/page.tsx` | Title: "Aviso Legal" |
| `src/app/aviso-legal/page.tsx` | Description: "Información legal. Términos de uso, propiedad intelectual..." |
| `src/app/proteccion-de-datos/page.tsx` | Title: "Política de Protección de Datos" |
| `src/app/proteccion-de-datos/page.tsx` | Description: "Política de privacidad y protección de datos personales..." |
| `src/app/cookies/page.tsx` | Title: "Política de Cookies" |
| `src/app/cookies/page.tsx` | Description: "Información sobre el uso de cookies en nuestro sitio web..." |
| `src/app/terminos-condiciones-venta/page.tsx` | Title: "Términos y Condiciones de Venta" |
| `src/app/terminos-condiciones-venta/page.tsx` | Description: "Términos y condiciones para la venta de inmuebles" |

---

## 2. Hero Section (`src/components/hero.tsx`)

- Title fallback: "Encuentra Tu Propiedad Soñada"
- Subtitle fallback: "Descubre propiedades excepcionales en ubicaciones privilegiadas. Permítenos guiarte en tu viaje inmobiliario."
- Button 1 fallback: "Explorar Propiedades"
- Button 2 fallback: "Contáctanos"

---

## 3. About Section (`src/components/about-section.tsx`)

- Title fallback: "Sobre Nosotros"
- Subtitle fallback: "Tu socio de confianza en el viaje inmobiliario"
- Content paragraph 1: "Creemos que encontrar la propiedad perfecta debe ser una experiencia emocionante y gratificante..."
- Content paragraph 2: "Ya sea que estés comprando tu primera casa, vendiendo una propiedad o buscando oportunidades de inversión..."
- Services section title: "Nuestros Servicios"
- Mission section title: "Nuestra Misión"
- Service items: "Conocimiento local experto", "Servicio personalizado", "Comunicación transparente", "Experiencia en negociación", "Marketing integral", "Soporte continuo"
- Button text: "Contacta a Nuestro Equipo"

---

## 4. Contact Section & Forms

### `src/components/contact-section.tsx`
- Title fallback: "Contáctanos"
- Subtitle fallback: "¿Tienes preguntas o estás listo para dar el siguiente paso? Nuestro equipo está aquí para ayudarte con todas tus necesidades inmobiliarias."

### `src/components/contact/ContactContent.tsx`
- Card title: "Información de Contacto"
- Card description: "Comunícate con nosotros directamente o visita nuestra oficina."
- Labels: "Dirección de la Oficina", "Teléfono", "Correo Electrónico", "Horario de Atención"
- Dropdown: "Selecciona una oficina"
- Sub-labels: "Principal: ", "Ventas: "

### `src/components/contact/ContactForm.tsx`
- Card title: "Envíanos un Mensaje"
- Card description: "Completa el formulario a continuación y nos pondremos en contacto contigo lo antes posible."
- Success title: "Mensaje Enviado"
- Success message: "Gracias por contactarnos. Hemos recibido tu mensaje correctamente y nuestro equipo se pondrá en contacto contigo a la brevedad."
- Response time: "Tiempo de respuesta estimado: menos de 24 horas"
- Form labels: "Nombre Completo", "Correo Electrónico", "Número de Teléfono", "Mensaje"
- Placeholders: "Juan Pérez", "juan@ejemplo.com", "+34 987 123 456", "¿En qué podemos ayudarte?"
- Button: "Enviar Mensaje" / "Enviando..."
- Error: "Error al enviar el mensaje", "Error al enviar el mensaje. Por favor, inténtalo de nuevo."

---

## 5. Footer (`src/components/footer.tsx`)

- Company description fallback: "Tu socio de confianza para encontrar la propiedad perfecta."
- Fallback name: "Inmobiliaria"
- Section headers: "Tipos de Propiedades", "Nuestras Oficinas"
- Quick links: "Inicio", "Propiedades", "Nosotros", "Contacto", "Comprar", "Alquilar", "Vender"
- Legal links: "Aviso Legal", "Preguntas frecuentes (FAQs)", "Contacta con nosotros", "Protección de datos", "Política de cookies"
- Property types: "Pisos", "Casas", "Locales", "Solares", "Garajes"
- Copyright: "Todos los derechos reservados."

---

## 6. Navbar (`src/components/navbar.tsx`)

- Menu items: "Comprar", "Alquilar", "Vender", "Oportunidad", "Nosotros", "Contacto"
- Property type labels in dropdowns: "Pisos", "Casas", "Locales", "Solares", "Garajes"
- Search placeholder: "Busca por referencia" / "Buscar por referencia..."
- Mobile menu section headers: "Comprar", "Alquilar", "Más"
- Aria labels: "Comprar opciones", "Alquilar opciones", "Abrir menú", "Cerrar menú"
- Social: "Síguenos en redes sociales"

---

## 7. Search & Filters

### `src/components/search-bar.tsx`
- Form labels: "Operación", "Tipo inmueble", "Ubicación", "Habitaciones", "Baños", "Superficie", "Precio de venta" / "Precio de alquiler"
- Dropdown defaults: "Comprar", "Alquilar", "Cualquier tipo", "Cualquiera"
- Placeholders: "Seleccionar operación", "Seleccionar tipo", "Selecciona provincia...", "Selecciona ubicación...", "Desde", "Hasta"
- Button: "Buscar"

### `src/components/property-search.tsx`
- Form labels: "Operación", "Tipo de Propiedad", "Habitaciones", "Baños", "Ubicación", "Precio"
- Placeholders: "Operación", "Seleccionar tipo", "Habitaciones", "Baños"
- Defaults: "Venta", "Alquiler", "Cualquiera"
- Button: "Buscar"

### `src/components/ui/two-level-location-select.tsx`
- "Buscar...", "Cargando...", "Sin resultados"
- "Toda la provincia", "Todas las provincias"
- "Selecciona provincia...", "Selecciona ubicación..."
- "Primero selecciona provincia", "Buscar provincia...", "Buscar ciudad o barrio..."

### Sort Dropdown (`src/components/sort-dropdown.tsx`)
- "Ordenar"
- "Destacados primero", "Más recientes"
- "Precio: menor a mayor", "Precio: mayor a menor"
- "Tamaño: menor a mayor", "Tamaño: mayor a menor"

---

## 8. Property Listings Page (`src/app/[...slug]/page.tsx`)

### Page titles & descriptions (dynamic by type/operation)
- "Propiedades" / "Explora nuestras propiedades disponibles."
- "Propiedades en Alquiler" / "Encuentra propiedades en alquiler en las mejores ubicaciones."
- "Propiedades en Venta" / "Descubre propiedades en venta que se adaptan a tus necesidades."
- Per-type: "Pisos en Alquiler", "Pisos en Venta", "Casas en Alquiler", "Casas en Venta", "Locales en Alquiler", "Locales en Venta", "Solares en Venta", "Garajes en Alquiler", "Garajes en Venta", "Edificios en Alquiler/Venta", "Oficinas en Alquiler/Venta", "Naves Industriales en Alquiler/Venta", "Trasteros en Alquiler/Venta"
- Opportunity suffix: " - Oportunidad"
- "Descubre nuestras mejores oportunidades inmobiliarias."

### UI labels
- Breadcrumb: "Inicio"
- "Volver"
- "propiedades encontradas"
- Pagination: "Página X de Y"

---

## 9. Property Detail Page (`src/app/propiedades/[id]/page.tsx`)

### Error states
- "Propiedad no encontrada"
- "La propiedad que estás buscando no existe o ha sido eliminada."

### Labels
- "Ref: "
- "Precio a consultar"
- "/mes"
- Status badges: "En Venta", "En Alquiler", "Piso de Banco"

### Section headings
- "Descripción"
- "Certificación Energética"
- "Eficiencia de Consumo", "Eficiencia de Emisiones"
- "Consumo: X kWh/m² año", "Emisiones: X kg CO₂/m² año"
- "En trámite"
- "Ubicación"
- "Propiedades Similares"

### Breadcrumbs
- "Inicio", "Propiedades"

### Feature labels
- "Ascensor", "Garaje", "Trastero", "Calefacción", "Aire acondicionado", "Terraza", "Jardín", "Piscina", "Luminoso", "Exterior"

---

## 10. Property Detail Client (`src/app/propiedades/[id]/property-page-client.tsx`)

### Contact/inquiry form
- Default message: "Hola, estoy interesado en esta propiedad. Me gustaría recibir más información."
- Error: "Error: No se pudo identificar la propiedad. Por favor, recarga la página."
- Fallback title: "Propiedad sin título"
- Button: "Contactar"
- "Cerrar formulario"
- Heading: "¿Interesado en esta propiedad?"
- Success: "Consulta Enviada" / "Gracias por tu interés. Hemos recibido tu consulta y nos pondremos en contacto contigo pronto."
- Form labels: "Nombre", "Email", "Teléfono", "Mensaje"
- Placeholders: "Tu nombre", "tu@email.com", "Tu teléfono", "Me interesa esta propiedad..."
- Button: "Enviar Consulta" / "Enviando..."
- Agent label: "Agente Inmobiliario", "Agente"
- Error: "Error al enviar la consulta", "Error al enviar la consulta. Por favor, inténtalo de nuevo."

---

## 11. Property Cards (`src/components/listing-card.tsx` & `src/components/property-card.tsx`)

### Property type labels (repeated in both files)
- "Piso", "Casa", "Local", "Solar", "Garaje", "Edificio", "Oficina", "Nave Industrial", "Trastero"

### Status badges
- "Vendido", "Alquilado", "En Venta", "En Alquiler"
- "Piso de Banco", "Oportunidad"

### Unit labels
- "/mes"
- "Est" / "Ests" (estancias), "Hab" / "Habs" (habitaciones)
- "Baño" / "Baños"
- "m²"

### Other
- "Ver Detalles" (property-card.tsx)
- Alt text: "Vista alternativa"

---

## 12. Property Characteristics (`src/components/property/property-characteristics.tsx`)

This is the largest single file with hardcoded copy. All labels for property details:

### Main section
- "Características", "Referencia", "Tipo de inmueble", "Superficie construida", "Año construcción", "Estado conservación"
- Conservation states: "Bueno", "Muy bueno", "Como nuevo", "A reformar", "Reformado"

### Basic features
- "Ascensor", "Garaje", "Trastero", "Calefacción", "Aire Acondicionado", "Terraza", "Jardín", "Piscina", "Luminoso", "Exterior"

### Security section
- "Seguridad", "Alarma", "Puerta Blindada", "Videoportero", "Conserjería", "Vigilancia"

### Toggles
- "Mostrar menos", "Ver más características"

### Building section
- "Características del Edificio", "Plantas del edificio", "Orientación", "Tipo de suelo", "Tipo de ventanas", "Tipo de persianas", "Carpintería"
- "Doble Cristal", "Armarios Empotr.", "Accesible", "Antena Parabólica"

### Kitchen section
- "Cocina", "Tipo de cocina", "Cocina Abierta", "Cocina Amueblada", "Despensa"

### Climate section
- "Climatización", "Tipo de calefacción", "Agua caliente", "Aire acondicionado"

### Garage section
- "Garaje", "Tipo de garaje", "Plazas", "Número", "En Edificio", "Ascensor a Garaje"

### Additional spaces
- "Espacios Adicionales", "Tamaño terraza", "Tamaño salón", "Tamaño trastero", "Tamaño bodega", "Balcones", "Galerías", "Bodega", "Lavadero", "Tendedero Cubierto", "Chimenea"

### Luxury & recreation
- "Lujo y Recreación", "Jacuzzi", "Hidromasaje", "Gimnasio", "Zona Deportiva", "Piscina Comunitaria", "Piscina Privada", "Pista de Tenis", "Zona Infantil", "Sistema Musical", "Domótica", "Baño en Suite"

### Views & location
- "Vistas y Ubicación", "Buenas Vistas", "Vista Montaña", "Vista al Mar", "Primera Línea", "Transporte Público"

### Appliances
- "Electrodomésticos", "Internet", "Horno", "Microondas", "Lavadora", "Nevera", "Televisión", "Vajilla"

### Construction status
- "Estado de Construcción", "A Estrenar", "Obra Nueva", "En Construcción", "Necesita Reforma", "Reformado en {year}"

### Rental conditions
- "Condiciones de Alquiler", "Amueblado", "Calidad mobiliario", "Admite estudiantes", "Admite mascotas", "Electrodomésticos incluidos", "Garaje opcional", "Trastero opcional"
- "€/mes", "Sí"

---

## 13. Property Listing Form (`src/components/property/`)

### Main form (`property-listing-form.tsx`)
- Success title: "¡Solicitud enviada con éxito!"
- Success message: "Hemos recibido tu solicitud de publicación. Nuestro equipo revisará la información y se pondrá en contacto contigo para aprobar y publicar tu inmueble."
- "Volver al inicio"
- Buttons: "Anterior", "Siguiente", "Solicitar Publicación", "Enviando..."
- Error: "Ha ocurrido un error al enviar el formulario. Por favor, inténtelo de nuevo."
- Validation messages: "El nombre es obligatorio", "El email es obligatorio", "El email no es válido", "El teléfono es obligatorio", "La dirección es obligatoria", "El código postal es obligatorio", "La localidad es obligatoria", "La superficie es obligatoria", "Debe indicar al menos un precio de venta o alquiler", "Debe aceptar los términos y condiciones"

### Contact Step (`form-steps/contact-step.tsx`)
- Title: "Datos de Contacto"
- Description: "Introduce tus datos de contacto para que los interesados puedan comunicarse contigo."
- Labels: "Nombre", "Apellidos", "Email", "Teléfono"
- Placeholders: "Tu nombre", "Tus apellidos", "tu@email.com", "Tu número de teléfono"

### Location Step (`form-steps/location-step.tsx`)
- Title: "Datos de Localización"
- Description: "Introduce la dirección completa de tu inmueble."
- Labels: "Dirección", "Número", "Planta", "Puerta", "Código Postal", "Localidad", "Provincia"
- Placeholders: "Calle, avenida, etc.", "Nº", "Planta", "Puerta", "Código postal", "Localidad", "Selecciona una provincia"
- Full list of 50 Spanish provinces

### Property Step (`form-steps/property-step.tsx`)
- Title: "Datos Generales"
- Description: "Introduce las características de tu inmueble."
- Property types: "Piso", "Casa", "Local", "Solar", "Garaje"
- Features: "Piscina", "Jardín", "Garaje", "Balcón", "Terraza", "Aire acondicionado", "Calefacción", "Seguridad 24h", "Amueblado", "Ascensor", "Vistas al mar", "Vistas a la montaña"
- Labels: "Tipo de Propiedad", "Selecciona un tipo", "Superficie (m²)", "Superficie en m²", "Habitaciones", "Número de habitaciones", "Baños", "Número de baños", "Características"

### Economic Step (`form-steps/economic-step.tsx`)
- Title: "Datos Económicos"
- Description: "Selecciona si deseas vender o alquilar tu inmueble y proporciona los datos económicos."
- Toggles: "Venta", "Alquiler"
- Labels: "Precio de Venta (€)", "Precio de venta", "Precio de Alquiler (€/mes)", "Precio de alquiler mensual", "Gastos de Comunidad (€/mes)", "Gastos de comunidad", "IBI (€/año)", "Impuesto sobre Bienes Inmuebles"

### Images Step (`form-steps/images-step.tsx`)
- Title: "Imágenes"
- Description: "Sube imágenes de tu inmueble. Las imágenes de calidad aumentan el interés en tu propiedad."
- "Arrastra y suelta imágenes aquí o haz clic para seleccionar"
- Button: "Seleccionar Imágenes"
- "Imágenes Seleccionadas (X)"
- Alt: "Imagen X"

### Review Step (`form-steps/review-step.tsx`)
- Title: "Revisión"
- Description: "Revisa los datos de tu inmueble antes de publicarlo. Puedes volver atrás para editar cualquier información."
- Section headers: "Datos de Contacto", "Ubicación", "Datos de la Propiedad", "Datos Económicos", "Imágenes"
- All field labels: "Nombre:", "Email:", "Teléfono:", "Dirección:", "Nº", "Planta", "Puerta", "Código Postal:", "Localidad:", "Provincia:", "Tipo:", "Superficie:", "Habitaciones:", "Baños:", "Descripción:", "Características:", "Precio de Venta:", "Precio de Alquiler:", "Gastos de Comunidad:", "IBI:"
- "No has subido ninguna imagen."
- Terms: "Acepto los términos y condiciones", "Al publicar este inmueble, acepto los términos y condiciones y la política de privacidad."

---

## 14. FAQs Page (`src/app/faqs/page.tsx`)

The entire FAQ content is hardcoded — 6 categories with 5 questions each (30 Q&A pairs total):

**Categories:**
1. Comprar una Propiedad
2. Vender una Propiedad
3. Alquilar una Propiedad
4. Servicios Inmobiliarios
5. Legal y Administrativo
6. Proceso y Tecnología

**Page layout text:**
- Heading: "Preguntas Frecuentes"
- Description: "Encuentra respuestas a las preguntas más comunes sobre servicios inmobiliarios, procesos de compra, venta y alquiler de propiedades."
- CTA heading: "¿No encuentra la respuesta que busca?"
- CTA description: "Nuestro equipo de expertos está aquí para ayudarle con cualquier consulta específica."
- CTA link: "Contactar ahora"

---

## 15. Legal Pages (Full Document Content)

### `src/app/aviso-legal/page.tsx`
- Error: "Error al cargar los datos legales."
- Breadcrumbs: "Inicio"
- Page heading: "Aviso Legal"
- Subheading: "Información legal y términos de uso del sitio web de [company]"
- Section: "Datos Identificativos" — full intro paragraph citing Ley 34/2002
- Labels: "Denominación social" / "Titular", "Domicilio social" / "Domicilio", "Teléfono:", "Email:", "Registro Mercantil:"
- Section: "Objeto" — two full paragraphs about the purpose and acceptance of terms
- Section: "Condiciones de Uso" > "Uso Autorizado" — paragraph about lawful use
- Section: "Condiciones de Uso" > "Prohibiciones" — list of 4 prohibited activities
- Section: "Propiedad Intelectual" — two paragraphs about IP rights
- Section: "Exclusión de Responsabilidades" > "Disponibilidad del Servicio", "Información", "Enlaces a Terceros" — paragraphs for each
- Section: "Legislación Aplicable y Jurisdicción" — two paragraphs
- Section: "Contacto" — "Para cualquier consulta relacionada con este Aviso Legal, puede contactar con nosotros:"
- Labels: "Email:", "Teléfono:", "Dirección:"
- "Última actualización:"

### `src/app/proteccion-de-datos/page.tsx`
- Error: "Error al cargar los datos legales."
- Page heading: "Política de Protección de Datos"
- Subheading: "Información sobre el tratamiento de datos personales conforme al Reglamento General de Protección de Datos (RGPD)"
- Section: "Responsable del Tratamiento" — labels for company data, DPD
- Section: "Finalidades del Tratamiento" — 4 subsections (Servicios Inmobiliarios, Comunicaciones Comerciales, Gestión de la Web, Atención al Cliente), each with "Datos tratados:", "Base legal:", "Finalidad:" fields
- Section: "Conservación de Datos" — 4 retention periods
- Section: "Comunicación de Datos" — list of 5 recipient types (entidades bancarias, notarías, administraciones, portales, proveedores)
- Section: "Transferencias Internacionales" — paragraph + 3 guarantee types
- Section: "Sus Derechos" — 6 rights (Acceso, Rectificación, Supresión, Limitación, Portabilidad, Oposición) + exercise instructions
- Section: "Medidas de Seguridad" — 5 measures (Cifrado, Acceso restringido, Copias de seguridad, Formación, Auditorías)
- Section: "Menores de Edad" — paragraph about age 14+
- Section: "Reclamaciones" — AEPD info (web, dirección, teléfono)
- Section: "Modificaciones" — paragraph
- Section: "Contacto" — DPD contact info
- "Última actualización:"

### `src/app/cookies/page.tsx`
- Error: "Error al cargar los datos legales."
- Breadcrumbs: "Inicio"
- Page heading: "Política de Cookies"
- Subheading: "Información sobre el uso de cookies y tecnologías similares en nuestro sitio web"
- Section 1: "¿Qué son las Cookies?" — full explanatory paragraph
- Section 2: "¿Por qué utilizamos Cookies?" — 6 bullet points
- Section 3: "Tipos de Cookies que Utilizamos" — 4 subsections:
  - "Cookies Técnicas (Esenciales)" — propósito, duración, ejemplos (3 cookies), consent note
  - "Cookies de Análisis" — propósito, duración, proveedores, consent note
  - "Cookies de Marketing" — propósito, duración, proveedores, consent note
  - "Cookies de Preferencias" — propósito, duración, ejemplos (3), consent note
- Section 4: "Gestión de Cookies" — paragraph + "Configuración del Navegador" with 4 browser instructions (Chrome, Firefox, Safari, Edge)
- Section 5: "Cookies de Terceros" — paragraph + provider privacy/settings links
- Section 6: "Consecuencias de Desactivar Cookies" — 5 bullet points
- Section 7: "Actualizaciones de esta Política" — two paragraphs
- Section 8: "Contacto" — email, teléfono
- "Última actualización:"

### `src/app/terminos-condiciones-venta/page.tsx`
- Error: "Error al cargar los datos legales."
- Page heading: "Términos y Condiciones de Venta"
- Section 1: "Objeto y Ámbito de Aplicación" — 2 paragraphs
- Section 2: "Servicios Ofrecidos" — list of 6 services
- Section 3: "Obligaciones del Propietario" — list of 6 obligations
- Section 4: "Comisiones y Honorarios" — 2 paragraphs
- Section 5: "Exclusividad" — paragraph + 3 bullet points
- Section 6: "Protección de Datos" — paragraph
- Section 7: "Duración y Resolución" — paragraph + 4 bullet points
- Section 8: "Responsabilidad" — paragraph + 4 bullet points
- Section 9: "Modificaciones" — paragraph
- Section 10: "Legislación Aplicable y Jurisdicción" — paragraph
- Section 11: "Contacto" — "Email:", "Teléfono:", "Dirección:"
- "Última actualización:"

---

## 16. Email Templates (`src/templates/emails/listing-confirmation.ts`)

### Property type labels
- "Piso", "Casa", "Local comercial", "Solar", "Garaje", "Chalet", "Atico", "Duplex", "Estudio"

### Email content
- Subject: "Hemos recibido tu propiedad - Ref. {referenceNumber}"
- Greeting: "Hola {firstName},"
- Body: "Hemos recibido correctamente la información de tu propiedad. Nuestro equipo la revisará y se pondrá en contacto contigo para los próximos pasos."
- Section title: "Resumen de tu propiedad"
- Labels: "Referencia", "Tipo", "Dirección", "Operación", "Precio"
- Closing: "Si tienes alguna duda, no dudes en contactarnos..."
- Sign-off: "¡Gracias por confiar en nosotros!"
- Footer: "Todos los derechos reservados."

---

## 17. Server Actions (User-Facing Messages)

### `src/server/actions/contact-form.ts`
- Note template: "[{date}] Nuevo mensaje vía web: \"{message}\""
- Fallback note: "Contacto generado vía web: \"{message}\""
- Email subject: "Nuevo mensaje de {name}"
- Success: "Mensaje enviado correctamente"
- Validation error: "Datos del formulario inválidos"
- Generic error: "Error al enviar el mensaje. Por favor, inténtalo de nuevo."

### `src/server/actions/property-inquiry.ts`
- "ID de propiedad inválido"
- Source label: "Página web"
- Note templates with date and property title
- Email subject: "Consulta sobre propiedad: {title}"
- Success: "Consulta enviada correctamente"
- Validation error: "Datos del formulario inválidos"
- Not found: "La propiedad especificada no existe"
- Generic error: "Error al enviar la consulta. Por favor, inténtalo de nuevo."

### `src/server/actions/property-listing.ts`
- "Contacto generado vía web"

---

## 18. Search URL Slugs (`src/lib/search-utils.ts`)

URL path segments used for SEO-friendly URLs:
- Operations: "alquiler", "venta"
- Types: "-casas", "-pisos", "-locales", "-solares", "-garajes", "-edificios", "-oficinas", "-naves-industriales", "-trasteros", "-propiedades"
- Location prefixes: "en-", "todas-ubicaciones", "provincia-", "municipio-"
- Price/size: "precio-desde_", "precio-hasta_", "metros-cuadrados-mas-de_", "metros-cuadrados-menos-de_"
- Bedrooms: "un-dormitorio", "dos-dormitorios", "tres-dormitorios", "cuatro-o-mas-dormitorios"
- Bathrooms: "un-bano", "dos-banos", "tres-o-mas-banos"

---

## 19. Pagination (`src/components/pagination.tsx`)

- Aria label: "Paginación"
- "Anterior", "Siguiente"

---

## 20. KPI Section (`src/components/about/KpiSection.tsx`)

- KPI labels and fallback values in the about/stats section.

---

## Summary

| Area | Approx. Strings | Priority |
|------|-----------------|----------|
| Legal pages (4 full documents) | 300+ | High — legal content varies per client |
| Property characteristics | 100+ | High — core product display |
| FAQs (30 Q&A pairs) | 60+ | High — claims about specific services |
| About section / marketing copy | 15+ | High — brand-specific messaging |
| Hero section | 4 | High — first impression |
| Property cards & detail page | 50+ | Medium — product labels |
| Contact section & forms | 25+ | Medium |
| Property listing form (all steps) | 60+ | Medium |
| Email templates | 15+ | Medium — client-facing emails |
| Server action messages | 15+ | Medium — user feedback |
| Navbar & footer labels | 30+ | Low — mostly generic navigation |
| Search bar & filters | 25+ | Low — mostly generic |
| SEO metadata | 16+ | Medium |
| URL slugs | 25+ | Low — SEO paths |
| Validation messages | 10+ | Low — mostly generic |
| **TOTAL** | **~750+** | |
