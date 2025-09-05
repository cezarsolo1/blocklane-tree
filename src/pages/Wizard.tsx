/**
 * Wizard Page
 * 
 * Main wizard page that integrates the decision tree engine and wizard renderer.
 * Based on spec section 1.2 - Modules to keep modular.
 */

import { useState, useEffect } from 'react';
import { MaintenanceTreeEngine } from '@/modules/decision-tree/MaintenanceTreeEngine';
import { MaintenanceWizardNavigator } from '@/modules/decision-tree/MaintenanceWizardNavigator';
// Import the maintenance tree data directly as a constant to avoid TypeScript module issues
const maintenanceTreeData = {
  "version": "1.0.0",
  "locale": "nl-NL", 
  "entry": "precheck.emergency",
  "meta": {
    "name": "Onderhoudsboom — Ongepland (Topklasse)",
    "notes": "Locatie- of symptoom-gestuurd. Hergebruik van gedeelde issue-knooppunten om het aantal nodes klein te houden. Alleen ongeplande storingen/defecten.",
    "bins": ["lekkage", "sanitair_toilet", "apparatuur", "verwarming_cv_warmwater", "stroom_elektra", "deuren_sloten_dranger", "intercom_bel", "lift", "ramen_kozijnen_glas", "ventilatie_schimmel_geur", "dak_hwa_balkon_gevel", "ongedierte_overlast"]
  },
  "nodes": [
    {
      "id": "precheck.emergency",
      "type": "menu",
      "title": "Eerst: is er direct gevaar?",
      "options": [
        { "label": "Gaslucht / explosiegevaar", "next": "info.emerg_gas", "aliases": ["gas", "gaslucht", "ruikt gas", "gaskraan", "CO"] },
        { "label": "Brand / rook / vonken", "next": "info.emerg_brand", "aliases": ["brand", "rook", "brandlucht", "vlam", "vonken"] },
        { "label": "Ernstige lekkage (water blijft stromen)", "next": "info.emerg_water", "aliases": ["overstroming", "leidingsbreuk", "hoofdleiding", "water blijft stromen"] },
        { "label": "Nee, geen direct gevaar", "next": "start" }
      ]
    },
    { "id": "info.emerg_gas", "type": "info", "title": "Bel onmiddellijk 112 en het storingsnummer van uw netbeheerder (gas).", "body": "Sluit de gaskraan indien mogelijk en verlaat de ruimte. Neem hierna contact op met de verhuurder/beheerder. Ga niet schakelen (geen licht/elektra) en ventileer.", "next": "start" },
    { "id": "info.emerg_brand", "type": "info", "title": "Bel onmiddellijk 112 (brandweer).", "body": "Waarschuw huisgenoten/buren en verlaat het pand. Gebruik geen lift. Neem na de melding contact op met de beheerder.", "next": "start" },
    { "id": "info.emerg_water", "type": "info", "title": "Draai indien mogelijk de hoofdkraan dicht.", "body": "Beperk de schade (emmers/doeken) indien veilig. Meld de lekkage hierna via de boom.", "next": "start" },
    {
      "id": "start",
      "type": "menu",
      "title": "Wat herkent u het beste?",
      "options": [
        { "label": "Snel naar veelvoorkomend probleem", "next": "quick" },
        { "label": "In uw woning", "next": "woning" },
        { "label": "In het gebouw (gemeenschappelijk)", "next": "gebouw" },
        { "label": "Buiten het gebouw", "next": "buiten" },
        { "label": "Weet ik niet / Algemeen", "next": "algemeen" }
      ]
    },
    {
      "id": "quick",
      "type": "menu",
      "title": "Kies uw probleem",
      "options": [
        { "label": "Lekkage", "next": "issue.lekkage", "aliases": ["waterlek", "nat", "plafond druppelt", "van boven buren"] },
        { "label": "Verstopping / Afvoer", "next": "issue.afvoer", "aliases": ["verstopt", "afvoer", "riool", "loopt niet door"] },
        { "label": "Geen verwarming / geen warm water", "next": "issue.verwarming", "aliases": ["cv", "ketel", "radiator koud", "boiler", "blokverwarming", "warm water"] },
        { "label": "Stroomstoring / Elektra", "next": "issue.stroom", "aliases": ["stroom uit", "aardlek", "kortsluiting", "groepenkast", "licht uit"] }
      ]
    },
    { "id": "issue.lekkage", "type": "issue", "title": "Lekkage", "fields": [
      { "key": "locatie", "label": "Waar ziet u water?", "type": "single_select", "options": ["Plafond", "Muur", "Vloer", "Rondom toilet", "Keuken (gootsteen/kastje)", "Badkamer (douche/bad/wastafel)", "Radiator/leiding", "Dak/dakraam/koepel", "Dakgoot/Regenpijp", "Kelder/kruipruimte", "Bovenburen", "Onbekend"] },
      { "key": "ernst", "label": "Hoe ernstig is het?", "type": "single_select", "options": ["Druppelt", "Regelmatig", "Stroomt / niet te stoppen"] },
      { "key": "fotos", "label": "Foto's toevoegen", "type": "files" }
    ]},
    { "id": "issue.afvoer", "type": "issue", "title": "Verstopping / Afvoer", "fields": [
      { "key": "plek", "label": "Waar?", "type": "single_select", "options": ["Toilet", "Douche", "Bad", "Wastafel", "Keukenafvoer", "Meerdere afvoeren", "Buitenafvoer"] },
      { "key": "ernst", "label": "Wat gebeurt er?", "type": "single_select", "options": ["Loopt langzaam weg", "Staat stil", "Loopt over / overstroomt"] }
    ]},
    { "id": "issue.verwarming", "type": "issue", "title": "Verwarming / Warm water", "fields": [
      { "key": "systeem", "label": "Type installatie", "type": "single_select", "options": ["CV-ketel", "Blokverwarming", "Stadsverwarming", "Warmtepomp", "Boiler", "Onbekend"] },
      { "key": "klacht", "label": "Klacht", "type": "multi_select", "options": ["Geen verwarming", "Radiator(s) worden niet warm", "Ketel valt uit", "Ketel lekt", "Geen warm water", "Warm water schommelt", "Luid/tikkend geluid"] }
    ]},
    { "id": "issue.stroom", "type": "issue", "title": "Stroomstoring / Elektra", "fields": [
      { "key": "bereik", "label": "Waar is de storing?", "type": "single_select", "options": ["Één kamer", "Meerdere kamers", "De hele woning", "Gemeenschappelijke ruimte"] },
      { "key": "aardlek", "label": "Slaat de aardlekschakelaar/groep uit?", "type": "yes_no" }
    ]}
  ]
};
import { WizardRenderer } from '@/components/wizard';
import { Stepper } from '@/components/ui/stepper';
import { LogoutButton } from '@/components/LogoutButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, XCircle, RotateCcw } from 'lucide-react';

