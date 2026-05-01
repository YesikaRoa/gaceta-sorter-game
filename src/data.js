// Ley Especial contra los Delitos Informáticos — República Bolivariana de Venezuela

export const CRIMES = [
  // ── Capítulo I: Contra los Sistemas ─────────────────────
  {
    id: 'art6', title: 'Acceso indebido',
    category: 'sistemas', chapter: 'Capítulo I — Art. 6',
    penalty: '1 a 5 años de prisión', fine: '10 a 50 U.T.',
    tags: ['ACCESO', 'SISTEMA'],
    article: 'Art. 6: El que sin autorización acceda, intercepte, interfiera o use un sistema que utilice tecnologías de información...'
  },
  {
    id: 'art7', title: 'Sabotaje o daño a sistemas',
    category: 'sistemas', chapter: 'Capítulo I — Art. 7',
    penalty: '4 a 8 años de prisión', fine: '400 a 800 U.T.',
    tags: ['SEVERO', 'DAÑO'],
    article: 'Art. 7: El que destruya, dañe, modifique o realice cualquier acto que altere el funcionamiento o inutilice un sistema...'
  },
  {
    id: 'art9', title: 'Acceso indebido o sabotaje a sistemas protegidos',
    category: 'sistemas', chapter: 'Capítulo I — Art. 9',
    penalty: '6 a 10 años de prisión', fine: '600 a 1000 U.T.',
    tags: ['CRÍTICO', 'INFRAESTRUCTURA'],
    article: 'Art. 9: Cuando los actos recaigan sobre sistemas que pertenezcan a organismos del Estado...'
  },
  {
    id: 'art11', title: 'Espionaje informático',
    category: 'sistemas', chapter: 'Capítulo I — Art. 11',
    penalty: '3 a 6 años de prisión', fine: '300 a 600 U.T.',
    tags: ['ESPIONAJE', 'DATOS'],
    article: 'Art. 11: El que indebidamente obtenga, revele o difunda datos o información contenidos en un sistema...'
  },
  {
    id: 'art12', title: 'Falsificación de documentos',
    category: 'sistemas', chapter: 'Capítulo I — Art. 12',
    penalty: '3 a 6 años de prisión', fine: '300 a 600 U.T.',
    tags: ['FALSIFICACIÓN', 'DOCUMENTO'],
    article: 'Art. 12: El que, a través de cualquier medio, cree, modifique o elimine un documento que se encuentre incorporado a un sistema...'
  },

  // ── Capítulo II: Contra la Propiedad ────────────────────
  {
    id: 'art13', title: 'Hurto electrónico',
    category: 'propiedad', chapter: 'Capítulo II — Art. 13',
    penalty: '2 a 6 años de prisión', fine: '200 a 600 U.T.',
    tags: ['HURTO', 'BIENES'],
    article: 'Art. 13: El que a través del uso de tecnologías de información, acceda, intercepte, interfiera... para apoderarse de bienes o valores ajenos...'
  },
  {
    id: 'art14', title: 'Fraude informático',
    category: 'propiedad', chapter: 'Capítulo II — Art. 14',
    penalty: '3 a 7 años de prisión', fine: '300 a 700 U.T.',
    tags: ['FRAUDE', 'FINANZAS'],
    article: 'Art. 14: El que, a través del uso indebido de tecnologías de información, valiéndose de cualquier manipulación en sistemas, procure para sí o para un tercero un provecho injusto...'
  },
  {
    id: 'art15', title: 'Obtención indebida de bienes',
    category: 'propiedad', chapter: 'Capítulo II — Art. 15',
    penalty: '2 a 6 años de prisión', fine: '200 a 600 U.T.',
    tags: ['OBTENCIÓN', 'BIEN'],
    article: 'Art. 15: El que sin autorización obtenga, reproduzca o altere datos con fines de obtener bienes o servicios sin contraprestación...'
  },
  {
    id: 'art16', title: 'Manejo fraudulento de tarjetas',
    category: 'propiedad', chapter: 'Capítulo II — Art. 16',
    penalty: '5 a 10 años de prisión', fine: '500 a 1000 U.T.',
    tags: ['TARJETA', 'FRAUDE'],
    article: 'Art. 16: El que por cualquier medio, cree, capture, grabe o altere tarjetas inteligentes o instrumentos análogos...'
  },

  // ── Capítulo III: Contra la Privacidad ──────────────────
  {
    id: 'art20', title: 'Violación de la privacidad de la data',
    category: 'privacidad', chapter: 'Capítulo III — Art. 20',
    penalty: '2 a 6 años de prisión', fine: '200 a 600 U.T.',
    tags: ['PRIVACIDAD', 'DATOS'],
    article: 'Art. 20: El que por cualquier medio se apodere, utilice, modifique o elimine, sin el consentimiento de su dueño, la data o información personales de otro...'
  },
  {
    id: 'art21', title: 'Violación de la privacidad de comunicaciones',
    category: 'privacidad', chapter: 'Capítulo III — Art. 21',
    penalty: '2 a 6 años de prisión', fine: '200 a 600 U.T.',
    tags: ['COMMS', 'INTERCEPCIÓN'],
    article: 'Art. 21: El que mediante el uso de tecnologías de información intercepte, interfiera, capture, difunda, divulgue o utilice comunicaciones privadas...'
  },
  {
    id: 'art22', title: 'Revelación indebida de data',
    category: 'privacidad', chapter: 'Capítulo III — Art. 22',
    penalty: '2 a 6 años de prisión', fine: '200 a 600 U.T.',
    tags: ['FILTRACIÓN', 'PRIVACIDAD'],
    article: 'Art. 22: El que revele, difunda o ceda, en todo o en parte, los hechos descubiertos, las imágenes, el audio o datos obtenidos por alguno de los medios indicados...'
  },

  // ── Capítulo IV: Contra Niños, Niñas o Adolescentes ─────
  {
    id: 'art23', title: 'Difusión de pornografía infantil',
    category: 'menores', chapter: 'Capítulo IV — Art. 23',
    penalty: '4 a 8 años de prisión', fine: '400 a 800 U.T.',
    tags: ['CRÍTICO', 'MENORES'],
    article: 'Art. 23: El que por cualquier medio que involucre el uso de tecnologías de información, exhiba, difunda, transmita o venda material pornográfico con menores de edad...'
  },
  {
    id: 'art24', title: 'Exhibición pornográfica a menores',
    category: 'menores', chapter: 'Capítulo IV — Art. 24',
    penalty: '3 a 6 años de prisión', fine: '300 a 600 U.T.',
    tags: ['MENORES', 'EXHIBICIÓN'],
    article: 'Art. 24: El que por cualquier medio que involucre uso de tecnologías de información, exhiba material pornográfico a niños o adolescentes...'
  },

  // ── Capítulo V: Contra el Orden Económico ───────────────
  {
    id: 'art26', title: 'Apropiación de propiedad intelectual',
    category: 'economico', chapter: 'Capítulo V — Art. 26',
    penalty: '1 a 5 años de prisión', fine: '100 a 500 U.T.',
    tags: ['PIRATERÍA', 'IP'],
    article: 'Art. 26: El que sin autorización reproduzca, plagie, distribuya o comunique públicamente, en todo o en parte, una obra...'
  },
  {
    id: 'art27', title: 'Oferta engañosa',
    category: 'economico', chapter: 'Capítulo V — Art. 27',
    penalty: '1 a 5 años de prisión', fine: '100 a 500 U.T.',
    tags: ['ESTAFA', 'ECONOMÍA'],
    article: 'Art. 27: El que ofrezca, comercialice o provea de bienes o servicios mediante el uso de tecnologías de información y que deliberadamente omita, altere o falsifique información...'
  }
];

export const CATEGORY_NAMES = {
  sistemas:   'Delitos contra los Sistemas',
  propiedad:  'Delitos contra la Propiedad',
  privacidad: 'Delitos contra la Privacidad',
  menores:    'Delitos contra Niños, Niñas o Adolescentes',
  economico:  'Delitos contra el Orden Económico'
};
