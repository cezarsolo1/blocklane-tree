import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Card as UICard, CardContent as UICardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Stepper } from '@/components/Stepper';
import { TreeGrid } from '@/components/TreeGrid';
import { TreeDropdown } from '@/components/TreeDropdown';
import { StackedLevelSelector } from '@/components/StackedLevelSelector';
import { SummaryCard } from '@/components/SummaryCard';
import { PhotoDropzone, type UploadedPhoto } from '@/components/upload/PhotoDropzone';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useBuildingActiveTicket } from '@/hooks/useBuildingActiveTicket';
import { keysToLabels, hasLeafChildren } from '@/lib/tree';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Grid3X3, 
  List,
  Loader2,
  LogOut,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { MaintenanceItem, LeafNode, TicketData } from '../../packages/core/types';
import { 
  getMaintenanceTree, 
  findNodeByPath, 
  getPathSegments, 
  getBreadcrumbs, 
  searchNodes 
} from '@/lib/tree';

const STEPS_BASE = [
  { title: 'Stap 1', description: 'Wat is het probleem?' },
  { title: 'Stap 2', description: "Beschrijving & foto's" },
  { title: 'Stap 3', description: 'Adresgegevens' },
  { title: 'Stap 4', description: 'Uw contactgegevens' },
  { title: 'Stap 5', description: 'Bevestigen en verzenden' },
];

const STEPS_AUTOSEND = [
  { title: 'Stap 1', description: 'Wat is het probleem?' },
  { title: 'Stap 2', description: "Beschrijving & foto's" },
  { title: 'Stap 3', description: 'Afspraak & bereikbaarheid' },
  { title: 'Stap 4', description: 'Adresgegevens' },
  { title: 'Stap 5', description: 'Bevestigen en verzenden' },
];

