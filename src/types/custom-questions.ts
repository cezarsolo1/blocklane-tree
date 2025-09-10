export interface CustomQuestion {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[]; // for select/radio/checkbox
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  defaultValue?: string;
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
        required: false
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
        required: true
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
        required: true
      }
    ]
  },
  'issue.v1.electrical.smoke_alarm.chirping': {
    title: 'Rookmelder Piept',
    description: 'Rookmelder piept of batterijmelding',
    questions: [
      {
        id: 'chirp_pattern',
        type: 'select',
        label: 'Hoe piept de rookmelder?',
        required: true,
        options: [
          { value: 'enkele_piep_minuut', label: 'Enkele piep per minuut' },
          { value: 'twee_piepjes', label: 'Twee piepjes achter elkaar' },
          { value: 'continue_piepen', label: 'Continue piepen' },
          { value: 'onregelmatig', label: 'Onregelmatig piepen' }
        ]
      },
      {
        id: 'battery_indicator',
        type: 'checkbox',
        label: 'Ziet u een batterij-indicator?',
        required: false
      },
      {
        id: 'tried_battery_replacement',
        type: 'radio',
        label: 'Heeft u de batterij vervangen?',
        required: false,
        options: [
          { value: 'ja_hielp', label: 'Ja, dat hielp' },
          { value: 'ja_hielp_niet', label: 'Ja, maar hielp niet' },
          { value: 'nee_geen_batterij', label: 'Nee, geen batterij beschikbaar' },
          { value: 'nee_kan_er_niet_bij', label: 'Nee, kan er niet bij' }
        ]
      }
    ]
  },
  'issue.v1.electrical.smoke_alarm.false_alarm': {
    title: 'Rookmelder Vals Alarm',
    description: 'Rookmelder gaat onterecht af',
    questions: [
      {
        id: 'alarm_trigger',
        type: 'select',
        label: 'Wanneer gaat de rookmelder af?',
        required: true,
        options: [
          { value: 'bij_koken', label: 'Bij koken' },
          { value: 'bij_douchen', label: 'Bij douchen' },
          { value: 'bij_stofzuigen', label: 'Bij stofzuigen' },
          { value: 'willekeurig', label: 'Willekeurig' },
          { value: 'bij_wind', label: 'Bij wind/tocht' }
        ]
      },
      {
        id: 'alarm_location',
        type: 'select',
        label: 'Waar hangt de rookmelder?',
        required: true,
        options: [
          { value: 'keuken', label: 'Keuken' },
          { value: 'gang', label: 'Gang' },
          { value: 'slaapkamer', label: 'Slaapkamer' },
          { value: 'woonkamer', label: 'Woonkamer' },
          { value: 'badkamer', label: 'Badkamer' }
        ]
      },
      {
        id: 'smoke_visible',
        type: 'radio',
        label: 'Ziet u rook of stoom?',
        required: true,
        options: [
          { value: 'ja_rook', label: 'Ja, rook' },
          { value: 'ja_stoom', label: 'Ja, stoom' },
          { value: 'nee_niets', label: 'Nee, niets zichtbaar' }
        ]
      }
    ]
  },
  'issue.v1.electrical.smoke_alarm.not_working': {
    title: 'Rookmelder Werkt Niet',
    description: 'Rookmelder doet het niet',
    questions: [
      {
        id: 'not_working_symptom',
        type: 'select',
        label: 'Wat is het probleem?',
        required: true,
        options: [
          { value: 'geen_lampje', label: 'Geen lampje/indicator' },
          { value: 'test_knop_werkt_niet', label: 'Test knop werkt niet' },
          { value: 'reageert_niet_op_rook', label: 'Reageert niet op rook' },
          { value: 'helemaal_dood', label: 'Helemaal dood' }
        ]
      },
      {
        id: 'tried_battery',
        type: 'radio',
        label: 'Heeft u nieuwe batterij geprobeerd?',
        required: false,
        options: [
          { value: 'ja_hielp', label: 'Ja, dat hielp' },
          { value: 'ja_hielp_niet', label: 'Ja, maar hielp niet' },
          { value: 'nee_nog_niet', label: 'Nee, nog niet geprobeerd' }
        ]
      },
      {
        id: 'smoke_alarm_age',
        type: 'text',
        label: 'Hoe oud is de rookmelder ongeveer?',
        placeholder: 'bijv. 2 jaar, 10 jaar, onbekend',
        required: false
      }
    ]
  },
  'issue.v1.intercom.audio_fault': {
    title: 'Intercom Geluid Probleem',
    description: 'Geen geluid bij intercom',
    questions: [
      {
        id: 'audio_problem',
        type: 'select',
        label: 'Wat is het geluidsprobleem?',
        required: true,
        options: [
          { value: 'geen_geluid_ontvangen', label: 'Geen geluid ontvangen' },
          { value: 'geen_geluid_verzenden', label: 'Kan niet spreken' },
          { value: 'beide_richtingen', label: 'Beide richtingen' },
          { value: 'vervormd_geluid', label: 'Vervormd geluid' },
          { value: 'te_zacht', label: 'Te zacht' }
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
      },
      {
        id: 'door_opener_working',
        type: 'radio',
        label: 'Werkt de deuropener nog?',
        required: false,
        options: [
          { value: 'ja', label: 'Ja' },
          { value: 'nee', label: 'Nee' },
          { value: 'niet_getest', label: 'Niet getest' }
        ]
      }
    ]
  },
  'issue.v1.intercom.video_fault': {
    title: 'Intercom Beeld Probleem',
    description: 'Geen beeld bij video intercom',
    questions: [
      {
        id: 'video_problem',
        type: 'select',
        label: 'Wat is het beeldprobleem?',
        required: true,
        options: [
          { value: 'geen_beeld', label: 'Helemaal geen beeld' },
          { value: 'zwart_scherm', label: 'Zwart scherm' },
          { value: 'vervormd_beeld', label: 'Vervormd beeld' },
          { value: 'wazig_beeld', label: 'Wazig beeld' },
          { value: 'beeld_valt_weg', label: 'Beeld valt weg' }
        ]
      },
      {
        id: 'screen_power',
        type: 'radio',
        label: 'Gaat het scherm aan?',
        required: true,
        options: [
          { value: 'ja_maar_geen_beeld', label: 'Ja, maar geen beeld' },
          { value: 'nee_blijft_uit', label: 'Nee, blijft uit' },
          { value: 'knippert', label: 'Knippert aan/uit' }
        ]
      },
      {
        id: 'audio_working',
        type: 'checkbox',
        label: 'Werkt het geluid nog wel?',
        required: false
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
      },
      {
        id: 'access_impact',
        type: 'checkbox',
        label: 'Kunt u bezoekers nog binnenlaten?',
        required: false
      }
    ]
  }
};

