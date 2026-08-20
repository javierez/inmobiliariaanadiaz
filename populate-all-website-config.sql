-- Script to populate all website_config data based on data.ts
-- Using account_id: 2251799813685249 (same as navbar.ts)

-- First, check if a record exists for this account
SELECT COUNT(*) as count FROM website_config WHERE account_id = 2251799813685249;

-- Insert or update the complete website_config for the account
-- Note: Adjust this query based on whether you need INSERT or UPDATE

-- If you need to INSERT a new record:
INSERT INTO website_config (
    account_id,
    hero_props,
    social_links,
    seo_props,
    logo,
    favicon,
    featured_props,
    about_props,
    properties_props,
    testimonial_props,
    contact_props,
    footer_props,
    head_props
) VALUES (
    2251799813685249,
    -- hero_props
    '{"title":"Encuentra Tu Casa con Acropolis","subtitle":"Permítenos guiarte en tu viaje inmobiliario","backgroundImage":"/properties/sleek-city-tower.png","findPropertyButton":"Explorar Propiedades","contactButton":"Contáctanos"}',
    
    -- social_links
    '{"facebook":"https://facebook.com/acropolisrealestate","linkedin":"https://linkedin.com/company/acropolisrealestate","twitter":"https://twitter.com/acropolisRE","instagram":"https://instagram.com/acropolisrealestate"}',
    
    -- seo_props
    '{"title":"Acropolis Bienes Raíces - Propiedades en España","description":"Tu socio de confianza en el mercado inmobiliario de España. Especializados en propiedades residenciales y comerciales.","name":"Acropolis Bienes Raíces","image":"https://acropolis-realestate.com/images/logo.jpg","url":"https://acropolis-realestate.com","telephone":"+34 987 123 456","email":"info@acropolis-realestate.com","address":{"streetAddress":"123 Avenida Inmobiliaria","addressLocality":"León","addressRegion":"CL","postalCode":"24001","addressCountry":"ES"},"geo":{"latitude":42.5987,"longitude":-5.5671},"openingHoursSpecification":[{"dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"09:00","closes":"18:00"},{"dayOfWeek":["Saturday"],"opens":"10:00","closes":"14:00"}],"priceRange":"€€","areaServed":{"name":"León","sameAs":"https://es.wikipedia.org/wiki/Le%C3%B3n_(Espa%C3%B1a)"},"hasOfferCatalog":{"name":"Propiedades","itemListElement":[{"name":"Pisos","description":"Pisos premium en las zonas más exclusivas de León"},{"name":"Casas","description":"Chalets y casas exclusivas en ubicaciones privilegiadas"}]},"sameAs":["https://www.facebook.com/acropolisrealestate","https://www.twitter.com/acropolisrealty","https://www.instagram.com/acropolisrealestate","https://www.linkedin.com/company/acropolis-real-estate"],"aggregateRating":{"ratingValue":"4.9","reviewCount":"150","bestRating":"5","worstRating":"1"},"keywords":["inmobiliaria","casas","pisos","locales","lujo","España"],"ogImage":"/images/og-image.png"}',
    
    -- logo
    'https://inmobiliariaacropolis.s3.us-east-1.amazonaws.com/branding/logo_transparent_1754307054237_gBmkUg.png',
    
    -- favicon
    'https://inmobiliariaacropolis.s3.us-east-1.amazonaws.com/branding/logo_transparent_1754307054237_gBmkUg.png',
    
    -- featured_props
    '{"title":"Propiedades Destacadas","subtitle":"Descubre nuestra selección de propiedades premium en las ubicaciones más deseables","maxItems":6}',
    
    -- about_props
    '{"title":"Sobre Inmobiliaria Acropolis","subtitle":"Tu socio de confianza en el viaje inmobiliario desde 20XX","content":"En Inmobiliaria Acropolis, creemos que encontrar la propiedad perfecta debe ser una experiencia emocionante y gratificante. Con más de 25 años de experiencia en la industria, nuestro dedicado equipo de profesionales está comprometido a proporcionar un servicio y orientación excepcionales a lo largo de tu viaje inmobiliario. Ya sea que estés comprando tu primera casa, vendiendo una propiedad o buscando oportunidades de inversión, tenemos el conocimiento, los recursos y la pasión para ayudarte a lograr tus objetivos inmobiliarios.","content2":"Nuestro enfoque personalizado y atención al detalle nos distingue en el mercado. Nos enorgullece ofrecer un servicio integral que abarca desde la búsqueda inicial hasta el cierre de la operación, asegurando que cada cliente reciba la atención y el asesoramiento que merece. Nuestro profundo conocimiento del mercado local y nuestras conexiones en la industria nos permiten ofrecer oportunidades exclusivas y negociaciones ventajosas para nuestros clientes.","image":"/properties/thoughtful-man.png","services":[{"title":"Conocimiento local experto","icon":"map"},{"title":"Servicio personalizado","icon":"user"},{"title":"Comunicación transparente","icon":"message-square"},{"title":"Experiencia en negociación","icon":"handshake"},{"title":"Marketing integral","icon":"megaphone"},{"title":"Soporte continuo","icon":"help-circle"}],"maxServicesDisplayed":6,"servicesSectionTitle":"Nuestros Servicios","aboutSectionTitle":"Nuestra Misión","buttonName":"Contacta a Nuestro Equipo","showKPI":true,"kpi1Name":"Años de Experiencia","kpi1Data":"15+","kpi2Name":"Propiedades Vendidas","kpi2Data":"500+","kpi3Name":"Agentes Profesionales","kpi3Data":"50+","kpi4Name":"Clientes Satisfechos","kpi4Data":"98%"}',
    
    -- properties_props
    '{"title":"Explora Nuestras Propiedades","subtitle":"Explora nuestro diverso portafolio de propiedades para encontrar tu opción perfecta","itemsPerPage":6,"defaultSort":"price-desc","buttonText":"Ver Todas las Propiedades"}',
    
    -- testimonial_props
    '{"title":"Lo Que Dicen Nuestros Clientes","subtitle":"No solo tomes nuestra palabra. Escucha a algunos de nuestros clientes satisfechos.","itemsPerPage":3}',
    
    -- contact_props
    '{"title":"Contacta con Nosotros","subtitle":"Estamos aquí para ayudarte en tu próximo paso inmobiliario","messageForm":true,"address":true,"phone":true,"mail":true,"schedule":true,"map":true,"offices":[{"id":"leon","name":"Oficina de León","address":{"street":"123 Avenida Inmobiliaria","city":"León","state":"CL","country":"España"},"phoneNumbers":{"main":"+34 987 123 456","sales":"+34 987 123 457"},"emailAddresses":{"info":"leon@acropolis-realestate.com","sales":"ventas.leon@acropolis-realestate.com"},"scheduleInfo":{"weekdays":"Lunes a Viernes: 9:00 - 18:00","saturday":"Sábado: 10:00 - 14:00","sunday":"Domingo: Cerrado"},"mapUrl":"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2923.8278533985427!2d-5.569259684526154!3d42.59872697917133!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd374a0c2c000001%3A0x400f8d1ce997580!2sLe%C3%B3n!5e0!3m2!1ses!2ses!4v1647881234567!5m2!1ses!2ses","isDefault":true},{"id":"madrid","name":"Oficina de Madrid","address":{"street":"456 Calle Gran Vía","city":"Madrid","state":"MD","country":"España"},"phoneNumbers":{"main":"+34 910 234 567","sales":"+34 910 234 568"},"emailAddresses":{"info":"madrid@acropolis-realestate.com","sales":"ventas.madrid@acropolis-realestate.com"},"scheduleInfo":{"weekdays":"Lunes a Viernes: 9:30 - 19:00","saturday":"Sábado: 10:00 - 15:00","sunday":"Domingo: Cerrado"},"mapUrl":"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.4301046875!2d-3.7022426845974537!3d40.41995597936578!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42287e472b3b8f%3A0x6a4f71889c8b3b8f!2sGran%20V%C3%ADa%2C%20Madrid!5e0!3m2!1ses!2ses!4v1647881234567!5m2!1ses!2ses"}]}',
    
    -- footer_props
    '{"companyName":"Acropolis Bienes Raíces","description":"Tu socio de confianza para encontrar la propiedad perfecta. Con años de experiencia y dedicación a la excelencia, te ayudamos a tomar decisiones inmobiliarias informadas.","socialLinks":{"facebook":"https://facebook.com/acropolisrealestate","linkedin":"https://linkedin.com/company/acropolisrealestate","twitter":"https://twitter.com/acropolisRE","instagram":"https://instagram.com/acropolisrealestate"},"officeLocations":[{"name":"León","address":["123 Avenida Inmobiliaria","León, CL 24001","España"],"phone":"+34 987 123 456","email":"leon@acropolis-realestate.com"},{"name":"Madrid","address":["456 Calle Gran Vía","Madrid, MD 28013","España"],"phone":"+34 910 234 567","email":"madrid@acropolis-realestate.com"},{"name":"Barcelona","address":["789 Passeig de Gràcia","Barcelona, CT 08007","España"],"phone":"+34 934 567 890","email":"barcelona@acropolis-realestate.com"}],"quickLinksVisibility":{"inicio":true,"propiedades":true,"nosotros":true,"reseñas":true,"contacto":true,"comprar":false,"alquilar":false,"vender":false},"propertyTypesVisibility":{"pisos":true,"casas":true,"locales":true,"solares":true,"garajes":true},"copyright":"© 2025 Acropolis Bienes Raíces. Todos los derechos reservados."}',
    
    -- head_props
    '{"title":"idealista — Casas y pisos, alquiler y venta. Anuncios gratis","description":"¿Buscas casa? Con idealista es más fácil. Más de 1.200.000 anuncios de pisos y casas en venta o alquiler. Publicar anuncios es gratis para particulares."}'
);