export default function Wizard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { loading: bLoading, ticket: buildingTicket } = useBuildingActiveTicket();
  const [isDeletingTicket, setIsDeletingTicket] = useState(false);
  const [hideBuildingCard, setHideBuildingCard] = useState(false);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Problem selection
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MaintenanceItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'dropdown'>('grid');
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedLeaf, setSelectedLeaf] = useState<LeafNode | null>(null);

  // Step 2: Photos
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);

  // Step 3: Address
  const [streetAddress, setStreetAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');

  // Step 4: Contact
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Step 5: Description (for DESCRIBE type)
  const [description, setDescription] = useState('');

  // FIX_VIDEO flow state
  const [diyOutcome, setDiyOutcome] = useState<'UNSET' | 'YES' | 'NO'>('UNSET');

  // AUTO_SEND step state
  // Person at home (can differ from contact details)
  const [occupantName, setOccupantName] = useState('');
  const [occupantPhone, setOccupantPhone] = useState('');
  const [occupantEmail, setOccupantEmail] = useState('');
  const [notesForContractor, setNotesForContractor] = useState('');
  const [consentPersonalData, setConsentPersonalData] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  
  // Additional AUTO_SEND fields
  const [hasPets, setHasPets] = useState(false);
  const [petDetails, setPetDetails] = useState('');
  const [hasAlarm, setHasAlarm] = useState(false);
  const [alarmDetails, setAlarmDetails] = useState('');
  const [neighborDetails, setNeighborDetails] = useState('');
  const [accessMethod, setAccessMethod] = useState('');
  const [accessPermission, setAccessPermission] = useState('');
  const [intercomDetails, setIntercomDetails] = useState('');
  const [keyBoxDetails, setKeyBoxDetails] = useState('');

  // Availability – simple day/part buckets for the next 7 days
  type TimeSlot = { date: string; timeBlock: 'morning' | 'afternoon' | 'fullday' };
  const [availabilitySlots, setAvailabilitySlots] = useState<TimeSlot[]>([]);

  // Helper: toggle a time slot
  const toggleTimeSlot = (date: string, timeBlock: 'morning' | 'afternoon' | 'fullday') => {
    setAvailabilitySlots(prev => {
      if (timeBlock === 'fullday') {
        // If selecting fullday, remove any existing slots for this date and add morning + afternoon
        const filtered = prev.filter(slot => slot.date !== date);
        return [...filtered, 
          { date, timeBlock: 'morning' }, 
          { date, timeBlock: 'afternoon' }
        ];
      } else {
        // For morning/afternoon, toggle normally but remove fullday if it exists
        const existing = prev.find(slot => slot.date === date && slot.timeBlock === timeBlock);
        const withoutCurrent = prev.filter(slot => !(slot.date === date && slot.timeBlock === timeBlock));
        
        if (existing) {
          return withoutCurrent;
        } else {
          return [...withoutCurrent, { date, timeBlock }];
        }
      }
    });
  };

  // Helper: check if a time slot is selected
  const isTimeSlotSelected = (date: string, timeBlock: 'morning' | 'afternoon' | 'fullday') => {
    if (timeBlock === 'fullday') {
      // Fullday is selected if both morning and afternoon are selected
      return availabilitySlots.some(slot => slot.date === date && slot.timeBlock === 'morning') &&
             availabilitySlots.some(slot => slot.date === date && slot.timeBlock === 'afternoon');
    }
    return availabilitySlots.some(slot => slot.date === date && slot.timeBlock === timeBlock);
  };

  // Helper: next 7 days as ISO (local date)
  const getNextDays = (n = 7) => {
    const out: string[] = [];
    const now = new Date();
    for (let i = 0; i < n; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      out.push(d.toISOString().slice(0,10));
    }
    return out;
  };

  // Load path from URL on mount
  useEffect(() => {
    const pathParam = searchParams.get('path');
    if (pathParam) {
      const path = pathParam.split('.');
      setCurrentPath(path);
      
      const node = findNodeByPath(path);
      if (node?.type === 'leaf') {
        setSelectedLeaf(node as LeafNode);
        setDiyOutcome('UNSET');
      }
    }
  }, [searchParams]);


  // Update URL when path changes
  useEffect(() => {
    if (currentPath.length > 0) {
      setSearchParams({ path: currentPath.join('.') });
    } else {
      setSearchParams({});
    }
    setDiyOutcome('UNSET');
  }, [currentPath, setSearchParams]);

  // Load user profile data when available
  useEffect(() => {
    if (user) {
      setContactEmail(user.email || '');
      // Would fetch profile data here for name, phone, etc.
    }
  }, [user]);

  const getCurrentNode = (): MaintenanceItem | null => {
    if (currentPath.length === 0) {
      return getMaintenanceTree();
    }
    return findNodeByPath(currentPath);
  };

  const getAvailableItems = (): MaintenanceItem[] => {
    const currentNode = getCurrentNode();
    if (!currentNode || currentNode.type === 'leaf') return [];
    
    // For dropdown mode, return current level items (stacked selector will handle display)
    if (viewMode === 'dropdown' && !searchQuery.trim()) {
      return currentNode.children;
    }
    
    if (searchQuery.trim()) {
      // Global search across all nodes for dropdown mode
      if (viewMode === 'dropdown') {
        const results = searchNodes(searchQuery);
        setSearchResults(results);
        return results;
      } else {
        // Local search within current node for grid mode
        return searchNodes(searchQuery, currentNode);
      }
    }
    
    return currentNode.children;
  };

  const buildOptionUnavailableLeaf = (): LeafNode => ({
    label: 'Mijn optie ontbreekt',
    key: [...currentPath, '__option_unavailable__'].join('.'),
    type: 'leaf',
    leafType: 'OPTION_UNAVAILABLE'
  });

  const handleItemClick = (item: MaintenanceItem) => {
  if (item.type === 'leaf') {
    // Keep siblings visible; just select the leaf
    setSelectedLeaf(item as LeafNode);
    setDiyOutcome('UNSET');

        // No immediate redirects - both EMERGENCY and RESPONSIBILITY go to Step 2
        // (removed auto-redirect for emergencies to show Step 2 first)
    return;
  }

  // Menu node: navigate deeper
  const newPath = getPathSegments(item.key);
  setCurrentPath(newPath);
  setSelectedLeaf(null);
};


  const handleBack = () => {
    // For dropdown mode with stacked selectors: go one level up
    if (viewMode === 'dropdown' && currentPath.length > 0) {
      const newPath = currentPath.slice(0, -1);
      setCurrentPath(newPath);
      setSelectedLeaf(null);
      setDiyOutcome('UNSET');
    } else if (viewMode === 'grid' && currentPath.length > 0) {
      // For grid mode: existing behavior
      const newPath = currentPath.slice(0, -1);
      setCurrentPath(newPath);
      setSelectedLeaf(null);
      setDiyOutcome('UNSET');
    }
  };

  const handleNextStep = () => {
    // First step validation
    if (currentStep === 0 && !selectedLeaf) {
      return;
    }

    const steps = selectedLeaf?.leafType === 'AUTO_SEND' ? STEPS_AUTOSEND : STEPS_BASE;
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDeleteTicket = async () => {
    if (!buildingTicket) return;
    setIsDeletingTicket(true);
    try {
      localStorage.setItem('dismissedActiveTicketId', buildingTicket.id);
      setHideBuildingCard(true);
      toast({
        title: 'Melding verborgen',
        description: 'De melding is verborgen. Nieuwe meldingen verschijnen hier weer.',
      });
    } finally {
      setIsDeletingTicket(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedLeaf || !user) return;

    setIsSubmitting(true);

    try {
      const ticketData: TicketData = {
        decisionPath: selectedLeaf ? [...currentPath, ...getPathSegments(selectedLeaf.key).slice(currentPath.length)] : currentPath,
        leafType: selectedLeaf.leafType,
        description: (selectedLeaf.leafType === 'DESCRIBE' || selectedLeaf.leafType === 'OPTION_UNAVAILABLE') ? description : undefined,
        // Store public URLs directly in photo_paths
        photoPaths: uploadedPhotos.map(photo => photo.publicUrl),
        streetAddress,
        postalCode,
        city,
        contactName,
        contactEmail,
        contactPhone,
      };

      // Compute normalized building key on the client
      const buildingKey = (postalCode + ' ' + streetAddress + ' ' + city)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

      // Insert ticket (add building_key and auto_send fields)
      const { error } = await supabase.from('tickets').insert({
        tenant_id: user.id,
        decision_path: ticketData.decisionPath,
        leaf_type: ticketData.leafType,
        description: ticketData.description,
        photo_paths: ticketData.photoPaths,
        street_address: ticketData.streetAddress,
        postal_code: ticketData.postalCode,
        city: ticketData.city,
        contact_name: ticketData.contactName,
        contact_email: ticketData.contactEmail,
        contact_phone: ticketData.contactPhone,
        building_key: buildingKey,
        auto_send: selectedLeaf.leafType === 'AUTO_SEND',
        occupant_name: occupantName || null,
        occupant_phone: occupantPhone || null,
        occupant_email: occupantEmail || null,
        notes_for_contractor: notesForContractor || null,
        availability_slots: availabilitySlots,
        consent_personal_data: consentPersonalData,
        consent_terms: consentMarketing,
        has_pets: hasPets,
        pet_details: petDetails || null,
        has_alarm: hasAlarm,
        alarm_details: alarmDetails || null,
        neighbor_details: neighborDetails || null,
        access_method: accessMethod || null,
        access_permission: accessPermission || null,
        intercom_details: intercomDetails || null,
        key_box_details: keyBoxDetails || null,
      });

      if (error) throw error;

      // Persist building_key on profile as well (best effort)
      await supabase
        .from('profiles')
        .update({ building_key: buildingKey })
        .eq('user_id', user.id);

      toast({
        title: 'Melding verzonden',
        description: 'Uw melding is succesvol verzonden.',
      });

      navigate('/meldingvoltooid');
    } catch (error) {
      toast({
        title: 'Fout bij verzenden',
        description: 'Er is een fout opgetreden bij het verzenden van uw melding.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = getBreadcrumbs(currentPath);
  const availableItems = getAvailableItems();
  
  // Derive steps dynamically:
  const steps = selectedLeaf?.leafType === 'AUTO_SEND' ? STEPS_AUTOSEND : STEPS_BASE;
  
  const isAutoSend = selectedLeaf?.leafType === 'AUTO_SEND';
  const autoSendAvailabilityStepIndex = 2; // Step 3: Appointment & availability
  const isOnAutoSendAvailabilityForm = isAutoSend && currentStep === autoSendAvailabilityStepIndex;

  const hasMinAvailability = availabilitySlots.length >= 1; // require at least 1 slot

  const occupantOK =
    occupantName.trim().length > 1 &&
    occupantPhone.trim().length >= 6 && // keep this simple; email optional
    consentPersonalData && // required consent
    consentMarketing && // now also required (algemene voorwaarden)
    accessPermission; // access permission is required

  const canProceed =
    currentStep === 0
      ? selectedLeaf !== null
      : (selectedLeaf?.leafType === 'RESPONSIBILITY' || selectedLeaf?.leafType === 'EMERGENCY')
        ? false
        : (selectedLeaf?.leafType === 'FIX_VIDEO')
          ? (diyOutcome === 'NO') // only after "Nee"
          : (isOnAutoSendAvailabilityForm ? (occupantOK && hasMinAvailability) : true);

  const currentStepData = {
    title: steps[currentStep].title,
    description:
      currentStep === 1 &&
      (selectedLeaf?.leafType === 'RESPONSIBILITY' ||
       selectedLeaf?.leafType === 'EMERGENCY' ||
       selectedLeaf?.leafType === 'FIX_VIDEO')
        ? ''
        : steps[currentStep].description
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/logos/keij-stefels-final.jpg" alt="Keij Stefels" className="h-32" />
              <h1 className="text-xl font-semibold text-foreground">Melding Ongepland Onderhoud</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/logout"
                className="flex items-center gap-2 px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log uit
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Powered by</span>
                <img src="/logos/blocklane-final.png" alt="Blocklane" className="h-32" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Stepper */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Voortgang</CardTitle>
              </CardHeader>
              <CardContent>
                <Stepper steps={steps} currentStep={currentStep} />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  {currentStepData.title}
                  {currentStepData.description && `: ${currentStepData.description}`}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {/* Breadcrumbs for Step 1 */}
                {currentStep === 0 && (
                <div className="mt-4">
                  <Breadcrumb>
                    <BreadcrumbList>
                      {breadcrumbs.map((crumb, index) => (
                        <BreadcrumbItem key={index}>
                          {index === breadcrumbs.length - 1 ? (
                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                          ) : (
                            <>
                              <BreadcrumbLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPath(crumb.path);
                                  setSelectedLeaf(null); // clear any leaf selection when jumping up
                                  setDiyOutcome('UNSET');
                                }}
                              >
                                {crumb.label}
                              </BreadcrumbLink>
                              <BreadcrumbSeparator />
                            </>
                          )}
                        </BreadcrumbItem>
                      ))}

                      {/* Append the selected leaf label visually */}
                      {selectedLeaf && (
                        <>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            <BreadcrumbPage>{selectedLeaf.label}</BreadcrumbPage>
                          </BreadcrumbItem>
                        </>
                      )}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              )}


                {/* Step 1: Problem Selection */}
                {currentStep === 0 && (
                  <div className="space-y-4">
                    {/* Status in uw gebouw */}
                    {!bLoading && buildingTicket && localStorage.getItem('dismissedActiveTicketId') !== buildingTicket.id && !hideBuildingCard && (
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle>Status in uw gebouw</CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDeleteTicket}
                            disabled={isDeletingTicket}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {isDeletingTicket && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                              <div className="space-y-2">
                                <div>
                                  <span className="font-medium text-amber-900">Probleem:</span>{' '}
                                  <span className="text-amber-800">
                                    {Array.isArray(buildingTicket.decision_path) && buildingTicket.decision_path.length
                                      ? keysToLabels(buildingTicket.decision_path).join(' → ')
                                      : 'Onbekend probleem'}
                                  </span>
                                </div>
                                {(() => {
                                  const vendor =
                                    (buildingTicket as any).assigned_vendor ||
                                    (buildingTicket as any).vendor ||
                                    (buildingTicket as any).contractor_name;
                                  return vendor ? (
                                    <div>
                                      <span className="font-medium text-amber-900">Uitvoerder:</span>{' '}
                                      <span className="text-amber-800">{vendor}</span>
                                    </div>
                                  ) : null;
                                })()}
                                <div>
                                  <span className="font-medium text-amber-900">Aangemaakt:</span>{' '}
                                  <span className="text-amber-800">
                                    {buildingTicket.created_at
                                      ? new Date(buildingTicket.created_at).toLocaleString()
                                      : 'Onbekend'}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-4 p-6 bg-amber-200 border-2 border-amber-400 rounded-xl shadow-sm">
                                <p className="text-base font-bold text-amber-900 mb-2">
                                  Deze storing is al bekend en wordt opgelost.
                                </p>
                                <p className="text-base font-medium text-amber-800">
                                  U hoeft geen nieuwe melding te maken als het om dit probleem gaat. Gaat het om iets anders? Dan kunt u hier een nieuwe melding maken.
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Search */}
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Zoek naar uw probleem..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (viewMode === 'dropdown' && e.target.value.trim()) {
                              // Global search for dropdown mode
                              const results = searchNodes(e.target.value);
                              setSearchResults(results);
                            } else {
                              setSearchResults([]);
                            }
                          }}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={viewMode === 'grid' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setViewMode('grid')}
                        >
                          <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewMode === 'dropdown' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setViewMode('dropdown')}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Back Button - only show for dropdown mode when path exists or for grid mode when path exists */}
                    {((viewMode === 'dropdown' && currentPath.length > 0) || (viewMode === 'grid' && currentPath.length > 0)) && (
                      <Button variant="outline" onClick={handleBack} className="mb-4">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Terug
                      </Button>
                    )}

                    {/* Content based on view mode */}
                    {viewMode === 'grid' ? (
                      <TreeGrid
                        items={availableItems}
                        onItemClick={handleItemClick}
                        selectedItem={selectedLeaf}
                      />
                    ) : (
                      <StackedLevelSelector
                        currentPath={currentPath}
                        onPathChange={setCurrentPath}
                        onItemClick={handleItemClick}
                        selectedItem={selectedLeaf}
                        searchResults={searchResults}
                        isSearching={!!searchQuery.trim()}
                      />
                    )}

                  </div>
                )}

            {/* Step 2: Description & Photos (or Responsibility/Emergency info) */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {selectedLeaf?.leafType === 'RESPONSIBILITY' ? (
                      // === RESPONSIBILITY: show info page instead of description/photos ===
                      <div className="space-y-4">
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
                          <h3 className="font-semibold text-yellow-900 mb-2">
                            Deze reparatie valt onder uw eigen verantwoordelijkheid
                          </h3>
                          <p className="text-sm text-yellow-900/90 mb-3">
                            Volgens het{' '}
                            <a
                              href="https://wetten.overheid.nl/BWBR0014931/2003-08-01"
                              target="_blank"
                              rel="noreferrer"
                              className="underline underline-offset-2"
                            >
                              <strong>Besluit kleine herstellingen</strong>
                            </a>{' '}
                            bent u als huurder zelf verantwoordelijk voor een aantal kleine reparaties en
                            onderhoudswerkzaamheden in de woning.
                          </p>
                          <p className="text-sm text-yellow-900/90 mb-3">
                            De reparatie die u probeerde te melden valt onder deze categorie. Dit betekent
                            dat Keij &amp; Stefels dit niet voor u kan uitvoeren via de servicedesk.
                          </p>

                          <div className="space-y-2">
                            <h4 className="font-medium text-yellow-900">Wat kunt u doen?</h4>
                            <ul className="list-disc list-inside text-sm text-yellow-900/90">
                              <li>U kunt de reparatie zelf uitvoeren.</li>
                              <li>Of u kunt een vakman inschakelen op eigen kosten.</li>
                            </ul>
                          </div>

                          <p className="text-xs text-yellow-900/80 mt-3">
                            ℹ️ Wilt u precies weten welke reparaties onder uw verantwoordelijkheid vallen?
                            Kijk dan in het overzicht via de link hierboven.
                          </p>
                        </div>
                  </div>
                ) : selectedLeaf?.leafType === 'EMERGENCY' ? (
                  // === EMERGENCY: show emergency info page ===
                  <div className="space-y-4">
                    <div className="rounded-lg border border-red-300 bg-red-100 p-6">
                      <h3 className="text-xl font-bold text-red-900 mb-4">
                        Dit is een noodgeval
                      </h3>
                      <p className="text-base text-red-900 mb-4">
                        Dit probleem vormt een direct gevaar voor de veiligheid.
                      </p>
                      <p className="text-base text-red-900 font-semibold mb-4">
                        Bel <strong>112</strong> en verlaat onmiddellijk de woning.
                      </p>
                      <p className="text-base text-red-900">
                        ⚠️ Wacht niet en onderneem direct actie.
                      </p>
                    </div>
                  </div>
                 ) : selectedLeaf?.leafType === 'FIX_VIDEO' ? (
                  diyOutcome === 'UNSET' ? (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                        <h3 className="font-semibold text-blue-900 mb-2">
                          Probeer het eerst zelf op te lossen
                        </h3>
                        <p className="text-sm text-blue-900/90 mb-3">
                          Heeft u last van een verstopt putje of een afvoer die langzaam doorloopt?
                          Geen zorgen: dit is vaak eenvoudig zelf te verhelpen. Met onze instructievideo
                          heeft u het meestal binnen een paar minuten opgelost.
                        </p>
                        <div className="aspect-video w-full overflow-hidden rounded-md mb-4">
                          <iframe
                            className="h-full w-full"
                            src="https://www.youtube.com/embed/R22urvGcWy4"
                            title="Afvoer ontstoppen"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                        <div className="mb-2 font-medium text-blue-900">Is het gelukt?</div>
                        <div className="flex gap-3">
                          <Button onClick={() => setDiyOutcome('YES')}>Ja, opgelost! 🎉</Button>
                          <Button variant="outline" onClick={() => setDiyOutcome('NO')}>Nee, het werkt nog niet</Button>
                        </div>
                      </div>
                    </div>
                  ) : diyOutcome === 'YES' ? (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                        <h3 className="text-xl font-bold text-blue-900 mb-2">Mooi zo!</h3>
                        <p className="text-base text-blue-900/90">
                          Puik werk, Bob de Bouwer! Het probleem is opgelost.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4">
                        <Label htmlFor="description">Beschrijf het probleem zo gedetailleerd mogelijk</Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Waar is het probleem? Wanneer begon het? Hoe vaak gebeurt het?"
                          rows={4}
                          required={true}
                        />
                      </div>
                      <div>
                        <Label>Foto's toevoegen</Label>
                        <p className="text-sm text-muted-foreground mb-4">
                          Voeg foto's toe om uw probleem beter te kunnen omschrijven
                        </p>
                        <PhotoDropzone
                          maxFiles={8}
                          maxSizeMB={10}
                          value={uploadedPhotos}
                          onChange={setUploadedPhotos}
                          showHelpText={true}
                        />
                      </div>
                    </div>
                  )
                ) : (
                      // === default: description + photos ===
                      <div>
                        <div className="mb-4">
                          <Label htmlFor="description">Beschrijf het probleem zo gedetailleerd mogelijk</Label>
                          <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Waar is het probleem? Wanneer begon het? Hoe vaak gebeurt het?"
                            rows={4}
                            // Require for both DESCRIBE and OPTION_UNAVAILABLE
                            required={selectedLeaf?.leafType === 'DESCRIBE' || selectedLeaf?.leafType === 'OPTION_UNAVAILABLE'}
                          />
                        </div>

                        <div>
                          <Label>Foto's toevoegen</Label>
                          <p className="text-sm text-muted-foreground mb-4">
                            Voeg foto's toe om uw probleem beter te kunnen omschrijven
                          </p>
                          <PhotoDropzone
                            maxFiles={8}
                            maxSizeMB={10}
                            value={uploadedPhotos}
                            onChange={setUploadedPhotos}
                            showHelpText={true}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                 {/* Step 3: Afspraak & bereikbaarheid (AUTO_SEND only) */}
                 {selectedLeaf?.leafType === 'AUTO_SEND' && currentStep === 2 && (
                   <div className="space-y-6">
                     {/* Contact fields */}
                     <div className="rounded-lg border p-6 bg-white">
                       <h3 className="font-semibold mb-4">Contact tijdens de reparatie</h3>
                       <div className="space-y-4">
                         <div>
                           <Label htmlFor="occupantName">Naam van de persoon die aanwezig is *</Label>
                           <Input 
                             id="occupantName" 
                             value={occupantName} 
                             onChange={(e) => setOccupantName(e.target.value)} 
                             placeholder="Voor- en achternaam" 
                             required 
                           />
                         </div>
                         <div>
                           <Label htmlFor="occupantPhone">Telefoonnummer *</Label>
                           <Input 
                             id="occupantPhone" 
                             value={occupantPhone} 
                             onChange={(e) => setOccupantPhone(e.target.value)} 
                             placeholder="06-12345678" 
                             required 
                           />
                           <p className="text-sm text-muted-foreground mt-1">U wordt op de hoogte gehouden via SMS.</p>
                         </div>
                         <div>
                           <Label htmlFor="occupantEmail">E-mailadres</Label>
                           <Input 
                             id="occupantEmail" 
                             type="email" 
                             value={occupantEmail} 
                             onChange={(e) => setOccupantEmail(e.target.value)} 
                             placeholder="naam@voorbeeld.nl" 
                           />
                           <p className="text-sm text-muted-foreground mt-1">Wilt u naast berichten per SMS ook op de hoogte blijven via e-mail? Vul dan uw e-mailadres in.</p>
                         </div>
                       </div>
                     </div>

                     {/* Availability selector */}
                     <div className="rounded-lg border p-6 bg-white">
                       <h3 className="font-semibold mb-4">Wanneer kunt u de monteur ontvangen?</h3>
                       <p className="text-sm text-muted-foreground mb-4">
                         Selecteer een aantal tijdsloten. Meer opties verhogen de kans op een snelle afspraak.
                       </p>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {getNextDays(7).map((date) => (
                           <div key={date} className="rounded-md border p-3">
                             <div className="text-sm font-medium mb-3">
                               {new Date(date).toLocaleDateString('nl-NL', { 
                                 weekday: 'long', 
                                 day: 'numeric', 
                                 month: 'long' 
                               })}
                             </div>
                             <div className="space-y-2">
                               <label className="flex items-center space-x-2 cursor-pointer">
                                 <input
                                   type="checkbox"
                                   checked={isTimeSlotSelected(date, 'fullday')}
                                   onChange={() => toggleTimeSlot(date, 'fullday')}
                                   className="rounded border-gray-300"
                                 />
                                 <span className="text-sm">Hele dag (08:00–17:00)</span>
                               </label>
                               <label className="flex items-center space-x-2 cursor-pointer">
                                 <input
                                   type="checkbox"
                                   checked={isTimeSlotSelected(date, 'morning')}
                                   onChange={() => toggleTimeSlot(date, 'morning')}
                                   className="rounded border-gray-300"
                                 />
                                 <span className="text-sm">Ochtend (08:00–12:30)</span>
                               </label>
                               <label className="flex items-center space-x-2 cursor-pointer">
                                 <input
                                   type="checkbox"
                                   checked={isTimeSlotSelected(date, 'afternoon')}
                                   onChange={() => toggleTimeSlot(date, 'afternoon')}
                                   className="rounded border-gray-300"
                                 />
                                 <span className="text-sm">Middag (12:30–17:00)</span>
                               </label>
                             </div>
                           </div>
                         ))}
                       </div>

                       {!hasMinAvailability && (
                         <p className="text-sm text-muted-foreground mt-3">
                           Selecteer minimaal één tijdslot om verder te kunnen gaan.
                         </p>
                       )}
                     </div>

                     {/* Access permission question */}
                     <div className="rounded-lg border p-6 bg-white">
                       <div className="space-y-4">
                         <div>
                           <Label className="text-sm font-medium">
                             Wij doen ons uiterste best om ons aan uw beschikbaarheid aan te passen. Mocht dat niet lukken, geeft u de monteur dan toestemming om de woning te betreden buiten uw aanwezigheid? *
                           </Label>
                           <div className="mt-3 space-y-2">
                             <label className="flex items-center space-x-3 cursor-pointer">
                               <input
                                 type="radio"
                                 name="accessPermission"
                                 value="yes"
                                 checked={accessPermission === 'yes'}
                                 onChange={(e) => setAccessPermission(e.target.value)}
                                 className="border-gray-300"
                                 required
                               />
                               <span className="text-sm">Ja</span>
                             </label>
                             <label className="flex items-center space-x-3 cursor-pointer">
                               <input
                                 type="radio"
                                 name="accessPermission"
                                 value="no"
                                 checked={accessPermission === 'no'}
                                 onChange={(e) => setAccessPermission(e.target.value)}
                                 className="border-gray-300"
                                 required
                               />
                               <span className="text-sm">Nee</span>
                             </label>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Access questions - only show if permission is granted */}
                     {accessPermission === 'yes' && (
                       <>
                         <div className="rounded-lg border p-6 bg-white">
                           <h3 className="font-semibold mb-4">Hoe komt de monteur binnen?</h3>
                           <div className="space-y-4">
                             <div>
                               <select
                                 id="accessMethod"
                                 value={accessMethod}
                                 onChange={(e) => setAccessMethod(e.target.value)}
                                 className="w-full p-2 border border-gray-300 rounded-md"
                               >
                                 <option value="">Selecteer een optie</option>
                                 <option value="intercom">Via de intercom</option>
                                 <option value="keybox">Sleutelkluis</option>
                                 <option value="neighbor">Via de buren</option>
                                 <option value="other">Anders</option>
                               </select>
                             </div>

                             {accessMethod === 'intercom' && (
                               <div>
                                 <Label htmlFor="intercomDetails">Intercom details</Label>
                                 <Input
                                   id="intercomDetails"
                                   value={intercomDetails}
                                   onChange={(e) => setIntercomDetails(e.target.value)}
                                   placeholder="Bijv. bel aan bij naam 'Jansen', druk op 123"
                                 />
                               </div>
                             )}

                             {accessMethod === 'keybox' && (
                               <div>
                                 <Label htmlFor="keyBoxDetails">Sleutelkluis details</Label>
                                 <Input
                                   id="keyBoxDetails"
                                   value={keyBoxDetails}
                                   onChange={(e) => setKeyBoxDetails(e.target.value)}
                                   placeholder="Bijv. code 1234, kluis hangt links van de deur"
                                 />
                               </div>
                             )}

                             {accessMethod === 'neighbor' && (
                               <div>
                                 <Label htmlFor="neighborDetails">Buren contact details</Label>
                                 <Textarea
                                   id="neighborDetails"
                                   value={neighborDetails}
                                   onChange={(e) => setNeighborDetails(e.target.value)}
                                   placeholder="Bijv. mevrouw Jansen woont naast ons (huisnummer 125), telefoon: 06-12345678"
                                   rows={3}
                                 />
                               </div>
                             )}
                           </div>
                         </div>

                         {/* Alarm questions */}
                         <div className="rounded-lg border p-6 bg-white">
                           <h3 className="font-semibold mb-4">Alarm systeem</h3>
                           <div className="space-y-4">
                             <label className="flex items-center space-x-3 cursor-pointer">
                               <input
                                 type="checkbox"
                                 checked={hasAlarm}
                                 onChange={(e) => setHasAlarm(e.target.checked)}
                                 className="rounded border-gray-300"
                               />
                               <span className="text-sm">Er is een alarmsysteem in huis</span>
                             </label>
                             {hasAlarm && (
                               <div>
                                 <Label htmlFor="alarmDetails">Alarm details</Label>
                                 <Textarea
                                   id="alarmDetails"
                                   value={alarmDetails}
                                   onChange={(e) => setAlarmDetails(e.target.value)}
                                   placeholder="Bijv. alarm gaat automatisch aan om 18:00, code is 1234, paneel zit in de hal"
                                   rows={3}
                                 />
                               </div>
                             )}
                           </div>
                         </div>
                       </>
                     )}

                     {/* Additional notes */}
                     <div className="rounded-lg border p-6 bg-white">
                       <h3 className="font-semibold mb-4">Extra informatie voor de monteur (optioneel)</h3>
                       <div>
                         <Label htmlFor="notesForContractor">Aanvullende opmerkingen</Label>
                         <Textarea 
                           id="notesForContractor" 
                           value={notesForContractor} 
                           onChange={(e) => setNotesForContractor(e.target.value)} 
                           placeholder="Bijv. sleutels liggen onder de mat, bel eerst aan, parkeren kan achter het huis..."
                           rows={4}
                         />
                       </div>
                     </div>

                     {/* Consent checkboxes */}
                     <div className="rounded-lg border p-6 bg-white">
                       <h3 className="font-semibold mb-4">Toestemming</h3>
                       <div className="space-y-3">
                         <label className="flex items-start space-x-3 cursor-pointer">
                           <input
                             type="checkbox"
                             checked={consentPersonalData}
                             onChange={(e) => setConsentPersonalData(e.target.checked)}
                             className="mt-1 rounded border-gray-300"
                             required
                           />
                           <span className="text-sm">
                             Ik ga akkoord met het gebruik van mijn persoonsgegevens voor het plannen van deze afspraak. *
                           </span>
                         </label>
                         <label className="flex items-start space-x-3 cursor-pointer">
                           <input
                             type="checkbox"
                             checked={consentMarketing}
                             onChange={(e) => setConsentMarketing(e.target.checked)}
                             className="mt-1 rounded border-gray-300"
                             required
                           />
                           <span className="text-sm">
                             Ik ga akkoord met <a href="#" className="underline hover:no-underline">de algemene voorwaarden</a> *
                           </span>
                         </label>
                       </div>
                       <p className="text-xs text-muted-foreground mt-3">
                         <a href="#" className="underline hover:no-underline">Lees onze privacyverklaring</a> voor meer informatie.
                       </p>
                     </div>
                   </div>
                 )}

                 {/* Step 3/4: Address */}
                 {((selectedLeaf?.leafType !== 'AUTO_SEND' && currentStep === 2) || 
                   (selectedLeaf?.leafType === 'AUTO_SEND' && currentStep === 3)) && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="street">Straat en huisnummer *</Label>
                      <Input
                        id="street"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="Bijv. Hoofdstraat 123"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postal">Postcode *</Label>
                        <Input
                          id="postal"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="1234 AB"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="city">Plaats *</Label>
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Amsterdam"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                 {/* Step 4: Contact (non-AUTO_SEND only) */}
                 {selectedLeaf?.leafType !== 'AUTO_SEND' && currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Naam *</Label>
                      <Input
                        id="name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Uw volledige naam"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">E-mailadres *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="uw@email.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Telefoonnummer</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="06-12345678"
                      />
                    </div>
                  </div>
                )}

                 {/* Step 5/4: Summary */}
                 {((selectedLeaf?.leafType !== 'AUTO_SEND' && currentStep === 4) || 
                   (selectedLeaf?.leafType === 'AUTO_SEND' && currentStep === 4)) && selectedLeaf && (
                  <div className="space-y-6">
                    <SummaryCard
                       data={{
                         decisionPath: selectedLeaf ? [...currentPath, ...getPathSegments(selectedLeaf.key).slice(currentPath.length)] : currentPath,
                         leafType: selectedLeaf.leafType,
                         description: (selectedLeaf.leafType === 'DESCRIBE' || selectedLeaf.leafType === 'OPTION_UNAVAILABLE') ? description : undefined,
                         photoPaths: uploadedPhotos.map(photo => photo.previewUrl),
                         streetAddress,
                         postalCode,
                         city,
                         contactName,
                         contactEmail,
                         contactPhone,
                         availability: availabilitySlots.reduce((acc, slot) => {
                           if (!acc[slot.date]) acc[slot.date] = [];
                           acc[slot.date].push(slot.timeBlock === 'morning' ? 'Ochtend' : 'Middag');
                           return acc;
                         }, {} as Record<string, string[]>),
                         occupant: occupantName ? {
                           name: occupantName,
                           phone: occupantPhone,
                           email: occupantEmail || undefined,
                         } : null,
                         hasPets,
                         petDetails,
                         hasAlarm,
                         alarmDetails,
                         neighborDetails,
                         accessMethod,
                         accessPermission,
                         intercomDetails,
                         keyBoxDetails,
                         notesForContractor,
                       } as any}
                    />
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6 border-t">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={handlePrevStep}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Vorige
                    </Button>
                  )}

                  {/* Right side buttons */}
                  <div className="flex gap-2">
                    {/* Show "Mijn optie ontbreekt" on Step 1 when there are leaf children */}
                    {currentStep === 0 && (() => {
                      const currentNode = getCurrentNode();
                      const showOptionUnavailable = hasLeafChildren(currentNode);
                      return showOptionUnavailable && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedLeaf(buildOptionUnavailableLeaf());
                            setCurrentStep(1); // Automatically advance to Step 2
                          }}
                        >
                          Mijn optie ontbreekt
                        </Button>
                      );
                    })()}

                    {currentStep < steps.length - 1 ? (
                      <Button
                        onClick={handleNextStep}
                        disabled={!canProceed}
                      >
                        Volgende
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedLeaf}
                      >
                        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Versturen
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}