export const Wizard = () => {
  const [navigator, setNavigator] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(true);

  useEffect(() => {
    const initializeWizard = async () => {
      try {
        // Load the Dutch maintenance tree
        const engine = new MaintenanceTreeEngine(maintenanceTreeData as any);
        const nav = new MaintenanceWizardNavigator(engine);
        setNavigator(nav);
      } catch (err) {
        console.error('Failed to initialize wizard:', err);
        setError('Failed to load the maintenance wizard. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    initializeWizard();
  }, []);

  const handleMissingOption = () => {
    alert('Missing option selected! This would create a virtual leaf node for ticket creation.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Top Bar */}
        <div className="bg-white border-b border-border shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src="/logos/keij-stefels-final.jpg" alt="Keij Stefels" className="h-32" />
                <h1 className="text-xl font-semibold text-foreground">Schedule Unplanned Maintenance</h1>
              </div>
              <div className="flex-1 flex justify-center">
                <LogoutButton />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Powered by</span>
                <img src="/logos/blocklane-final.png" alt="Blocklane" className="h-32" />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2">Loading Maintenance Wizard</h3>
              <p className="text-sm text-muted-foreground">
                Loading decision tree...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        {/* Top Bar */}
        <div className="bg-white border-b border-border shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src="/logos/keij-stefels-final.jpg" alt="Keij Stefels" className="h-32" />
                <h1 className="text-xl font-semibold text-foreground">Schedule Unplanned Maintenance</h1>
              </div>
              <div className="flex-1 flex justify-center">
                <LogoutButton />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Powered by</span>
                <img src="/logos/blocklane-final.png" alt="Blocklane" className="h-32" />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-medium mb-2">Failed to Load Wizard</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {error}
              </p>
              <Button onClick={() => window.location.reload()}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!navigator) {
    return null;
  }

  const steps = [
    { title: 'Step 1', description: 'What is the problem?' },
    { title: 'Step 2', description: 'Description & pictures' },
    { title: 'Step 3', description: 'Contact details' },
    { title: 'Step 4', description: 'Confirm and send' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/logos/keij-stefels-final.jpg" alt="Keij Stefels" className="h-32" />
              <h1 className="text-xl font-semibold text-foreground">Schedule Unplanned Maintenance</h1>
            </div>
            <div className="flex-1 flex justify-center">
              <LogoutButton />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Powered by</span>
              <img src="/logos/blocklane-final.png" alt="Blocklane" className="h-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className={`grid grid-cols-1 gap-8 ${showProgressBar ? 'lg:grid-cols-4' : 'lg:grid-cols-1'}`}>
          {/* Left Sidebar - Progress */}
          {showProgressBar && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <Stepper steps={steps} currentStep={currentStep} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className={showProgressBar ? 'lg:col-span-3' : 'lg:col-span-1'}>
            <WizardRenderer
              navigator={navigator}
              onMissingOption={handleMissingOption}
              onStepChange={setCurrentStep}
              onProgressBarVisibilityChange={setShowProgressBar}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