// Configuration for different ticket types
export const CUSTOM_QUESTIONS_CONFIG: CustomQuestionsConfig = {
  'issue.v1.heating.radiator.leak': {
    title: 'Lekkage Details',
    description: 'Help ons de lekkage situatie beter te begrijpen',
    questions: [
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
        id: 'water_damage',
        type: 'checkbox',
        label: 'Is er zichtbare waterschade?',
        required: false
      },
      {
        id: 'leak_duration',
        type: 'text',
        label: 'Hoe lang lekt dit al?',
        placeholder: 'bijv. 2 uur, 1 dag, 1 week',
        required: false
      }
    ]
  },
  'issue.v1.heating.no_heat': {
    title: 'Verwarming Details',
    description: 'Vertel ons over uw verwarmingsprobleem',
    questions: [
      {
        id: 'temperature_issue',
        type: 'radio',
        label: 'Wat is het temperatuurprobleem?',
        required: true,
        options: [
          { value: 'geen_warmte', label: 'Helemaal geen warmte' },
          { value: 'niet_warm_genoeg', label: 'Niet warm genoeg' },
          { value: 'te_heet', label: 'Te heet' },
          { value: 'ongelijke_verwarming', label: 'Ongelijke verwarming' }
        ]
      },
      {
        id: 'affected_rooms',
        type: 'textarea',
        label: 'Welke kamers zijn getroffen?',
        placeholder: 'Lijst de kamers met verwarmingsproblemen',
        required: false
      },
      {
        id: 'when_noticed',
        type: 'text',
        label: 'Wanneer is dit begonnen?',
        placeholder: 'bijv. vanmorgen, gisteren, vorige week',
        required: false
      }
    ]
  },
  'issue.v1.electrical.whole_home.outage': {
    title: 'Elektra Details',
    description: 'Elektrische problemen vereisen specifieke informatie voor veiligheid',
    questions: [
      {
        id: 'safety_concern',
        type: 'radio',
        label: 'Is dit een veiligheidsprobleem?',
        required: true,
        options: [
          { value: 'ja_direct_gevaar', label: 'Ja - direct gevaar' },
          { value: 'ja_mogelijk_gevaar', label: 'Ja - mogelijk gevaar' },
          { value: 'nee_alleen_ongemak', label: 'Nee - alleen ongemak' }
        ]
      },
      {
        id: 'circuit_breaker',
        type: 'checkbox',
        label: 'Is de zekering gesprongen?',
        required: false
      },
      {
        id: 'smell_or_sparks',
        type: 'checkbox',
        label: 'Ruikt u brandlucht of ziet u vonken?',
        required: false
      }
    ]
  },
  'issue.v1.drainage.toilet.blocked': {
    title: 'Afvoer Details',
    description: 'Help ons het afvoerprobleem te begrijpen',
    questions: [
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
        id: 'tried_solutions',
        type: 'textarea',
        label: 'Wat heeft u al geprobeerd?',
        placeholder: 'bijv. ontstopper, heet water, niets',
        required: false
      }
    ]
  },
  'issue.intercom': {
    title: 'Intercom Details',
    description: 'Vertel ons over het intercom probleem',
    questions: [
      {
        id: 'urgency',
        type: 'radio',
        label: 'Hoe urgent is dit?',
        required: true,
        options: [
          { value: 'zeer_urgent', label: 'Zeer urgent - kan niet binnen' },
          { value: 'urgent', label: 'Urgent - ongemak' },
          { value: 'niet_urgent', label: 'Niet urgent' }
        ]
      },
      {
        id: 'visitors_expected',
        type: 'checkbox',
        label: 'Verwacht u vandaag bezoekers?',
        required: false
      }
    ]
  },
  'issue.lift': {
    title: 'Lift Details',
    description: 'Lift problemen informatie',
    questions: [
      {
        id: 'people_trapped',
        type: 'radio',
        label: 'Zitten er mensen vast in de lift?',
        required: true,
        options: [
          { value: 'ja_mensen_vast', label: 'Ja - mensen zitten vast' },
          { value: 'nee_lift_leeg', label: 'Nee - lift staat stil maar leeg' },
          { value: 'onbekend', label: 'Onbekend' }
        ]
      },
      {
        id: 'mobility_impact',
        type: 'checkbox',
        label: 'Heeft u de lift nodig voor mobiliteit?',
        required: false
      }
    ]
  },
  'emergency': {
    title: 'Noodgeval Details',
    description: 'Noodsituaties vereisen onmiddellijke aandacht',
    questions: [
      {
        id: 'emergency_services',
        type: 'checkbox',
        label: 'Heeft u al 112 gebeld?',
        required: false
      },
      {
        id: 'immediate_danger',
        type: 'radio',
        label: 'Is er direct gevaar voor mensen?',
        required: true,
        options: [
          { value: 'ja_mensen_lopen_risico', label: 'Ja - mensen lopen risico' },
          { value: 'nee_alleen_eigendom', label: 'Nee - alleen eigendom' }
        ]
      }
    ]
  }
};
