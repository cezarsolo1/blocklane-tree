export interface CustomQuestion {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // for select/radio/checkbox
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
  'issue.lekkage': {
    title: 'Lekkage Vragen',
    description: 'Help ons de lekkage situatie beter te begrijpen',
    questions: [
      {
        id: 'leak_location',
        type: 'select',
        label: 'Waar ziet u het water?',
        required: true,
        options: ['Plafond', 'Muur', 'Vloer', 'Rondom toilet', 'Keuken', 'Badkamer', 'Radiator/leiding', 'Dak/dakraam', 'Kelder', 'Onbekend']
      },
      {
        id: 'leak_severity',
        type: 'radio',
        label: 'Hoe ernstig is de lekkage?',
        required: true,
        options: ['Druppelt', 'Constante stroom', 'Zware stroom', 'Overstroming']
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
  'issue.verwarming': {
    title: 'Verwarming Vragen',
    description: 'Vertel ons meer over het verwarmingsprobleem',
    questions: [
      {
        id: 'heating_system',
        type: 'select',
        label: 'Type installatie',
        required: true,
        options: ['CV-ketel', 'Blokverwarming', 'Stadsverwarming', 'Warmtepomp', 'Boiler', 'Onbekend']
      },
      {
        id: 'heating_problem',
        type: 'radio',
        label: 'Wat is het probleem?',
        required: true,
        options: ['Geen warmte', 'Niet warm genoeg', 'Te heet', 'Ongelijke verwarming', 'Geluid/trillingen']
      },
      {
        id: 'affected_areas',
        type: 'textarea',
        label: 'Welke kamers/ruimtes zijn getroffen?',
        placeholder: 'bijv. woonkamer, slaapkamer, hele woning',
        required: false
      }
    ]
  },
  'issue.stroom': {
    title: 'Elektra Vragen',
    description: 'Elektrische problemen - veiligheidsinformatie',
    questions: [
      {
        id: 'power_scope',
        type: 'select',
        label: 'Waar is de storing?',
        required: true,
        options: ['Één kamer', 'Meerdere kamers', 'De hele woning', 'Gemeenschappelijke ruimte']
      },
      {
        id: 'safety_check',
        type: 'radio',
        label: 'Ruikt u brandlucht of ziet u vonken?',
        required: true,
        options: ['Ja - STOP en bel 112', 'Nee - geen directe gevaren']
      },
      {
        id: 'circuit_breaker_status',
        type: 'checkbox',
        label: 'Is de zekering gesprongen?',
        required: false
      }
    ]
  },
  'issue.afvoer': {
    title: 'Afvoer Vragen',
    description: 'Verstopping/afvoer problemen',
    questions: [
      {
        id: 'drain_location',
        type: 'select',
        label: 'Waar is de verstopping?',
        required: true,
        options: ['Toilet', 'Douche', 'Bad', 'Wastafel', 'Keukenafvoer', 'Meerdere afvoeren', 'Buitenafvoer']
      },
      {
        id: 'blockage_severity',
        type: 'radio',
        label: 'Hoe ernstig is de verstopping?',
        required: true,
        options: ['Water loopt langzaam weg', 'Water loopt helemaal niet weg', 'Water komt omhoog']
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
  'issue.intercom': {
    title: 'Intercom Vragen',
    description: 'Intercom/deuropener problemen',
    questions: [
      {
        id: 'intercom_function',
        type: 'select',
        label: 'Wat werkt niet?',
        required: true,
        options: ['Belsignaal', 'Gesprek (spraak)', 'Deuropener', 'Beeld (video)', 'Alles']
      },
      {
        id: 'urgency_level',
        type: 'radio',
        label: 'Hoe urgent is dit voor u?',
        required: true,
        options: ['Zeer urgent - kan niet binnen', 'Urgent - ongemak', 'Niet urgent']
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
        options: ['Lift staat stil', 'Deuren sluiten niet', 'Veel geluid', 'Knoppen/indicatie defect']
      },
      {
        id: 'people_trapped',
        type: 'radio',
        label: 'Zitten er mensen vast in de lift?',
        required: true,
        options: ['Ja - mensen zitten vast (BEL 112)', 'Nee - lift staat stil maar leeg']
      }
    ]
  },
  'issue.video': {
    title: 'Video Upload',
    description: 'Upload een video om het probleem beter te laten zien',
    questions: [
      {
        id: 'video_url',
        type: 'text',
        label: 'Video URL',
        placeholder: 'bijv. https://youtube.com/watch?v=... of https://vimeo.com/...',
        required: true,
        defaultValue: 'https://www.youtube.com/watch?v=dRT3tepdMyI'
      },
      {
        id: 'video_description',
        type: 'textarea',
        label: 'Beschrijf wat er in de video te zien is',
        placeholder: 'Leg uit wat het probleem is en wat er in de video gebeurt',
        required: false
      },
      {
        id: 'video_timestamp',
        type: 'text',
        label: 'Belangrijke tijdstip in video (optioneel)',
        placeholder: 'bijv. 1:30 - probleem is duidelijk zichtbaar',
        required: false
      }
    ]
  }
};

// Configuration for different ticket types
export const CUSTOM_QUESTIONS_CONFIG: CustomQuestionsConfig = {
  'issue.lekkage': {
    title: 'Lekkage Details',
    description: 'Help ons de lekkage situatie beter te begrijpen',
    questions: [
      {
        id: 'leak_severity',
        type: 'radio',
        label: 'Hoe ernstig is de lekkage?',
        required: true,
        options: ['Druppelt', 'Constante stroom', 'Zware stroom', 'Overstroming']
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
  'issue.verwarming': {
    title: 'Verwarming Details',
    description: 'Vertel ons over uw verwarmingsprobleem',
    questions: [
      {
        id: 'temperature_issue',
        type: 'radio',
        label: 'Wat is het temperatuurprobleem?',
        required: true,
        options: ['Helemaal geen warmte', 'Niet warm genoeg', 'Te heet', 'Ongelijke verwarming']
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
  'issue.stroom': {
    title: 'Elektra Details',
    description: 'Elektrische problemen vereisen specifieke informatie voor veiligheid',
    questions: [
      {
        id: 'safety_concern',
        type: 'radio',
        label: 'Is dit een veiligheidsprobleem?',
        required: true,
        options: ['Ja - direct gevaar', 'Ja - mogelijk gevaar', 'Nee - alleen ongemak']
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
  'issue.afvoer': {
    title: 'Afvoer Details',
    description: 'Help ons het afvoerprobleem te begrijpen',
    questions: [
      {
        id: 'blockage_severity',
        type: 'radio',
        label: 'Hoe ernstig is de verstopping?',
        required: true,
        options: ['Water loopt langzaam weg', 'Water loopt helemaal niet weg', 'Water komt omhoog']
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
        options: ['Zeer urgent - kan niet binnen', 'Urgent - ongemak', 'Niet urgent']
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
        options: ['Ja - mensen zitten vast', 'Nee - lift staat stil maar leeg', 'Onbekend']
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
        options: ['Ja - mensen lopen risico', 'Nee - alleen eigendom']
      }
    ]
  }
};
