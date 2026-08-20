

export type ContactProps = {
  title: string;
  subtitle: string;
  messageForm: boolean;
  address: boolean;
  phone: boolean;
  mail: boolean;
  schedule: boolean;
  map: boolean;
  // Contact information fields
  offices: Array<{
    id: string;
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode?: string;
    };
    phoneNumbers: {
      main: string;
      sales?: string;
    };
    emailAddresses: {
      info: string;
      sales?: string;
    };
    scheduleInfo: {
      weekdays: string;
      saturday: string;
      sunday: string;
    };
    mapUrl: string;
    isDefault?: boolean;
  }>;
  /**
   * Set by the CRM contact config. Unused by this template, but declared so the
   * generated site — which inlines contact_props verbatim as a typed literal —
   * still compiles.
   */
  whatsappNumber?: string;
};

export const getContactProps = (_accountIdArg?: bigint): ContactProps | null => {
  return {
  "title": "Contáctanos",
  "subtitle": "Estamos aquí para ayudarte",
  "messageForm": true,
  "address": true,
  "phone": true,
  "mail": true,
  "schedule": true,
  "map": true,
  "offices": [{
  "id": "SHib2HdbKgM7HV9Ekd38V",
  "name": "Inmobiliaria Ana Díaz",
  "address": {
  "street": "Calle Roa de la Vega 12 - Bajo",
  "city": "León",
  "state": "León",
  "country": "España",
  "postalCode": "24002"
},
  "phoneNumbers": {
  "main": "987221155",
  "sales": ""
},
  "emailAddresses": {
  "info": "inmo@inmobiliariaanadiaz.es",
  "sales": ""
},
  "scheduleInfo": {
  "weekdays": "Lunes a Viernes de 10:00 - 13:30h y de 17:00h - 19:30h",
  "saturday": "Sábados: cerrado",
  "sunday": "Domingos: cerrado"
},
  "mapUrl": "https://www.google.es/maps/place/Inmobiliaria+Ana+D%C3%ADaz+S.L./@42.6006235,-5.5795057,1600m/data=!3m2!1e3!4b1!4m6!3m5!1s0xd379a91f1db4d0f:0x9fdb0c16671b9543!8m2!3d42.6006196!4d-5.5769308!16s%2Fg%2F1tdm5072?entry=ttu&g_ep=EgoyMDI2MDgwNS4xIKXMDSoASAFQAw%3D%3D",
  "isDefault": true
}]
};
}