-- If you need to UPDATE an existing record:
UPDATE website_config 
SET 
    hero_props = '{"title":"Encuentra Tu Casa con Acropolis","subtitle":"Permítenos guiarte en tu viaje inmobiliario","backgroundImage":"/properties/sleek-city-tower.png","findPropertyButton":"Explorar Propiedades","contactButton":"Contáctanos"}',
    social_links = '{"facebook":"https://facebook.com/acropolisrealestate","linkedin":"https://linkedin.com/company/acropolisrealestate","twitter":"https://twitter.com/acropolisRE","instagram":"https://instagram.com/acropolisrealestate"}',
    seo_props = '{"title":"Acropolis Bienes Raíces - Propiedades en España","description":"Tu socio de confianza en el mercado inmobiliario de España. Especializados en propiedades residenciales y comerciales.","name":"Acropolis Bienes Raíces","image":"https://acropolis-realestate.com/images/logo.jpg","url":"https://acropolis-realestate.com","telephone":"+34 987 123 456","email":"info@acropolis-realestate.com","address":{"streetAddress":"123 Avenida Inmobiliaria","addressLocality":"León","addressRegion":"CL","postalCode":"24001","addressCountry":"ES"},"geo":{"latitude":42.5987,"longitude":-5.5671},"openingHoursSpecification":[{"dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"09:00","closes":"18:00"},{"dayOfWeek":["Saturday"],"opens":"10:00","closes":"14:00"}],"priceRange":"€€","areaServed":{"name":"León","sameAs":"https://es.wikipedia.org/wiki/Le%C3%B3n_(Espa%C3%B1a)"},"hasOfferCatalog":{"name":"Propiedades","itemListElement":[{"name":"Pisos","description":"Pisos premium en las zonas más exclusivas de León"},{"name":"Casas","description":"Chalets y casas exclusivas en ubicaciones privilegiadas"}]},"sameAs":["https://www.facebook.com/acropolisrealestate","https://www.twitter.com/acropolisrealty","https://www.instagram.com/acropolisrealestate","https://www.linkedin.com/company/acropolis-real-estate"],"aggregateRating":{"ratingValue":"4.9","reviewCount":"150","bestRating":"5","worstRating":"1"},"keywords":["inmobiliaria","casas","pisos","locales","lujo","España"],"ogImage":"/images/og-image.png"}',
    featured_props = '{"title":"Propiedades Destacadas","subtitle":"Descubre nuestra selección de propiedades premium en las ubicaciones más deseables","maxItems":6}',
    about_props = '{"title":"Sobre Inmobiliaria Acropolis","subtitle":"Tu socio de confianza en el viaje inmobiliario desde 20XX","content":"En Inmobiliaria Acropolis, creemos que encontrar la propiedad perfecta debe ser una experiencia emocionante y gratificante. Con más de 25 años de experiencia en la industria, nuestro dedicado equipo de profesionales está comprometido a proporcionar un servicio y orientación excepcionales a lo largo de tu viaje inmobiliario. Ya sea que estés comprando tu primera casa, vendiendo una propiedad o buscando oportunidades de inversión, tenemos el conocimiento, los recursos y la pasión para ayudarte a lograr tus objetivos inmobiliarios.","content2":"Nuestro enfoque personalizado y atención al detalle nos distingue en el mercado. Nos enorgullece ofrecer un servicio integral que abarca desde la búsqueda inicial hasta el cierre de la operación, asegurando que cada cliente reciba la atención y el asesoramiento que merece. Nuestro profundo conocimiento del mercado local y nuestras conexiones en la industria nos permiten ofrecer oportunidades exclusivas y negociaciones ventajosas para nuestros clientes.","image":"/properties/thoughtful-man.png","services":[{"title":"Conocimiento local experto","icon":"map"},{"title":"Servicio personalizado","icon":"user"},{"title":"Comunicación transparente","icon":"message-square"},{"title":"Experiencia en negociación","icon":"handshake"},{"title":"Marketing integral","icon":"megaphone"},{"title":"Soporte continuo","icon":"help-circle"}],"maxServicesDisplayed":6,"servicesSectionTitle":"Nuestros Servicios","aboutSectionTitle":"Nuestra Misión","buttonName":"Contacta a Nuestro Equipo","showKPI":true,"kpi1Name":"Años de Experiencia","kpi1Data":"15+","kpi2Name":"Propiedades Vendidas","kpi2Data":"500+","kpi3Name":"Agentes Profesionales","kpi3Data":"50+","kpi4Name":"Clientes Satisfechos","kpi4Data":"98%"}',
    properties_props = '{"title":"Explora Nuestras Propiedades","subtitle":"Explora nuestro diverso portafolio de propiedades para encontrar tu opción perfecta","itemsPerPage":6,"defaultSort":"price-desc","buttonText":"Ver Todas las Propiedades"}',
    testimonial_props = '{"title":"Lo Que Dicen Nuestros Clientes","subtitle":"No solo tomes nuestra palabra. Escucha a algunos de nuestros clientes satisfechos.","itemsPerPage":3}',
    contact_props = '{"title":"Contacta con Nosotros","subtitle":"Estamos aquí para ayudarte en tu próximo paso inmobiliario","messageForm":true,"address":true,"phone":true,"mail":true,"schedule":true,"map":true,"offices":[{"id":"leon","name":"Oficina de León","address":{"street":"123 Avenida Inmobiliaria","city":"León","state":"CL","country":"España"},"phoneNumbers":{"main":"+34 987 123 456","sales":"+34 987 123 457"},"emailAddresses":{"info":"leon@acropolis-realestate.com","sales":"ventas.leon@acropolis-realestate.com"},"scheduleInfo":{"weekdays":"Lunes a Viernes: 9:00 - 18:00","saturday":"Sábado: 10:00 - 14:00","sunday":"Domingo: Cerrado"},"mapUrl":"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2923.8278533985427!2d-5.569259684526154!3d42.59872697917133!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd374a0c2c000001%3A0x400f8d1ce997580!2sLe%C3%B3n!5e0!3m2!1ses!2ses!4v1647881234567!5m2!1ses!2ses","isDefault":true},{"id":"madrid","name":"Oficina de Madrid","address":{"street":"456 Calle Gran Vía","city":"Madrid","state":"MD","country":"España"},"phoneNumbers":{"main":"+34 910 234 567","sales":"+34 910 234 568"},"emailAddresses":{"info":"madrid@acropolis-realestate.com","sales":"ventas.madrid@acropolis-realestate.com"},"scheduleInfo":{"weekdays":"Lunes a Viernes: 9:30 - 19:00","saturday":"Sábado: 10:00 - 15:00","sunday":"Domingo: Cerrado"},"mapUrl":"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.4301046875!2d-3.7022426845974537!3d40.41995597936578!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42287e472b3b8f%3A0x6a4f71889c8b3b8f!2sGran%20V%C3%ADa%2C%20Madrid!5e0!3m2!1ses!2ses!4v1647881234567!5m2!1ses!2ses"}]}',
    footer_props = '{"companyName":"Acropolis Bienes Raíces","description":"Tu socio de confianza para encontrar la propiedad perfecta. Con años de experiencia y dedicación a la excelencia, te ayudamos a tomar decisiones inmobiliarias informadas.","socialLinks":{"facebook":"https://facebook.com/acropolisrealestate","linkedin":"https://linkedin.com/company/acropolisrealestate","twitter":"https://twitter.com/acropolisRE","instagram":"https://instagram.com/acropolisrealestate"},"officeLocations":[{"name":"León","address":["123 Avenida Inmobiliaria","León, CL 24001","España"],"phone":"+34 987 123 456","email":"leon@acropolis-realestate.com"},{"name":"Madrid","address":["456 Calle Gran Vía","Madrid, MD 28013","España"],"phone":"+34 910 234 567","email":"madrid@acropolis-realestate.com"},{"name":"Barcelona","address":["789 Passeig de Gràcia","Barcelona, CT 08007","España"],"phone":"+34 934 567 890","email":"barcelona@acropolis-realestate.com"}],"quickLinksVisibility":{"inicio":true,"propiedades":true,"nosotros":true,"reseñas":true,"contacto":true,"comprar":false,"alquilar":false,"vender":false},"propertyTypesVisibility":{"pisos":true,"casas":true,"locales":true,"solares":true,"garajes":true},"copyright":"© 2025 Acropolis Bienes Raíces. Todos los derechos reservados."}',
    head_props = '{"title":"idealista — Casas y pisos, alquiler y venta. Anuncios gratis","description":"¿Buscas casa? Con idealista es más fácil. Más de 1.200.000 anuncios de pisos y casas en venta o alquiler. Publicar anuncios es gratis para particulares."}'
WHERE account_id = 2251799813685249;

-- Verify the data was inserted/updated correctly
SELECT account_id, 
       hero_props,
       social_links,
       seo_props,
       featured_props,
       about_props,
       properties_props,
       testimonial_props,
       contact_props,
       footer_props,
       head_props
FROM website_config 
WHERE account_id = 2251799813685249;