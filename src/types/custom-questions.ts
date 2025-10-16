export interface CustomQuestion {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date' | 'file' | 'info';
  label: string;
  placeholder?: string;
  required?: boolean;
  
  /**
   * For checkbox:
   * - 'boolean' = single yes/no checkbox (no options, answer is boolean)
   * - 'multi' = multi-select checkbox group (uses options[], answer is string[])
   * If omitted, UIs may infer: options? => 'multi', else 'boolean'.
   * Adding this field is backward-compatible.
   */
  variant?: 'boolean' | 'multi';
  
  options?: { value: string; label: string }[]; // for select/radio/checkbox
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  defaultValue?: string;
  description?: string; // for file inputs and other descriptive text
  accept?: string; // for file inputs
}

export interface CustomQuestionsConfig {
  [leafReason: string]: {
    title?: string;
    description?: string;
    questions: CustomQuestion[];
  };
}

// Configuration for Step 2 (Describe Media) questions based on issue type
export const STEP2_QUESTIONS_CONFIG: CustomQuestionsConfig = {
  'issue.v1.heating.radiator.leak': {
    title: 'Lekkage Vragen',
    description: 'Help ons de lekkage situatie beter te begrijpen',
    questions: [
      {
        id: 'water_type',
        type: 'radio',
        label: 'Wat voor water lekt er?',
        required: true,
        options: [
          { value: 'helder_schoon', label: 'Helder/schoon water (leidingwater)' },
          { value: 'vuil_verkleurd', label: 'Vuil/verkleurd water (CV-water)' }
        ]
      },
      {
        id: 'leak_location',
        type: 'select',
        label: 'Waar ziet u het water?',
        required: true,
        options: [
          { value: 'plafond', label: 'Plafond' },
          { value: 'muur', label: 'Muur' },
          { value: 'vloer', label: 'Vloer' },
          { value: 'rondom_toilet', label: 'Rondom toilet' },
          { value: 'keuken', label: 'Keuken' },
          { value: 'badkamer', label: 'Badkamer' },
          { value: 'radiator_leiding', label: 'Radiator/leiding' },
          { value: 'dak_dakraam', label: 'Dak/dakraam' },
          { value: 'kelder', label: 'Kelder' },
          { value: 'onbekend', label: 'Onbekend' }
        ]
      },
      {
        id: 'leak_severity',
        type: 'radio',
        label: 'Hoe ernstig is de lekkage?',
        required: true,
        options: [
          { value: 'druppelt', label: 'Druppelt' },
          { value: 'constante_stroom', label: 'Constante stroom' },
          { value: 'zware_stroom', label: 'Zware stroom' },
          { value: 'overstroming', label: 'Overstroming' }
        ]
      },
      {
        id: 'leak_duration',
        type: 'textarea',
        label: 'Hoe lang heeft u dit probleem al?',
        placeholder: 'bijv. sinds gisteren, een week geleden',
        required: false
      }
    ]
  },
  'issue.v1.heating.no_heat': {
    title: 'Verwarming Vragen',
    description: 'Vertel ons meer over het verwarmingsprobleem',
    questions: [
      {
        id: 'heating_type',
        type: 'select',
        label: 'Type installatie',
        required: true,
        options: [
          { value: 'cv_ketel', label: 'CV-ketel' },
          { value: 'blokverwarming', label: 'Blokverwarming' },
          { value: 'stadsverwarming', label: 'Stadsverwarming' },
          { value: 'warmtepomp', label: 'Warmtepomp' },
          { value: 'boiler', label: 'Boiler' },
          { value: 'onbekend', label: 'Onbekend' }
        ]
      },
      {
        id: 'heating_problem',
        type: 'radio',
        label: 'Wat is het probleem?',
        required: true,
        options: [
          { value: 'geen_warmte', label: 'Geen warmte' },
          { value: 'niet_warm_genoeg', label: 'Niet warm genoeg' },
          { value: 'te_heet', label: 'Te heet' },
          { value: 'ongelijke_verwarming', label: 'Ongelijke verwarming' },
          { value: 'geluid_trillingen', label: 'Geluid/trillingen' }
        ]
      },
      {
        id: 'affected_areas',
        type: 'textarea',
        label: 'Welke kamers zijn getroffen?',
        placeholder: 'bijv. woonkamer, slaapkamer, hele woning',
        required: false
      }
    ]
  },
  'issue.v1.electrical.whole_home.outage': {
    title: 'Elektra Vragen',
    description: 'Elektrische problemen - veiligheidsinformatie',
    questions: [
      {
        id: 'outage_location',
        type: 'select',
        label: 'Waar is de storing?',
        required: true,
        options: [
          { value: 'een_kamer', label: 'Één kamer' },
          { value: 'meerdere_kamers', label: 'Meerdere kamers' },
          { value: 'hele_woning', label: 'De hele woning' },
          { value: 'gemeenschappelijke_ruimte', label: 'Gemeenschappelijke ruimte' }
        ]
      },
      {
        id: 'safety_check',
        type: 'radio',
        label: 'Ruikt u brandlucht of ziet u vonken?',
        required: true,
        options: [
          { value: 'ja_brandlucht', label: 'Ja - STOP en bel 112' },
          { value: 'nee_geen_gevaar', label: 'Nee - geen directe gevaren' }
        ]
      },
      {
        id: 'circuit_breaker_status',
        type: 'checkbox',
        label: 'Is de zekering gesprongen?',
        required: false,
        variant: 'boolean'
      }
    ]
  },
  'issue.v1.drainage.toilet.blocked': {
    title: 'Afvoer Vragen',
    description: 'Verstopping/afvoer problemen',
    questions: [
      {
        id: 'drain_location',
        type: 'select',
        label: 'Waar is de verstopping?',
        required: true,
        options: [
          { value: 'toilet', label: 'Toilet' },
          { value: 'douche', label: 'Douche' },
          { value: 'bad', label: 'Bad' },
          { value: 'wastafel', label: 'Wastafel' },
          { value: 'keukenafvoer', label: 'Keukenafvoer' },
          { value: 'meerdere_afvoeren', label: 'Meerdere afvoeren' },
          { value: 'buitenafvoer', label: 'Buitenafvoer' }
        ]
      },
      {
        id: 'blockage_severity',
        type: 'radio',
        label: 'Hoe ernstig is de verstopping?',
        required: true,
        options: [
          { value: 'water_loopt_langzaam_weg', label: 'Water loopt langzaam weg' },
          { value: 'water_loopt_helemaal_niet_weg', label: 'Water loopt helemaal niet weg' },
          { value: 'water_komt_omhoog', label: 'Water komt omhoog' }
        ]
      },
      {
        id: 'attempted_fixes',
        type: 'textarea',
        label: 'Wat heeft u al geprobeerd?',
        placeholder: 'bijv. ontstopper, heet water, niets',
        required: false
      }
    ]
  },
  'issue.lift': {
    title: 'Lift Vragen',
    description: 'Lift problemen',
    questions: [
      {
        id: 'lift_issue',
        type: 'select',
        label: 'Wat is het probleem?',
        required: true,
        options: [
          { value: 'lift_staat_stil', label: 'Lift staat stil' },
          { value: 'deuren_sluiten_niet', label: 'Deuren sluiten niet' },
          { value: 'veel_geluid', label: 'Veel geluid' },
          { value: 'knoppen_defect', label: 'Knoppen/indicatie defect' }
        ]
      },
      {
        id: 'people_trapped',
        type: 'radio',
        label: 'Zitten er mensen vast in de lift?',
        required: true,
        options: [
          { value: 'ja_mensen_vast', label: 'Ja - mensen zitten vast (BEL 112)' },
          { value: 'nee_lift_leeg', label: 'Nee - lift staat stil maar leeg' }
        ]
      }
    ]
  },
  'issue.video': {
    title: '',
    description: 'Upload een video om het probleem beter te laten zien',
    questions: [
      {
        id: 'video_url',
        type: 'text',
        label: '',
        placeholder: 'bijv. https://youtube.com/watch?v=... of https://vimeo.com/...',
        required: true,
        defaultValue: 'https://www.youtube.com/watch?v=lrlT6s5_xN4'
      }
    ]
  },
  'issue.uw_responsability': {
    title: 'Deze zaak valt onder uw eigen verantwoordelijkheid',
    description: '',
    questions: [
      {
        id: 'tenant_acknowledgment',
        type: 'checkbox',
        label: 'Ik begrijp dat deze reparatie onder mijn eigen verantwoordelijkheid valt',
        required: true,
        variant: 'boolean'
      },
      {
        id: 'additional_info',
        type: 'textarea',
        label: 'Aanvullende informatie (optioneel)',
        placeholder: 'Heeft u nog vragen of opmerkingen?',
        required: false
      }
    ]
  },
  'issue.emergency': {
    title: 'Dit is een noodgeval',
    description: 'Dit probleem vormt een direct gevaar voor de veiligheid',
    questions: [
      {
        id: 'emergency_acknowledgment',
        type: 'checkbox',
        label: 'Ik begrijp dat dit een noodgeval is en ik direct actie moet ondernemen',
        required: true,
        variant: 'boolean'
      }
    ]
  },
  'issue.v1.electrical.smoke_alarm.chirping': {
    title: 'Rookmelder Piept',
    description: 'Rookmelder piept of batterijmelding',
    questions: [
      {
        id: 'power_source',
        type: 'radio',
        label: 'Hoe wordt de rookmelder gevoed?',
        required: true,
        options: [
          { value: 'batterij', label: 'Batterij' },
          { value: 'netspanning', label: 'Stroom uit de muur (netspanning)' },
          { value: 'beide', label: 'Beide (batterij + netspanning)' }
        ]
      },
      {
        id: 'battery_replaced',
        type: 'radio',
        label:
          'In bijna alle gevallen betekent dit dat de batterij leeg is.\n👉 Vervang alstublieft de batterij.\n\nGa alleen verder als dit niet lukt of geen succes biedt:',
        required: false,
        options: [
          { value: 'kan_batterij_niet_vervangen', label: 'Ik kan de batterij niet vervangen' },
          { value: 'batterij_vervangen_geen_succes', label: 'Ik heb de batterij vervangen maar het piepen stopt niet' },
          { value: 'geen_batterij_vast_aangesloten', label: 'Er is geen batterij (vast aangesloten melder)' }
        ]
      }
    ]
  },
  'issue.v1.electrical.smoke_alarm.false_alarm': {
    title: 'Rookmelder Vals Alarm',
    description: 'Rookmelder gaat onterecht af',
    questions: [
      {
        id: 'power_source',
        type: 'radio',
        label: 'Hoe wordt de rookmelder gevoed?',
        required: true,
        options: [
          { value: 'batterij', label: 'Batterij' },
          { value: 'netspanning', label: 'Stroom uit de muur (netspanning)' },
          { value: 'beide', label: 'Beide (batterij + netspanning)' }
        ]
      },
      {
        id: 'battery_replaced',
        type: 'radio',
        label:
          'In bijna alle gevallen betekent dit dat de batterij leeg is.\n👉 Vervang alstublieft de batterij.\n\nGa alleen verder als dit niet lukt of geen succes biedt:',
        required: false,
        options: [
          { value: 'kan_batterij_niet_vervangen', label: 'Ik kan de batterij niet vervangen' },
          { value: 'batterij_vervangen_geen_succes', label: 'Ik heb de batterij vervangen maar het piepen stopt niet' },
          { value: 'geen_batterij_vast_aangesloten', label: 'Er is geen batterij (vast aangesloten melder)' }
        ]
      }
    ]
  },
  'issue.v1.electrical.smoke_alarm.not_working': {
    title: 'Rookmelder Werkt Niet',
    description: 'Rookmelder doet het niet',
    questions: [
      {
        id: 'power_source',
        type: 'radio',
        label: 'Hoe wordt de rookmelder gevoed?',
        required: true,
        options: [
          { value: 'batterij', label: 'Batterij' },
          { value: 'netspanning', label: 'Stroom uit de muur (netspanning)' },
          { value: 'beide', label: 'Beide (batterij + netspanning)' }
        ]
      },
      {
        id: 'battery_replaced',
        type: 'radio',
        label:
          'In bijna alle gevallen betekent dit dat de batterij leeg is.\n👉 Vervang alstublieft de batterij.\n\nGa alleen verder als dit niet lukt of geen succes biedt:',
        required: false,
        options: [
          { value: 'kan_batterij_niet_vervangen', label: 'Ik kan de batterij niet vervangen' },
          { value: 'batterij_vervangen_geen_succes', label: 'Ik heb de batterij vervangen maar het piepen stopt niet' },
          { value: 'geen_batterij_vast_aangesloten', label: 'Er is geen batterij (vast aangesloten melder)' }
        ]
      }
    ]
  },
  'issue.v1.doors.common.door_opener_fault': {
    title: 'Deuropener Defect',
    description: 'Elektrische deuropener werkt niet',
    questions: [
      {
        id: 'opener_problem',
        type: 'select',
        label: 'Wat is het probleem?',
        required: true,
        options: [
          { value: 'reageert_niet', label: 'Reageert niet op knop' },
          { value: 'maakt_geluid_opent_niet', label: 'Maakt geluid maar opent niet' },
          { value: 'opent_niet_volledig', label: 'Opent niet volledig' },
          { value: 'sluit_niet', label: 'Sluit niet automatisch' }
        ]
      },
      {
        id: 'door_type',
        type: 'select',
        label: 'Wat voor deur?',
        required: true,
        options: [
          { value: 'portiekdeur', label: 'Portiekdeur' },
          { value: 'garagedeur', label: 'Garagedeur' },
          { value: 'hek_poort', label: 'Hek/poort' },
          { value: 'andere', label: 'Andere' }
        ]
      },
      {
        id: 'manual_access',
        type: 'radio',
        label: 'Kunt u er handmatig doorheen?',
        required: true,
        options: [
          { value: 'ja_met_sleutel', label: 'Ja, met sleutel' },
          { value: 'ja_duwen_trekken', label: 'Ja, door duwen/trekken' },
          { value: 'nee_vast', label: 'Nee, zit vast' }
        ]
      }
    ]
  },
  // LEKKAGE FINAL NODES - Water type questions
  'issue.v1.water.supply.hose_leak': {
    title: 'Lekkage Toevoerleiding',
    description: 'Help ons de lekkage situatie beter te begrijpen',
    questions: [
      {
        id: 'water_type',
        type: 'radio',
        label: 'Wat voor water lekt er?',
        required: true,
        options: [
          { value: 'helder_schoon', label: 'Helder/schoon water (toevoerleiding)' },
          { value: 'vuil_verkleurd', label: 'Vuil/verkleurd water (afvoer)' }
        ]
      },
      {
        id: 'leak_severity',
        type: 'radio',
        label: 'Hoe ernstig is de lekkage?',
        required: true,
        options: [
          { value: 'druppelt', label: 'Druppelt' },
          { value: 'constante_stroom', label: 'Constante stroom' },
          { value: 'zware_stroom', label: 'Zware stroom' }
        ]
      }
    ]
  },
  'issue.v1.leakage.bathroom.sink_cabinet': {
    title: 'Lekkage Badkamer - Onder Wastafel',
    description: 'Lekkage onder de wastafel in de badkamer',
    questions: [
      {
        id: 'water_type',
        type: 'radio',
        label: 'Wat voor water lekt er?',
        required: true,
        options: [
          { value: 'helder_schoon', label: 'Helder/schoon water (toevoerleiding)' },
          { value: 'vuil_verkleurd', label: 'Vuil/verkleurd water (afvoer)' }
        ]
      },
      {
        id: 'leak_location',
        type: 'select',
        label: 'Waar precies lekt het?',
        required: true,
        options: [
          { value: 'sifon', label: 'Sifon (S-bocht)' },
          { value: 'aansluitingen', label: 'Aansluitingen kraan' },
          { value: 'afvoerpijp', label: 'Afvoerpijp' },
          { value: 'onbekend', label: 'Onbekend' }
        ]
      }
    ]
  },
  'issue.v1.leakage.kitchen.sink_cabinet': {
    title: 'Lekkage Keuken - Onder Gootsteen',
    description: 'Lekkage onder de gootsteen in de keuken',
    questions: [
      {
        id: 'water_type',
        type: 'radio',
        label: 'Wat voor water lekt er?',
        required: true,
        options: [
          { value: 'helder_schoon', label: 'Helder/schoon water (toevoerleiding)' },
          { value: 'vuil_verkleurd', label: 'Vuil/verkleurd water (afvoer)' }
        ]
      },
      {
        id: 'leak_location',
        type: 'select',
        label: 'Waar precies lekt het?',
        required: true,
        options: [
          { value: 'sifon', label: 'Sifon (S-bocht)' },
          { value: 'aansluitingen', label: 'Aansluitingen kraan' },
          { value: 'afvoerpijp', label: 'Afvoerpijp' },
          { value: 'onbekend', label: 'Onbekend' }
        ]
      }
    ]
  },
  'issue.v1.leakage.ceiling.stain': {
    title: 'Plafondvlekken',
    description: 'Vlekken in het plafond door lekkage',
    questions: [
      {
        id: 'ceiling_leak_source',
        type: 'select',
        label: 'Waar komt de lekkage vandaan?',
        required: true,
        options: [
          { value: 'dak', label: 'Dak' },
          { value: 'bovenburen', label: 'Bovenburen' },
          { value: 'plafond_zelf', label: 'Plafond zelf' },
          { value: 'onbekend', label: 'Onbekend' }
        ]
      },
      {
        id: 'stain_size',
        type: 'select',
        label: 'Hoe groot is de vlek?',
        required: true,
        options: [
          { value: 'klein', label: 'Klein (< 30cm)' },
          { value: 'middel', label: 'Middel (30-100cm)' },
          { value: 'groot', label: 'Groot (> 100cm)' }
        ]
      }
    ]
  },
  'issue.v1.leakage.ceiling.drip_from_above': {
    title: 'Druppelt van Boven',
    description: 'Water druppelt van het plafond',
    questions: [
      {
        id: 'ceiling_leak_source',
        type: 'select',
        label: 'Waar komt de lekkage vandaan?',
        required: true,
        options: [
          { value: 'dak', label: 'Dak' },
          { value: 'bovenburen', label: 'Bovenburen' },
          { value: 'plafond_zelf', label: 'Plafond (installatie/leiding)' },
          { value: 'onbekend', label: 'Onbekend' }
        ]
      },
      {
        id: 'drip_frequency',
        type: 'radio',
        label: 'Hoe vaak druppelt het?',
        required: true,
        options: [
          { value: 'constant', label: 'Constant' },
          { value: 'alleen_bij_regen', label: 'Alleen bij regen' },
          { value: 'soms', label: 'Soms' }
        ]
      },
      {
        id: 'water_type',
        type: 'radio',
        label: 'Wat voor water is het?',
        required: false,
        options: [
          { value: 'helder', label: 'Helder water' },
          { value: 'vuil_bruin', label: 'Vuil/bruin water' }
        ]
      }
    ]
  },
  // VERWARMING FINAL NODES - Using correct decision tree node IDs
  'issue.v1.heating.radiator.no_heat': {
    title: 'Radiator Verwarming',
    description: 'In de kamer waar de thermostaat hangt, hebben radiatoren mogelijk geen knop. Dit is normaal — de thermostaat regelt daar de temperatuur. Tip: Soms zit de radiatorkraan vast. Zacht tikken helpt meestal (zie video).',
    questions: [
      {
        id: 'radiator_location',
        type: 'text',
        label: 'Waar staat de radiator?',
        placeholder: 'bijv. woonkamer, slaapkamer voorkant',
        required: true
      },
      {
        id: 'radiator_valve_stuck',
        type: 'radio',
        label: 'Heeft u de radiatorkraan gecontroleerd?',
        required: false,
        options: [
          { value: 'ja_goed', label: 'Ja, draait goed' },
          { value: 'ja_vast', label: 'Ja, zit vast' },
          { value: 'nee_niet_gecontroleerd', label: 'Nee, niet gecontroleerd' }
        ]
      }
    ]
  },
  'issue.v1.heating.boiler.error': {
    title: 'Ketel Foutmelding',
    description: 'Foto van het apparaat is verplicht voor diagnose',
    questions: [
      {
        id: 'boiler_photo_required',
        type: 'checkbox',
        label: 'Ik ga een foto uploaden van de ketel/boiler',
        required: true,
        variant: 'boolean'
      },
      {
        id: 'error_code',
        type: 'text',
        label: 'Wat is de exacte foutcode?',
        placeholder: 'bijv. E1, F22, C6',
        required: true
      }
    ]
  },
  'issue.v1.heating.boiler.low_pressure': {
    title: 'Ketel Lage Druk',
    description: 'Keteldruk is te laag (onder 1.0 bar)',
    questions: [
      {
        id: 'current_pressure',
        type: 'text',
        label: 'Wat staat er op de drukmeter?',
        placeholder: 'bijv. 0.5 bar, 0 bar',
        required: true
      },
      {
        id: 'pressure_drop_frequency',
        type: 'radio',
        label: 'Hoe vaak valt de druk weg?',
        required: true,
        options: [
          { value: 'eerste_keer', label: 'Eerste keer' },
          { value: 'soms', label: 'Soms' },
          { value: 'regelmatig', label: 'Regelmatig' }
        ]
      }
    ]
  },
  // DEUREN FINAL NODES - Using actual decision tree IDs
  'issue.v1.doors.apartment.close_issue': {
    title: 'Woningdeur Sluit Niet Goed',
    description: 'Woningdeur sluit niet goed of klemt',
    questions: [
      {
        id: 'door_type',
        type: 'radio',
        label: 'Is dit de voordeur of achterdeur?',
        required: true,
        options: [
          { value: 'voordeur', label: 'Voordeur' },
          { value: 'achterdeur', label: 'Achterdeur' }
        ]
      },
      {
        id: 'door_closes_properly',
        type: 'radio',
        label: 'Sluit/valt de deur goed in het kozijn?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      }
    ]
  },
  'issue.v1.doors.general': {
    title: 'Deur Probleem',
    description: '',
    questions: [
      {
        id: 'door_location',
        type: 'select',
        label: 'Om welke deur gaat het?',
        required: true,
        options: [
          { value: 'deur_naar_straat', label: 'Deur naar de straat' },
          { value: 'deur_naar_woning', label: 'Deur naar mijn woning' },
          { value: 'deur_naar_woning_eigen_opgang', label: 'Deur naar mijn woning (Ik heb een eigen opgang)' },
          { value: 'deur_binnen_woning', label: 'Deur binnen mijn woning' },
          { value: 'deur_naar_balkon_terras', label: 'Deur naar balkon/terras' }
        ]
      },
      {
        id: 'door_problem_type',
        type: 'select',
        label: 'Wat is het probleem?',
        required: true,
        options: [
          { value: 'sluit_niet_goed_af', label: 'De deur sluit niet goed af' },
          { value: 'valt_niet_goed_in_slot', label: 'De deur valt niet goed in het slot' },
          { value: 'gaat_niet_open', label: 'Deur gaat niet open' },
          { value: 'anders', label: 'Anders, namelijk …' }
        ]
      },
      {
        id: 'problem_description',
        type: 'textarea',
        label: 'Omschrijf probleem',
        placeholder: 'Beschrijf het probleem zo gedetailleerd mogelijk...',
        required: true
      }
    ]
  },
  'issue.v1.doors.apartment.lock_cylinder_issue': {
    title: 'Woningdeur Slot Probleem',
    description: 'Slot of cilinder van woningdeur werkt niet',
    questions: [
      {
        id: 'key_goes_in_out',
        type: 'radio',
        label: 'Gaat de sleutel erin/eruit?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'key_turns',
        type: 'radio',
        label: 'Draait de sleutel?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      }
    ]
  },
  // RAMEN & KOZIJNEN FINAL NODES
  'issue.v1.window.leak_perimeter': {
    title: 'Kozijn of rond het kozijn',
    description: 'Lekkage rondom het kozijn.',
    questions: [
      {
        id: 'room_location',
        type: 'text',
        label: 'In welke kamer bevindt het zich?',
        placeholder: 'bijv. woonkamer, slaapkamer + Voorzijde/achterzijde',
        required: true
      },
      {
        id: 'house_side',
        type: 'radio',
        label: 'Voorzijde of achterzijde van de woning?',
        required: true,
        options: [
          { value: 'voorzijde', label: 'Voorzijde' },
          { value: 'achterzijde', label: 'Achterzijde' }
        ]
      },
      {
        id: 'frame_material',
        type: 'radio',
        label: 'Materiaal kozijn?',
        required: true,
        options: [
          { value: 'kunststof', label: 'Kunststof' },
          { value: 'aluminium', label: 'Aluminium' },
          { value: 'hout', label: 'Hout' }
        ]
      },
      {
        id: 'gutter_clean',
        type: 'radio',
        label: 'Gootje schoon maken',
        description: 'LET OP: Indien er een goot aanwezig is onder het raam is het belangrijk deze eerst schoon te maken.',
        required: true,
        options: [
          { value: 'gootje_schoon', label: 'Gootje is schoon gemaakt' },
          { value: 'geen_gootje', label: 'Er is geen gootje aanwezig' }
        ]
      },
      {
        id: 'photo_instructions',
        type: 'info',
        label: 'Maak een foto van de hele situatie.\nMaak een foto waar het water vandaan komt.',
        required: false
      }
    ]
  },
  'issue.v1.facade.wall.leak': {
    title: 'Buitenmuur',
    description: 'Lekkage aan de buitenmuur',
    questions: [
      {
        id: 'leak_frequency',
        type: 'radio',
        label: 'Lekt het continu of bij (hevige) regenval?',
        required: true,
        options: [
          { value: 'continu', label: 'Continu' },
          { value: 'bij_regen', label: 'Bij regenval' },
          { value: 'bij_hevige_regen', label: 'Bij hevige regenval' }
        ]
      },
      {
        id: 'above_leak',
        type: 'radio',
        label: 'Wat zit er boven de lekkage?',
        required: true,
        options: [
          { value: 'dak', label: 'Dak' },
          { value: 'badkamer_buren', label: 'Badkamer buren' },
          { value: 'keuken_buren', label: 'Keuken buren' },
          { value: 'buren_andere_ruimte', label: 'Buren (andere ruimte of geen idee welke ruimte)' }
        ]
      },
      {
        id: 'photo_instructions',
        type: 'info',
        label: 'Maak een foto van de hele situatie.\nMaak een foto waar het water vandaan komt.',
        required: false
      }
    ]
  },
  'issue.v1.leakage.kitchen.appliance_connection': {
    title: 'Lekkage Keuken – Aansluiting vaatwasser/wasmachine',
    description: 'Help ons de lekkage situatie beter te begrijpen',
    questions: [
      {
        id: 'water_type',
        type: 'radio',
        label: 'Wat voor water lekt er?',
        required: true,
        options: [
          { value: 'helder_schoon', label: 'Helder/schoon water (toevoerleiding)' },
          { value: 'vuil_verkleurd', label: 'Vuil/verkleurd water (afvoer)' }
        ]
      }
    ]
  },
  'issue.v1.leakage.bathroom.toilet_cistern': {
    title: 'Lekkage Badkamer – Toilet/Stortbak',
    description: 'Help ons de lekkage situatie beter te begrijpen',
    questions: [
      {
        id: 'water_type',
        type: 'radio',
        label: 'Wat voor water lekt er?',
        required: true,
        options: [
          { value: 'helder_schoon', label: 'Helder/schoon water (toevoerleiding)' },
          { value: 'vuil_verkleurd', label: 'Vuil/verkleurd water (afvoer)' }
        ]
      }
    ]
  },
  'issue.v1.leakage.bathroom.shower_bath_drain': {
    title: 'Lekkage Badkamer – Douche/Bad/Afvoerput',
    description: 'Help ons de lekkage situatie beter te begrijpen',
    questions: [
      {
        id: 'water_type',
        type: 'radio',
        label: 'Wat voor water lekt er?',
        required: true,
        options: [
          { value: 'helder_schoon', label: 'Helder/schoon water (toevoerleiding)' },
          { value: 'vuil_verkleurd', label: 'Vuil/verkleurd water (afvoer)' }
        ]
      }
    ]
  },
  'issue.v1.drainage.pipe.leak': {
    title: 'Lekkage Afvoer/Pijp',
    description: 'Help ons de lekkage situatie beter te begrijpen',
    questions: [
      {
        id: 'water_type',
        type: 'radio',
        label: 'Wat voor water lekt er?',
        required: true,
        options: [
          { value: 'helder_schoon', label: 'Helder/schoon water (toevoerleiding)' },
          { value: 'vuil_verkleurd', label: 'Vuil/verkleurd water (afvoer)' }
        ]
      }
    ]
  },
  // APPARATEN FINAL NODES - Using actual decision tree IDs
  'issue.v1.appliance.fridge_freezer.fault': {
    title: 'Koelkast/Vriezer Defect',
    description: 'Koelkast of vriezer werkt niet goed',
    questions: [
      {
        id: 'appliance_built_in',
        type: 'radio',
        label: 'Is het apparaat ingebouwd?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'included_when_renting',
        type: 'radio',
        label: 'Was het apparaat aanwezig bij het huren van de woning?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'brand_model',
        type: 'text',
        label: 'Merk en model',
        placeholder: 'bijv. Bosch KGN36NWEA',
        required: true
      },
      {
        id: 'serial_number',
        type: 'text',
        label: 'Serienummer (indien zichtbaar)',
        placeholder: 'Staat meestal op typeplaatje',
        required: false
      },
      {
        id: 'info_tag_photo',
        type: 'file',
        label: 'Foto van typeplaatje/informatielabel',
        description: 'Maak een foto van het typeplaatje met merk, model en serienummer',
        required: true,
        accept: 'image/*'
      },
      {
        id: 'appliance_type',
        type: 'radio',
        label: 'Wat voor apparaat is het?',
        required: true,
        options: [
          { value: 'koelkast', label: 'Koelkast' },
          { value: 'vriezer', label: 'Vriezer' },
          { value: 'koelvries_combi', label: 'Koelkast/vriezer combinatie' }
        ]
      },
      {
        id: 'what_not_working',
        type: 'select',
        label: 'Wat werkt er niet?',
        required: true,
        options: [
          { value: 'geen_koeling', label: 'Geen koeling' },
          { value: 'weinig_koeling', label: 'Weinig koeling' },
          { value: 'te_koud', label: 'Te koud' },
          { value: 'geluid', label: 'Vreemd geluid' },
          { value: 'ijsvorming', label: 'Teveel ijsvorming' },
          { value: 'deur_probleem', label: 'Deur probleem' },
          { value: 'start_niet', label: 'Start niet' },
          { value: 'anders', label: 'Anders' }
        ]
      },
      {
        id: 'door_closes_properly',
        type: 'radio',
        label: 'Sluit de deur goed?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'door_seal_intact',
        type: 'radio',
        label: 'Is de deurafdichting intact (geen scheuren/beschadigingen)?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'cleaned_properly',
        type: 'radio',
        label: 'Is het apparaat goed schoongemaakt?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'error_code_fridge',
        type: 'text',
        label: 'Voer de exacte foutcode in (indien zichtbaar)',
        placeholder: 'bijv. E1, F12, E24',
        required: false
      }
    ]
  },
  'issue.v1.appliance.washing_machine.fault': {
    title: 'Wasmachine Defect',
    description: 'Wasmachine werkt niet goed',
    questions: [
      {
        id: 'washing_problem',
        type: 'select',
        label: 'Wat is het probleem?',
        required: true,
        options: [
          { value: 'start_niet', label: 'Start niet' },
          { value: 'lekt', label: 'Lekt' },
          { value: 'centrifugeert_niet', label: 'Centrifugeert niet' },
          { value: 'geluid', label: 'Vreemd geluid' },
          { value: 'deur_gaat_niet_open', label: 'Deur gaat niet open' },
          { value: 'pompt_niet_af', label: 'Pompt niet af' }
        ]
      },
      {
        id: 'error_code_washing',
        type: 'text',
        label: 'Staat er een foutcode op het display?',
        placeholder: 'bijv. E1, F05, geen display',
        required: false
      },
      {
        id: 'water_supply_washing',
        type: 'radio',
        label: 'Komt er water in de machine?',
        required: false,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' },
          { value: 'onbekend', label: 'Onbekend' }
        ]
      }
    ]
  },
  'issue.v1.appliance.dishwasher.fault': {
    title: 'Vaatwasser Defect',
    description: 'Vaatwasser werkt niet goed',
    questions: [
      {
        id: 'built_in',
        type: 'radio',
        label: 'Is dit een inbouwapparaat?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'included_when_renting',
        type: 'radio',
        label: 'Was dit apparaat inbegrepen bij de huur?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' },
          { value: 'onbekend', label: 'Onbekend' }
        ]
      },
      {
        id: 'brand',
        type: 'text',
        label: 'Merk van het apparaat',
        placeholder: 'bijv. Bosch, Siemens, AEG',
        required: true
      },
      {
        id: 'model',
        type: 'text',
        label: 'Model van het apparaat',
        placeholder: 'bijv. SMS46GW01E',
        required: true
      },
      {
        id: 'serial_number',
        type: 'text',
        label: 'Serienummer (optioneel)',
        placeholder: 'Te vinden op typeplaatje',
        required: false
      },
      {
        id: 'photo_info_tag',
        type: 'checkbox',
        label: 'Ik ga een foto uploaden van het typeplaatje/informatielabel',
        required: true,
        variant: 'boolean'
      },
      {
        id: 'dishwasher_problem',
        type: 'select',
        label: 'Wat werkt er niet?',
        required: true,
        options: [
          { value: 'start_niet', label: 'Start niet' },
          { value: 'lekt', label: 'Lekt' },
          { value: 'wordt_niet_schoon', label: 'Vaat wordt niet schoon' },
          { value: 'deur_gaat_niet_open', label: 'Deur gaat niet open' },
          { value: 'geluid', label: 'Vreemd geluid' },
          { value: 'pompt_niet_af', label: 'Pompt niet af' }
        ]
      },
      {
        id: 'door_closes_properly',
        type: 'radio',
        label: 'Sluit de deur goed?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'door_seal_check',
        type: 'radio',
        label: 'Is de deurafdichting intact (geen scheuren/beschadigingen)?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'cleaned_properly',
        type: 'radio',
        label: 'Is het apparaat goed schoongemaakt?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'salt_rinse_aid',
        type: 'radio',
        label: 'Zijn zout en glansspoelmiddel bijgevuld?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' },
          { value: 'onbekend', label: 'Onbekend' }
        ]
      },
      {
        id: 'error_code_dishwasher',
        type: 'text',
        label: 'Voer de exacte foutcode in (indien zichtbaar)',
        placeholder: 'bijv. E1, F12, E15',
        required: false
      },
      {
        id: 'leaking_location',
        type: 'select',
        label: 'Als het lekt, waar precies?',
        required: false,
        options: [
          { value: 'onder_apparaat', label: 'Onder het apparaat' },
          { value: 'rond_deur', label: 'Rond de deur' },
          { value: 'achterkant', label: 'Achterkant' },
          { value: 'niet_van_toepassing', label: 'Niet van toepassing' }
        ]
      }
    ]
  },
  'issue.v1.appliance.dryer.fault': {
    title: 'Droger Defect',
    description: 'Droger werkt niet goed',
    questions: [
      {
        id: 'dryer_problem',
        type: 'select',
        label: 'Wat is het probleem?',
        required: true,
        options: [
          { value: 'start_niet', label: 'Start niet' },
          { value: 'droogt_niet', label: 'Droogt niet' },
          { value: 'deur_gaat_niet_open', label: 'Deur gaat niet open' },
          { value: 'geluid', label: 'Vreemd geluid' },
          { value: 'te_heet', label: 'Wordt te heet' }
        ]
      },
      {
        id: 'lint_filter_clean',
        type: 'radio',
        label: 'Is het pluizenfilter schoon?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'water_reservoir_empty',
        type: 'radio',
        label: 'Is het waterreservoir leeg?',
        required: false,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' },
          { value: 'geen_reservoir', label: 'Geen reservoir' }
        ]
      }
    ]
  },
  // INTERCOM FINAL NODES
  'issue.v1.intercom.audio_fault': {
    title: 'Intercom Geen Geluid',
    description: 'Intercom heeft geen geluid',
    questions: [
      {
        id: 'audio_problem',
        type: 'select',
        label: 'Wat is het geluidsprobleem?',
        required: true,
        options: [
          { value: 'geen_geluid_uitgaand', label: 'Ik hoor niets' },
          { value: 'geen_geluid_inkomend', label: 'Anderen horen mij niet' },
          { value: 'beide', label: 'Beide richtingen' }
        ]
      },
      {
        id: 'intercom_type',
        type: 'select',
        label: 'Wat voor intercom is het?',
        required: true,
        options: [
          { value: 'audio_alleen', label: 'Alleen audio' },
          { value: 'video_intercom', label: 'Video intercom' },
          { value: 'onbekend', label: 'Onbekend' }
        ]
      }
    ]
  },
  'issue.v1.intercom.video_fault': {
    title: 'Intercom Geen Beeld',
    description: 'Video intercom heeft geen beeld',
    questions: [
      {
        id: 'video_problem',
        type: 'select',
        label: 'Wat is het beeldprobleem?',
        required: true,
        options: [
          { value: 'zwart_scherm', label: 'Zwart scherm' },
          { value: 'wazig_beeld', label: 'Wazig beeld' },
          { value: 'geen_beeld_soms', label: 'Soms geen beeld' }
        ]
      },
      {
        id: 'audio_works',
        type: 'radio',
        label: 'Werkt het geluid wel?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      }
    ]
  },
  'issue.v1.intercom.panel_fault': {
    title: 'Bellentableau Defect',
    description: 'Bellentableau/belpaneel werkt niet',
    questions: [
      {
        id: 'panel_problem',
        type: 'select',
        label: 'Wat is het probleem?',
        required: true,
        options: [
          { value: 'geen_verlichting', label: 'Geen verlichting' },
          { value: 'knoppen_reageren_niet', label: 'Knoppen reageren niet' },
          { value: 'display_uit', label: 'Display uit' },
          { value: 'beschadigd', label: 'Zichtbaar beschadigd' }
        ]
      },
      {
        id: 'affected_units',
        type: 'radio',
        label: 'Voor hoeveel woningen werkt het niet?',
        required: true,
        options: [
          { value: 'alleen_mijn_woning', label: 'Alleen mijn woning' },
          { value: 'meerdere_woningen', label: 'Meerdere woningen' },
          { value: 'hele_tableau', label: 'Hele tableau' },
          { value: 'onbekend', label: 'Onbekend' }
        ]
      }
    ]
  },
  // GENERAL CATEGORY - Other issues with room selection
  'issue.general.other': {
    title: 'Overige Problemen',
    description: 'Beschrijf uw probleem en geef aan in welke ruimte het zich voordoet',
    questions: [
      {
        id: 'room_location',
        type: 'select',
        label: 'In welke ruimte bevindt zich het probleem?',
        required: true,
        options: [
          { value: 'woonkamer', label: 'Woonkamer' },
          { value: 'keuken', label: 'Keuken' },
          { value: 'slaapkamer_1', label: 'Slaapkamer 1' },
          { value: 'slaapkamer_2', label: 'Slaapkamer 2' },
          { value: 'slaapkamer_3', label: 'Slaapkamer 3' },
          { value: 'badkamer', label: 'Badkamer' },
          { value: 'toilet', label: 'Toilet' },
          { value: 'hal_gang', label: 'Hal/Gang' },
          { value: 'berging', label: 'Berging' },
          { value: 'balkon_terras', label: 'Balkon/Terras' },
          { value: 'gemeenschappelijke_ruimte', label: 'Gemeenschappelijke ruimte' },
          { value: 'buiten_gebouw', label: 'Buiten het gebouw' },
          { value: 'onbekend', label: 'Onbekend' }
        ]
      },
      {
        id: 'problem_description',
        type: 'textarea',
        label: 'Beschrijf het probleem in detail',
        placeholder: 'Geef een duidelijke beschrijving van wat er aan de hand is...',
        required: true
      },
      {
        id: 'urgency_level',
        type: 'radio',
        label: 'Hoe urgent is dit probleem?',
        required: true,
        options: [
          { value: 'laag', label: 'Laag - kan wachten' },
          { value: 'normaal', label: 'Normaal - binnen een week' },
          { value: 'hoog', label: 'Hoog - zo snel mogelijk' },
          { value: 'spoed', label: 'Spoed - vandaag nog' }
        ]
      }
    ]
  },
  // KLIMAATINSTALLATIES FINAL NODES
  'issue.v1.appliance.aircon.fault': {
    title: 'Airco Defect',
    description: 'Airconditioning werkt niet goed',
    questions: [
      {
        id: 'appliance_built_in',
        type: 'radio',
        label: 'Is het apparaat ingebouwd?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'included_when_renting',
        type: 'radio',
        label: 'Was het apparaat aanwezig bij het huren van de woning?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'brand_model',
        type: 'text',
        label: 'Merk en model',
        placeholder: 'bijv. Daikin FTXM35R',
        required: true
      },
      {
        id: 'serial_number',
        type: 'text',
        label: 'Serienummer (indien zichtbaar)',
        placeholder: 'Staat meestal op typeplaatje',
        required: false
      },
      {
        id: 'info_tag_photo',
        type: 'file',
        label: 'Foto van typeplaatje/informatielabel',
        description: 'Maak een foto van het typeplaatje met merk, model en serienummer',
        required: true,
        accept: 'image/*'
      },
      {
        id: 'what_not_working',
        type: 'select',
        label: 'Wat werkt er niet?',
        required: true,
        options: [
          { value: 'geen_koeling', label: 'Geen koeling' },
          { value: 'weinig_koeling', label: 'Weinig koeling' },
          { value: 'geen_verwarming', label: 'Geen verwarming' },
          { value: 'lawaai', label: 'Maakt lawaai' },
          { value: 'lekt_water', label: 'Lekt water' },
          { value: 'start_niet', label: 'Start niet' },
          { value: 'afstandsbediening', label: 'Afstandsbediening werkt niet' },
          { value: 'anders', label: 'Anders' }
        ]
      },
      {
        id: 'cleaned_properly',
        type: 'radio',
        label: 'Is het apparaat goed schoongemaakt (filters, unit)?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'error_code_aircon',
        type: 'text',
        label: 'Voer de exacte foutcode in (indien zichtbaar)',
        placeholder: 'bijv. E1, F03, H11',
        required: false
      }
    ]
  },
  'issue.v1.ventilation.unit_failure': {
    title: 'Mechanische Ventilatie-unit Defect',
    description: 'Mechanische ventilatie/WTW-unit werkt niet goed',
    questions: [
      {
        id: 'appliance_built_in',
        type: 'radio',
        label: 'Is het apparaat ingebouwd?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'included_when_renting',
        type: 'radio',
        label: 'Was het apparaat aanwezig bij het huren van de woning?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'brand_model',
        type: 'text',
        label: 'Merk en model',
        placeholder: 'bijv. Brink Renovent Sky 300',
        required: true
      },
      {
        id: 'serial_number',
        type: 'text',
        label: 'Serienummer (indien zichtbaar)',
        placeholder: 'Staat meestal op typeplaatje',
        required: false
      },
      {
        id: 'info_tag_photo',
        type: 'file',
        label: 'Foto van typeplaatje/informatielabel',
        description: 'Maak een foto van het typeplaatje met merk, model en serienummer',
        required: true,
        accept: 'image/*'
      },
      {
        id: 'what_not_working',
        type: 'select',
        label: 'Wat werkt er niet?',
        required: true,
        options: [
          { value: 'geen_ventilatie', label: 'Geen ventilatie' },
          { value: 'weinig_ventilatie', label: 'Weinig ventilatie' },
          { value: 'lawaai', label: 'Maakt lawaai' },
          { value: 'trillingen', label: 'Trillingen' },
          { value: 'start_niet', label: 'Start niet' },
          { value: 'warmteterugwinning', label: 'Warmteterugwinning werkt niet' },
          { value: 'bedieningspaneel', label: 'Bedieningspaneel werkt niet' },
          { value: 'anders', label: 'Anders' }
        ]
      },
      {
        id: 'cleaned_properly',
        type: 'radio',
        label: 'Zijn de filters goed schoongemaakt/vervangen?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' },
          { value: 'onbekend', label: 'Onbekend' }
        ]
      },
      {
        id: 'error_code_ventilation',
        type: 'text',
        label: 'Voer de exacte foutcode in (indien zichtbaar)',
        placeholder: 'bijv. E1, F12, AL01',
        required: false
      }
    ]
  },
  // VENTILATIE, SCHIMMEL & ONGEDIERTE FINAL NODES
  'issue.v1.pest.insects': {
    title: 'Insecten (mieren, kakkerlakken, wespen)',
    description: 'Insecten overlast in de woning',
    questions: [
      {
        id: 'insect_type',
        type: 'select',
        label: 'Wat voor insecten zijn het?',
        required: true,
        options: [
          { value: 'wespen', label: 'Wespen' },
          { value: 'mieren', label: 'Mieren' },
          { value: 'kakkerlakken', label: 'Kakkerlakken' },
          { value: 'zilvervisjes', label: 'Zilvervisjes' },
          { value: 'anders', label: 'Anders' }
        ]
      },
      {
        id: 'is_wasp_nest',
        type: 'radio',
        label: 'Is het een wespennest?',
        required: false,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' },
          { value: 'onbekend', label: 'Onbekend' },
          { value: 'niet_van_toepassing', label: 'Niet van toepassing (geen wespen)' }
        ]
      },
      {
        id: 'wasp_nest_location',
        type: 'select',
        label: 'Waar bevindt het wespennest zich?',
        required: false,
        options: [
          { value: 'dak_dakrand', label: 'Dak/dakrand' },
          { value: 'gevel_muur', label: 'Gevel/muur' },
          { value: 'balkon_terras', label: 'Balkon/terras' },
          { value: 'tuin_schuur', label: 'Tuin/schuur' },
          { value: 'binnen_woning', label: 'Binnen de woning' },
          { value: 'onbekend', label: 'Onbekend' },
          { value: 'niet_van_toepassing', label: 'Niet van toepassing' }
        ]
      },
      {
        id: 'wasp_nest_photo',
        type: 'file',
        label: 'Foto van het wespennest/locatie',
        description: 'Maak een foto van het wespennest en de locatie waar het zich bevindt',
        required: false,
        accept: 'image/*'
      },
      {
        id: 'insect_location_general',
        type: 'text',
        label: 'Waar ziet u de insecten? (algemeen)',
        placeholder: 'bijv. keuken, badkamer, woonkamer',
        required: true
      }
    ]
  },
  'issue.v1.pest.birds': {
    title: 'Duiven of vogels',
    description: 'LET OP: Helaas is het ons vanwege de Wet natuurbescherming niet toegestaan duivennesten te verwijderen.',
    questions: []
  },
  'issue.v1.ventilation.noisy': {
    title: 'Ventilatie Maakt Lawaai',
    description: 'Ventilatie systeem maakt geluid',
    questions: [
      {
        id: 'ventilation_type',
        type: 'select',
        label: 'Wat voor type ventilatie is het?',
        required: true,
        options: [
          { value: 'mechanische_ventilatie', label: 'Mechanische ventilatie (WTW-unit)' },
          { value: 'afzuigkap_recirculatie', label: 'Afzuigkap (recirculatie)' },
          { value: 'afzuigkap_afvoer', label: 'Afzuigkap (naar buiten)' },
          { value: 'natuurlijke_ventilatie', label: 'Natuurlijke ventilatie' },
          { value: 'geen_ventilatie', label: 'Geen ventilatie aanwezig' },
          { value: 'onbekend', label: 'Onbekend' }
        ]
      },
      {
        id: 'filter_cleaned',
        type: 'radio',
        label: 'Heeft u de filter schoongemaakt?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' },
          { value: 'geen_filter', label: 'Geen filter aanwezig' }
        ]
      },
      {
        id: 'suction_test_done',
        type: 'radio',
        label: 'Zuigkracht test: Houdt een vel toiletpapier tegen de ventilatierooster. Wordt het vastgezogen?',
        required: true,
        options: [
          { value: 'ja_goed_vastgezogen', label: 'Ja, wordt goed vastgezogen' },
          { value: 'weinig_zuigkracht', label: 'Weinig zuigkracht' },
          { value: 'geen_zuigkracht', label: 'Geen zuigkracht' }
        ]
      },
      {
        id: 'cleaning_responsibility_acknowledged',
        type: 'checkbox',
        label: 'Ik begrijp dat het schoonmaken van filters mijn verantwoordelijkheid als huurder is',
        required: false,
        variant: 'boolean'
      },
      {
        id: 'noise_description',
        type: 'textarea',
        label: 'Beschrijf het geluid',
        placeholder: 'bijv. bromgeluid, piepend, ratelend, alleen bij hoge stand',
        required: true
      }
    ]
  },
  'issue.v1.indoor_air.mould_or_damp': {
    title: 'Schimmel of Vochtplekken',
    description: 'Schimmel of vocht in de woning',
    questions: [
      {
        id: 'problem_type',
        type: 'select',
        label: 'Wat is het probleem?',
        required: true,
        options: [
          { value: 'schimmel', label: 'Schimmel' },
          { value: 'vochtplekken', label: 'Vochtplekken' },
          { value: 'condens', label: 'Condens op ramen/muren' },
          { value: 'muffe_geur', label: 'Muffe geur' },
          { value: 'combinatie', label: 'Combinatie van bovenstaande' }
        ]
      },
      {
        id: 'location',
        type: 'checkbox',
        label: 'Waar ziet u het probleem?',
        required: true,
        variant: 'multi',
        options: [
          { value: 'badkamer', label: 'Badkamer' },
          { value: 'keuken', label: 'Keuken' },
          { value: 'slaapkamer', label: 'Slaapkamer' },
          { value: 'woonkamer', label: 'Woonkamer' },
          { value: 'kelder', label: 'Kelder' },
          { value: 'zolder', label: 'Zolder' },
          { value: 'anders', label: 'Anders' }
        ]
      },
      {
        id: 'ventilation_behavior',
        type: 'radio',
        label: 'Ventileert u regelmatig (ramen open, afzuigkap aan tijdens koken/douchen)?',
        required: true,
        options: [
          { value: 'ja_altijd', label: 'Ja, altijd' },
          { value: 'soms', label: 'Soms' },
          { value: 'zelden', label: 'Zelden' },
          { value: 'nee_nooit', label: 'Nee, nooit' }
        ]
      }
    ]
  },
  
  // DEUREN, SLOTEN & TOEGANG FINAL NODES
  'issue.v1.access.front_door.fault': {
    title: 'Voordeur Probleem',
    description: 'Problemen met de voordeur van het gebouw',
    questions: [
      {
        id: 'key_goes_in_out',
        type: 'radio',
        label: 'Gaat de sleutel erin en eruit?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'key_turns',
        type: 'radio',
        label: 'Draait de sleutel?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'door_closes_properly',
        type: 'radio',
        label: 'Valt de deur goed in het slot?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'is_electronic',
        type: 'radio',
        label: 'Is het een elektronisch slot?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'closing_well',
        type: 'radio',
        label: 'Sluit de deur goed?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      }
    ]
  },
  'issue.v1.access.residence_door.fault': {
    title: 'Woningdeur Probleem',
    description: 'Problemen met de deur van uw woning',
    questions: [
      {
        id: 'key_goes_in_out',
        type: 'radio',
        label: 'Gaat de sleutel erin en eruit?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'key_turns',
        type: 'radio',
        label: 'Draait de sleutel?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'door_closes_properly',
        type: 'radio',
        label: 'Valt de deur goed in het slot?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'is_electronic',
        type: 'radio',
        label: 'Is het een elektronisch slot?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'closing_well',
        type: 'radio',
        label: 'Sluit de deur goed?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      }
    ]
  },

  // RAMEN & KOZIJNEN FINAL NODES
  'issue.v1.windows.leak': {
    title: 'Raam Lekkage',
    description: 'Raam lekt of heeft problemen',
    questions: [
      {
        id: 'room_location',
        type: 'select',
        label: 'In welke kamer bevindt het raam zich?',
        required: true,
        options: [
          { value: 'woonkamer', label: 'Woonkamer' },
          { value: 'keuken', label: 'Keuken' },
          { value: 'slaapkamer', label: 'Slaapkamer' },
          { value: 'badkamer', label: 'Badkamer' },
          { value: 'hal', label: 'Hal' },
          { value: 'zolder', label: 'Zolder' },
          { value: 'kelder', label: 'Kelder' },
          { value: 'anders', label: 'Anders' }
        ]
      },
      {
        id: 'gutter_full_of_dirt',
        type: 'radio',
        label: 'LET OP: Indien er een goot aanwezig is onder het raam is het belangrijk deze eerst schoon te maken. Ga alleen door als u dit geprobeerd heeft.',
        required: true,
        options: [
          { value: 'kan_niet_schoonmaken', label: 'Het lukt mij niet deze schoon te maken.' },
          { value: 'schoon_maar_lekt_nog', label: 'De goot is schoon maar het lekt nog altijd.' }
        ]
      }
    ]
  },

  // DAK OF GEVEL FINAL NODES
  'issue.v1.roof.pigeon_nest': {
    title: 'Duivennest',
    description: 'Duiven hebben een nest gemaakt',
    questions: [
      {
        id: 'pigeon_nest_acknowledgment',
        type: 'checkbox',
        label: 'Ik begrijp dat we hier helaas niets aan kunnen doen',
        required: true
      },
      {
        id: 'nest_location',
        type: 'text',
        label: 'Waar bevindt het nest zich precies?',
        placeholder: 'bijv. dakrand, schoorsteen, balkon',
        required: false
      }
    ]
  },

  // VENTILATIE, SCHIMMEL & ONGEDIERTE FINAL NODES  
  'issue.v1.pest.wasps': {
    title: 'Wespen',
    description: 'Wespen overlast',
    questions: [
      {
        id: 'is_wasp_nest',
        type: 'radio',
        label: 'Is het een wespennest?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' },
          { value: 'onbekend', label: 'Onbekend' }
        ]
      },
      {
        id: 'wasp_nest_location',
        type: 'select',
        label: 'Waar bevindt het wespennest zich?',
        required: false,
        options: [
          { value: 'dak_dakrand', label: 'Dak/dakrand' },
          { value: 'gevel_muur', label: 'Gevel/muur' },
          { value: 'balkon_terras', label: 'Balkon/terras' },
          { value: 'tuin_schuur', label: 'Tuin/schuur' },
          { value: 'binnen_woning', label: 'Binnen de woning' },
          { value: 'onbekend', label: 'Onbekend' }
        ]
      },
      {
        id: 'wasp_nest_photo',
        type: 'file',
        label: 'Foto van het wespennest/locatie',
        description: 'Maak een foto van het wespennest en de locatie waar het zich bevindt',
        required: false,
        accept: 'image/*'
      }
    ]
  },

  // APPARATEN FINAL NODES WITH MANDATORY QUESTIONS
  'issue.v1.appliance.oven_or_cooker.fault': {
    title: 'Oven Defect',
    description: 'Oven werkt niet goed',
    questions: [
      {
        id: 'appliance_built_in',
        type: 'radio',
        label: 'Is het apparaat ingebouwd?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'included_when_renting',
        type: 'radio',
        label: 'Was het apparaat aanwezig bij het huren van de woning?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'brand_model',
        type: 'text',
        label: 'Merk en model',
        placeholder: 'bijv. Siemens HB634GBS1',
        required: true
      },
      {
        id: 'serial_number',
        type: 'text',
        label: 'Serienummer (indien zichtbaar)',
        placeholder: 'Staat meestal op typeplaatje',
        required: false
      },
      {
        id: 'info_tag_photo',
        type: 'file',
        label: 'Foto van typeplaatje/informatielabel',
        description: 'Maak een foto van het typeplaatje met merk, model en serienummer',
        required: true,
        accept: 'image/*'
      },
      {
        id: 'oven_light_works',
        type: 'radio',
        label: 'Werkt het ovenlicht?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'door_closes_properly',
        type: 'radio',
        label: 'Sluit de ovendeur goed?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'electricity_available',
        type: 'radio',
        label: 'Is er stroom beschikbaar? (andere apparaten werken wel)',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'cleaned_properly',
        type: 'radio',
        label: 'Is de oven goed schoongemaakt?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'error_code',
        type: 'text',
        label: 'Voer de exacte foutcode in (indien zichtbaar)',
        placeholder: 'bijv. E115, F47, C79',
        required: false
      }
    ]
  },
  'issue.v1.appliance.hob_or_hood.fault': {
    title: 'Kookplaat/Afzuigkap Defect',
    description: 'Kookplaat of afzuigkap werkt niet goed',
    questions: [
      {
        id: 'appliance_type',
        type: 'radio',
        label: 'Welk apparaat heeft een probleem?',
        required: true,
        options: [
          { value: 'kookplaat', label: 'Kookplaat' },
          { value: 'afzuigkap', label: 'Afzuigkap' },
          { value: 'beide', label: 'Beide' }
        ]
      },
      {
        id: 'appliance_built_in',
        type: 'radio',
        label: 'Is het apparaat ingebouwd?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'included_when_renting',
        type: 'radio',
        label: 'Was het apparaat aanwezig bij het huren van de woning?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'brand_model',
        type: 'text',
        label: 'Merk en model',
        placeholder: 'bijv. Bosch PIE611BB1E',
        required: true
      },
      {
        id: 'serial_number',
        type: 'text',
        label: 'Serienummer (indien zichtbaar)',
        placeholder: 'Staat meestal op typeplaatje',
        required: false
      },
      {
        id: 'info_tag_photo',
        type: 'file',
        label: 'Foto van typeplaatje/informatielabel',
        description: 'Maak een foto van het typeplaatje met merk, model en serienummer',
        required: true,
        accept: 'image/*'
      },
      {
        id: 'hob_type',
        type: 'select',
        label: 'Wat voor kookplaat is het?',
        required: false,
        options: [
          { value: 'inductie', label: 'Inductie' },
          { value: 'keramisch', label: 'Keramisch' },
          { value: 'gas', label: 'Gas' },
          { value: 'elektrisch', label: 'Elektrisch' },
          { value: 'niet_van_toepassing', label: 'Niet van toepassing (alleen afzuigkap)' }
        ]
      },
      {
        id: 'electricity_works',
        type: 'radio',
        label: 'Werkt de elektriciteit? (andere apparaten in keuken werken wel)',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'hob_problem_scope',
        type: 'radio',
        label: 'Als het een kookplaat probleem is: werkt geen enkele pit of alleen bepaalde pitten niet?',
        required: false,
        options: [
          { value: 'alle_pitten', label: 'Geen enkele pit werkt' },
          { value: 'enkele_pitten', label: 'Alleen bepaalde pitten werken niet' },
          { value: 'niet_van_toepassing', label: 'Niet van toepassing' }
        ]
      },
      {
        id: 'gas_ignition_ticking',
        type: 'radio',
        label: 'Bij gas: hoort u het tik-geluid van de ontsteking?',
        required: false,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' },
          { value: 'niet_van_toepassing', label: 'Niet van toepassing (geen gas)' }
        ]
      },
      {
        id: 'gas_smell',
        type: 'radio',
        label: 'Ruikt u gas?',
        required: false,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' },
          { value: 'niet_van_toepassing', label: 'Niet van toepassing (geen gas)' }
        ]
      },
      {
        id: 'cleaned_dried_properly',
        type: 'radio',
        label: 'Is het apparaat goed schoongemaakt en gedroogd?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'hood_problem',
        type: 'select',
        label: 'Als het een afzuigkap probleem is: wat is het probleem?',
        required: false,
        options: [
          { value: 'geen_zuigkracht', label: 'Geen zuigkracht' },
          { value: 'weinig_zuigkracht', label: 'Weinig zuigkracht' },
          { value: 'lawaai', label: 'Maakt lawaai' },
          { value: 'verlichting_uit', label: 'Verlichting uit' },
          { value: 'niet_van_toepassing', label: 'Niet van toepassing (alleen kookplaat)' }
        ]
      },
      {
        id: 'filter_clean',
        type: 'radio',
        label: 'Is het afzuigkap filter schoon?',
        required: false,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' },
          { value: 'onbekend', label: 'Onbekend' },
          { value: 'niet_van_toepassing', label: 'Niet van toepassing (alleen kookplaat)' }
        ]
      },
      {
        id: 'suction_test_done',
        type: 'radio',
        label: 'Zuigkracht test: Houdt een vel toiletpapier tegen de afzuigkap. Wordt het vastgezogen?',
        required: false,
        options: [
          { value: 'ja_goed_vastgezogen', label: 'Ja, wordt goed vastgezogen' },
          { value: 'weinig_zuigkracht', label: 'Weinig zuigkracht' },
          { value: 'geen_zuigkracht', label: 'Geen zuigkracht' },
          { value: 'niet_van_toepassing', label: 'Niet van toepassing (alleen kookplaat)' }
        ]
      },
      {
        id: 'error_code_hob_hood',
        type: 'text',
        label: 'Voer de exacte foutcode in (indien zichtbaar)',
        placeholder: 'bijv. E1, F12, E9',
        required: false
      }
    ]
  },

  // WASBAK LEKKAGE NODE (COMBINED)
  'issue.v1.leakage.sink.combined': {
    title: 'Wasbak Lekkage',
    description: 'Lekkage bij wasbak',
    questions: [
      {
        id: 'sink_location',
        type: 'radio',
        label: 'Waar zit de wasbak?',
        required: true,
        options: [
          { value: 'badkamer', label: 'Badkamer' },
          { value: 'toilet', label: 'Toilet' },
          { value: 'keuken', label: 'Keuken' },
          { value: 'anders', label: 'Anders' }
        ]
      },
      {
        id: 'location_specify',
        type: 'text',
        label: 'Anders? Namelijk...',
        placeholder: 'bijv. bijkeuken, berging, garage',
        required: false
      },
      {
        id: 'siphon_cleaned',
        type: 'radio',
        label: 'Is de sifon schoongemaakt?',
        required: true,
        options: [
          { value: 'nee_maak_schoon', label: 'NEE → maak schoon' },
          { value: 'ja_schoon', label: 'Ja, is schoon' }
        ]
      },
      {
        id: 'still_leaking_after_clean',
        type: 'radio',
        label: 'Heeft u nog steeds last van lekkage?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'connections_tight',
        type: 'radio',
        label: 'Zijn de sluitingen goed aangedraaid?',
        required: true,
        options: [
          { value: 'nee_draai_aan', label: 'Nee → draai aan' },
          { value: 'ja_goed_vast', label: 'Ja, goed vastgedraaid' }
        ]
      },
      {
        id: 'still_leaking_after_tighten',
        type: 'radio',
        label: 'Heeft u nog steeds last van lekkage?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'photo_instructions',
        type: 'info',
        label: 'Maak een foto van de hele situatie.\nMaak een foto waar het water vandaan komt.',
        required: false
      }
    ]
  },

  // TOILET LEKKAGE NODE (COMBINED)
  'issue.v1.leakage.toilet.combined': {
    title: 'Toilet Lekkage',
    description: 'Lekkage bij toilet',
    questions: [
      {
        id: 'toilet_issue_type',
        type: 'radio',
        label: 'Wat is het probleem met het toilet?',
        required: true,
        options: [
          { value: 'kitwerk', label: 'Er komt water uit het kitwerk' },
          { value: 'stortbak', label: 'De stortbak lekt' },
          { value: 'afvoer', label: 'Afvoer van het toilet' },
          { value: 'loopt_door', label: 'Toilet loopt door' }
        ]
      },
      {
        id: 'rubber_connection',
        type: 'radio',
        label: 'Is de aansluiting van rubber (valpijpsok)?',
        description: 'Alleen beantwoorden als u "Afvoer van het toilet" heeft geselecteerd',
        required: false,
        options: [
          { value: 'ja_huurder_rekening', label: 'JA → rekening huurder' },
          { value: 'nee_verder_melding', label: 'Nee → verder melding' }
        ]
      },
      {
        id: 'cleaning_instructions',
        type: 'info',
        label: 'Uitleg reinigen stortbak en schoonmaken/vervangen vlotter.',
        description: 'Deze instructies zijn relevant als het toilet doorloopt',
        required: false
      },
      {
        id: 'photo_instructions',
        type: 'info',
        label: 'Maak een foto waar het water vandaan komt.',
        required: false
      }
    ]
  },

  // BADKAMER/DOUCHE LEKKAGE NODE (COMBINED)
  'issue.v1.leakage.shower.combined': {
    title: 'Badkamer/Douche Lekkage',
    description: 'Lekkage in badkamer/douche',
    questions: [
      {
        id: 'shower_issue_type',
        type: 'radio',
        label: 'Wat is het probleem in de badkamer/douche?',
        required: true,
        options: [
          { value: 'douche_kraan', label: 'Douche kraan' },
          { value: 'douche_kop', label: 'Douche kop' }
        ]
      },
      {
        id: 'tap_type',
        type: 'radio',
        label: 'Meng kraan of Thermostatische kraan?',
        description: 'Alleen beantwoorden als u "Douche kraan" heeft geselecteerd',
        required: false,
        options: [
          { value: 'mengkraan', label: 'Mengkraan' },
          { value: 'thermostatisch', label: 'Thermostatische kraan' }
        ]
      },
      {
        id: 'photo_instructions',
        type: 'info',
        label: 'Maak een foto waar het water vandaan komt.',
        required: false
      }
    ]
  },

  // APPARAAT LEKKAGE NODE (COMBINED)
  'issue.v1.leakage.appliance.combined': {
    title: 'Apparaat Lekkage',
    description: 'Lekkage bij apparaat',
    questions: [
      {
        id: 'appliance_type',
        type: 'radio',
        label: 'Soort apparaat?',
        required: true,
        options: [
          { value: 'wasmachine', label: 'Wasmachine' },
          { value: 'vaatwasser', label: 'Vaatwasser' },
          { value: 'anders', label: 'Anders' }
        ]
      },
      {
        id: 'appliance_other_specify',
        type: 'text',
        label: 'Anders? Namelijk...',
        placeholder: 'bijv. droger, boiler, andere',
        required: false
      },
      {
        id: 'brand_model',
        type: 'text',
        label: 'Merk en model (evt. via foto van label)',
        placeholder: 'bijv. Bosch WAT28400NL, Siemens SN236I00ME',
        required: true
      },
      {
        id: 'appliance_message',
        type: 'textarea',
        label: 'Melding van apparaat zelf (maak foto)',
        placeholder: 'Beschrijf eventuele foutmeldingen of codes',
        required: false
      },
      {
        id: 'photo_instructions',
        type: 'info',
        label: 'Maak een foto waar het water vandaan komt.',
        required: false
      }
    ]
  },

  // KEUKENAFVOER LEKKAGE NODE (COMBINED)
  'issue.v1.leakage.kitchen_drain.combined': {
    title: 'Keukenafvoer Lekkage',
    description: 'Lekkage bij keukenafvoer',
    questions: [
      {
        id: 'siphon_cleaned',
        type: 'radio',
        label: 'Is de sifon schoongemaakt?',
        required: true,
        options: [
          { value: 'nee_maak_schoon', label: 'NEE → maak schoon' },
          { value: 'ja_schoon', label: 'Ja, is schoon' }
        ]
      },
      {
        id: 'still_leaking_after_clean',
        type: 'radio',
        label: 'Heeft u nog steeds last van lekkage?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'connections_tight',
        type: 'radio',
        label: 'Zijn de sluitingen goed aangedraaid?',
        required: true,
        options: [
          { value: 'nee_draai_aan', label: 'Nee → draai aan' },
          { value: 'ja_goed_vast', label: 'Ja, goed vastgedraaid' }
        ]
      },
      {
        id: 'still_leaking_after_tighten',
        type: 'radio',
        label: 'Heeft u nog steeds last van lekkage?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'photo_instructions',
        type: 'info',
        label: 'Maak een foto van de hele situatie.\nMaak een foto waar het water vandaan komt.',
        required: false
      }
    ]
  },

  // KRANEN LEKKAGE NODE (COMBINED)
  'issue.v1.leakage.tap.combined': {
    title: 'Kranen Lekkage',
    description: 'Lekkage bij kranen',
    questions: [
      {
        id: 'tap_descaled',
        type: 'radio',
        label: 'Is de kraan ontkalkt?',
        required: true,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' }
        ]
      },
      {
        id: 'problem_description',
        type: 'textarea',
        label: 'Beschrijf het probleem met de kraan',
        placeholder: 'Beschrijf waar de kraan lekt, hoe erg het is, en eventuele andere details...',
        required: false
      },
      {
        id: 'problem_explanation',
        type: 'info',
        label: 'Uitleg probleem',
        description: 'Kalk kan ervoor zorgen dat kranen gaan lekken. Regelmatig ontkalken helpt dit te voorkomen.',
        required: false
      },
      {
        id: 'photo_instructions',
        type: 'info',
        label: 'Maak een foto van de hele situatie.',
        required: false
      }
    ]
  },

  // APPARATEN LEKKAGE NODE (COMBINED) - wasmachine, vaatwasser
  'issue.v1.leakage.appliances.combined': {
    title: 'Apparaten Lekkage (wasmachine, vaatwasser)',
    description: 'Lekkage bij wasmachine of vaatwasser',
    questions: [
      {
        id: 'appliance_type',
        type: 'radio',
        label: 'Welk apparaat lekt?',
        required: true,
        options: [
          { value: 'wasmachine', label: 'Wasmachine' },
          { value: 'vaatwasser', label: 'Vaatwasser' }
        ]
      },
      {
        id: 'leak_timing',
        type: 'radio',
        label: 'Lekt het altijd of alleen bij het gebruiken?',
        required: true,
        options: [
          { value: 'altijd', label: 'Altijd' },
          { value: 'alleen_bij_gebruik', label: 'Alleen bij het gebruiken' }
        ]
      },
      {
        id: 'problem_description',
        type: 'textarea',
        label: 'Beschrijf het probleem met het apparaat',
        placeholder: 'Beschrijf waar het apparaat lekt, hoe erg het is, eventuele foutmeldingen, en andere details...',
        required: false
      },
      {
        id: 'photo_instructions',
        type: 'info',
        label: '1. Merk en model van het apparaat (via foto of text).\n2. Maak een foto van de hele wasmachine/vaatwasser.\n3. Maak een foto waar het water vandaan komt.',
        required: false
      }
    ]
  },
};
