/**
 * Wizard Page
 * 
 * Main wizard page that integrates the decision tree engine and wizard renderer.
 * Based on spec section 1.2 - Modules to keep modular.
 */

import { useState, useEffect } from 'react';
import { MaintenanceTreeEngine } from '@/modules/decision-tree/MaintenanceTreeEngine';
import { MaintenanceWizardNavigator } from '@/modules/decision-tree/MaintenanceWizardNavigator';
// Import the complete maintenance tree data from the TypeScript file
import { maintenanceTreeData } from '@/data/decision_tree_nl_v2.0';
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
                {/* <img src="/logos/keij-stefels-final.jpg" alt="Keij Stefels" className="h-32" /> */}
                <h1 className="text-xl font-semibold text-foreground">Schedule Unplanned Maintenance</h1>
              </div>
              <div className="flex-1 flex justify-center">
                <LogoutButton />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Powered by</span>
                <img src="/logos/blocklane-final.png" alt="Blocklane" className="h-6" />
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
                <img src="/logos/blocklane-final.png" alt="Blocklane" className="h-6" />
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
    { title: 'Step 3', description: 'Confirm and send' }
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
