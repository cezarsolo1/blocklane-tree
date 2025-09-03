/**
 * Wizard Renderer
 * 
 * Main wizard component that orchestrates the two view modes:
 * - Tile View: Visual grid of options
 * - Search View: Search-based navigation
 */

import { useState, useCallback } from 'react';
import { DecisionNode, VideoCheckNode, LeafNode } from '@/types/decision-tree';
import { WizardNavigator } from '@/modules/decision-tree';
import { WizardTileView } from './WizardTileView';
import { WizardVideoCheck } from './WizardVideoCheck';
import { WizardVideoResolvedPage } from './WizardVideoResolvedPage';
import { WizardTenantResponsibilityPage } from './WizardTenantResponsibilityPage';
import { WizardEmergencyPage } from './WizardEmergencyPage';
import { WizardTicketFlow } from './WizardTicketFlow';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardRendererProps {
  navigator: WizardNavigator;
  onMissingOption?: () => void;
  onStepChange?: (step: number) => void;
  onProgressBarVisibilityChange?: (visible: boolean) => void;
  className?: string;
}

export const WizardRenderer = ({
  navigator,
  onMissingOption,
  onStepChange,
  onProgressBarVisibilityChange,
  className
}: WizardRendererProps) => {
  const [selectedChoice, setSelectedChoice] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedLeafNode, setSelectedLeafNode] = useState<DecisionNode | undefined>();
  const [missingOptionSelected, setMissingOptionSelected] = useState(false);
  const [nextButtonClicked, setNextButtonClicked] = useState(false);
  const [, forceUpdate] = useState({});

  const state = navigator.getCurrentState();
  const currentNode = state.current_node;
  const choices = navigator.getAvailableChoices();
  const breadcrumbs = navigator.getBreadcrumbs();
  const canShowMissingOption = navigator.shouldShowMissingOption();

  // Handle choice selection
  const handleChoiceSelect = useCallback((choiceIndex: number) => {
    const choice = choices[choiceIndex];
    if (!choice) return;

    if (choice.node.type === 'leaf') {
      const leafNode = choice.node as LeafNode;
      
      // Handle end_no_ticket leaves internally (don't call onLeafReached)
      if (leafNode.leaf_type === 'end_no_ticket') {
        // Navigate to the leaf node to show its content
        try {
          navigator.navigateToChild(choiceIndex);
          setSelectedChoice(undefined);
          setSelectedLeafNode(undefined);
          setMissingOptionSelected(false);
          forceUpdate({});
        } catch (error) {
          console.error('Navigation error:', error);
        }
      } else {
        // For start_ticket leaves, select them for the Next button
        setSelectedChoice(choiceIndex);
        setSelectedLeafNode(choice.node);
        setMissingOptionSelected(false);
      }
    } else {
      // For branch nodes, navigate immediately
      try {
        navigator.navigateToChild(choiceIndex);
        setSelectedChoice(undefined);
        setSelectedLeafNode(undefined);
        setMissingOptionSelected(false);
        forceUpdate({});
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }
  }, [choices, navigator]);

  // Handle video check outcome
  const handleVideoOutcome = useCallback((didVideoResolve: boolean) => {
    navigator.handleVideoOutcome(didVideoResolve);
    const newState = navigator.getCurrentState();
    
    if (newState.current_node.type === 'leaf') {
      const leafNode = newState.current_node as LeafNode;
      setSelectedLeafNode(leafNode);
      
      // Log the video check outcome in breadcrumbs for ticket context
      console.log('Video check outcome:', {
        videoResolved: didVideoResolve,
        leafType: leafNode.leaf_type,
        leafReason: leafNode.leaf_reason,
        breadcrumbs: navigator.getBreadcrumbs(),
        path: newState.path
      });
      
      // If video didn't resolve and we reach a start_ticket leaf, 
      // automatically show ticket flow (bypass Next button requirement)
      if (!didVideoResolve && leafNode.leaf_type === 'start_ticket') {
        setNextButtonClicked(true); // Auto-trigger for video outcomes
        onStepChange?.(1); // Move to Step 2 (0-indexed)
        forceUpdate({});
      }
    }
  }, [navigator]);

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = useCallback((nodeId: string) => {
    try {
      navigator.navigateToNode(nodeId);
      setSelectedChoice(undefined);
      setSelectedLeafNode(undefined);
      setMissingOptionSelected(false);
      setNextButtonClicked(false);
      onStepChange?.(0); // Back to Step 1
      forceUpdate({});
    } catch (error) {
      console.error('Breadcrumb navigation error:', error);
    }
  }, [navigator]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    try {
      if (navigator.canGoBack()) {
        navigator.goBack();
        setSelectedChoice(undefined);
        setSelectedLeafNode(undefined);
        setMissingOptionSelected(false);
        setNextButtonClicked(false);
        onStepChange?.(0); // Back to Step 1
        onProgressBarVisibilityChange?.(true); // Show progress bar again
        forceUpdate({});
      }
    } catch (error) {
      console.error('Back navigation error:', error);
    }
  }, [navigator, onStepChange, onProgressBarVisibilityChange]);

  // Handle search input
  const handleSearchInput = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      const results = navigator.searchNodes(query);
      setSearchResults(results.map(result => ({
        node: result.node,
        path: result.path,
        title: result.title,
        canNavigate: result.canNavigate
      })));
    } else {
      setSearchResults([]);
    }
  }, [navigator]);

  // Handle Next button click
  const handleNext = useCallback(() => {
    if (selectedLeafNode) {
      // Log the navigation path for ticket creation context
      console.log('Next button clicked - navigating to Step 2:', {
        leafNode: {
          node_id: selectedLeafNode.node_id,
          leaf_type: (selectedLeafNode as LeafNode).leaf_type,
          leaf_reason: (selectedLeafNode as LeafNode).leaf_reason,
          title: selectedLeafNode.title
        },
        breadcrumbs: navigator.getBreadcrumbs(),
        path: navigator.getCurrentState().path,
        timestamp: new Date().toISOString()
      });
      
      // Set flag to show ticket flow
      setNextButtonClicked(true);
      onStepChange?.(1); // Move to Step 2 (0-indexed)
      forceUpdate({});
      
    } else if (missingOptionSelected) {
      // Create virtual leaf node for missing option
      const virtualLeaf: LeafNode = {
        node_id: `${currentNode.node_id}_missing_option`,
        type: 'leaf',
        title: {
          en: 'My option is missing',
          nl: 'Mijn optie ontbreekt'
        },
        leaf_type: 'start_ticket',
        leaf_reason: 'option_missing'
      };
      
      // Set the virtual leaf as selected and mark Next as clicked
      setSelectedLeafNode(virtualLeaf);
      setNextButtonClicked(true);
      
      // Log the missing option selection
      console.log('Missing option selected - navigating to Step 2:', {
        virtualLeaf,
        breadcrumbs: navigator.getBreadcrumbs(),
        timestamp: new Date().toISOString()
      });
      
      // Update progress to Step 2
      onStepChange?.(1); // Move to Step 2 (0-indexed)
      
      // Force re-render to show ticket flow
      forceUpdate({});
    }
  }, [selectedLeafNode, missingOptionSelected, currentNode, navigator]);

  // Handle search result selection
  const handleSearchResultSelect = useCallback((result: any) => {
    // Clear search after selection
    setSearchQuery('');
    setSearchResults([]);
    
    if (result.node.type === 'leaf') {
      // For leaves, navigate to parent first, then select the leaf
      const parentPath = result.path.slice(0, -1);
      if (parentPath.length > 0) {
        navigator.navigateToNode(parentPath[parentPath.length - 1]);
        // Find the choice index for this leaf
        const updatedChoices = navigator.getAvailableChoices();
        const choiceIndex = updatedChoices.findIndex((c: any) => c.node.node_id === result.node.node_id);
        if (choiceIndex >= 0) {
          handleChoiceSelect(choiceIndex);
        }
      }
    } else {
      // For menu nodes, navigate directly
      navigator.navigateToNode(result.node.node_id);
      setSelectedChoice(undefined);
      setSelectedLeafNode(undefined);
    }
  }, [navigator, handleChoiceSelect]);

  if (!currentNode) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">Wizard Error</h3>
          <p className="text-sm text-muted-foreground">
            Unable to load the maintenance wizard. Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Choices and breadcrumbs are already properly formatted from navigator

  // Check if we can show "My option is missing" button
  const shouldShowMissingButton = canShowMissingOption && onMissingOption;

  return (
    <div className={cn("min-h-[70vh]", className)}>
      {/* Title - only show when no breadcrumb (root step) */}
      {breadcrumbs.length <= 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">
            {typeof currentNode.title === 'string' ? currentNode.title : currentNode.title?.en || 'Maintenance Wizard'}
          </h1>
        </div>
      )}

      {/* Two-row header layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6 flex flex-col gap-3 md:gap-4 mb-4 md:mb-6">
        {/* ROW 1: Back + Search - Only show search in Step 1 (wizard navigation) */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Back */}
          {state.history.length > 1 && (
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Back
            </button>
          )}
          
          {/* Search grows to fill - Only show in Step 1 (not in ticket flow) */}
          {!selectedLeafNode && !nextButtonClicked && currentNode.type !== 'leaf' && (
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute h-4 w-4 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search for your problem..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  className="w-full h-10 md:h-10 rounded-full bg-gray-100 border border-gray-200 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* ROW 2: Breadcrumb */}
        <div className="flex items-center">
          {/* Breadcrumb/status */}
          <div className="text-sm md:text-base text-gray-500 leading-tight truncate">
            {breadcrumbs.length > 1 ? (
              breadcrumbs.map((crumb, index) => (
                <span key={crumb.nodeId}>
                  {index > 0 && <span className="opacity-60 mx-1">→</span>}
                  <button
                    onClick={() => handleBreadcrumbClick(crumb.nodeId)}
                    className="hover:text-gray-700 underline-offset-4 hover:underline transition-colors duration-150"
                  >
                    {crumb.title}
                  </button>
                </span>
              ))
            ) : (
              <span>{typeof currentNode.title === 'string' ? currentNode.title : currentNode.title?.en || 'Maintenance Wizard'}</span>
            )}
          </div>
          
        </div>
      </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Results Overlay - Only show when searching and not in ticket flow */}
          {!selectedLeafNode && !nextButtonClicked && searchQuery.length >= 2 && searchResults.length > 0 && (
            <div className="mb-8 p-5 bg-muted/30 rounded-xl border">
              <div className="text-sm font-medium text-muted-foreground mb-4">
                Search Results ({searchResults.length}):
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={`${result.node.node_id}-${index}`}
                    className="cursor-pointer p-3 rounded-md bg-background hover:bg-muted/50 border transition-colors"
                    onClick={() => handleSearchResultSelect(result)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">
                          {result.title}
                        </h4>
                        {result.path.length > 1 && (
                          <div className="text-xs text-muted-foreground truncate mt-1">
                            Path: {result.path.slice(1).join(' → ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main View Content - Only show when NOT searching */}
          {searchQuery.length < 2 && (
            <>
              {/* Selected Start Ticket Leaf - Show ticket flow only if from video check or Next button clicked */}
              {selectedLeafNode && (selectedLeafNode as LeafNode).leaf_type === 'start_ticket' && 
               (selectedLeafNode.node_id.includes('_outcome_') || nextButtonClicked) ? (
                <WizardTicketFlow
                  leafNode={selectedLeafNode as LeafNode}
                  breadcrumbs={breadcrumbs.map(b => ({ nodeId: b.nodeId || '', title: b.title || '' }))}
                  onBack={() => {
                    setSelectedLeafNode(undefined);
                    setMissingOptionSelected(false);
                    setNextButtonClicked(false);
                    onStepChange?.(0); // Back to Step 1
                    forceUpdate({});
                  }}
                  onComplete={() => {
                    // Reset wizard to start
                    navigator.reset();
                    setSelectedChoice(undefined);
                    setSelectedLeafNode(undefined);
                    setMissingOptionSelected(false);
                    setNextButtonClicked(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    onStepChange?.(0); // Back to Step 1
                    forceUpdate({});
                  }}
                  onStepChange={onStepChange}
                />
              ) : (
                <>
                  {/* Video Check Node */}
                  {currentNode.type === 'video_check' && (
                    <WizardVideoCheck
                      node={currentNode as VideoCheckNode}
                      onOutcome={handleVideoOutcome}
                    />
                  )}

                  {/* Leaf Node */}
                  {currentNode.type === 'leaf' && (
                <>
                  {/* Start Ticket Flow */}
                  {(currentNode as LeafNode).leaf_type === 'start_ticket' ? (
                    <WizardTicketFlow
                      leafNode={currentNode as LeafNode}
                      breadcrumbs={breadcrumbs.map(b => ({ nodeId: b.nodeId || '', title: b.title || '' }))}
                      onBack={handleBack}
                      onComplete={() => {
                        // Reset wizard to start
                        navigator.reset();
                        setSelectedChoice(undefined);
                        setSelectedLeafNode(undefined);
                        setMissingOptionSelected(false);
                        setSearchQuery('');
                        setSearchResults([]);
                        forceUpdate({});
                      }}
                    />
                  ) : (currentNode as LeafNode).leaf_reason === 'emergency' ? (
                    <>
                      {onProgressBarVisibilityChange?.(false)}
                      <WizardEmergencyPage
                        node={currentNode as LeafNode}
                        onBack={handleBack}
                      />
                    </>
                  ) : (currentNode as LeafNode).leaf_reason === 'tenant_responsibility' ? (
                    <>
                      {onProgressBarVisibilityChange?.(false)}
                      <WizardTenantResponsibilityPage
                        node={currentNode as LeafNode}
                        onBack={handleBack}
                      />
                    </>
                  ) : (currentNode as LeafNode).leaf_reason === 'video_resolved' ? (
                    <>
                      {onProgressBarVisibilityChange?.(false)}
                      <WizardVideoResolvedPage />
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">
                          {typeof currentNode.title === 'string' ? currentNode.title : currentNode.title.en}
                        </h3>
                        <div className="space-y-2">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            Type: {(currentNode as LeafNode).leaf_type}
                          </div>
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 ml-2">
                            Reason: {(currentNode as LeafNode).leaf_reason}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

                  {/* Branch Node - Show choices */}
                  {currentNode.type === 'branch' && choices.length > 0 && (
                    <>
                      <WizardTileView
                        choices={choices}
                        onChoiceSelect={handleChoiceSelect}
                        selectedChoice={selectedChoice}
                      />
                    </>
                  )}
                </>
              )}
            </>
          )}

        </div>

        {/* Sticky footer with actions - Hide only when ticket flow is active, video_resolved or tenant_responsibility pages */}
        {!(selectedLeafNode && (selectedLeafNode as LeafNode).leaf_type === 'start_ticket' && 
           (selectedLeafNode.node_id.includes('_outcome_') || nextButtonClicked)) ? (
          currentNode.type !== 'leaf' || ((currentNode as LeafNode).leaf_reason !== 'video_resolved' && (currentNode as LeafNode).leaf_reason !== 'tenant_responsibility') ? (
          <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-gray-200 mt-8 md:mt-12 px-4 sm:px-6 lg:px-8 py-4 md:py-5">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
              {/* Missing Option Button */}
              {shouldShowMissingButton && (
                <Button
                  variant={missingOptionSelected ? "default" : "outline"}
                  onClick={() => {
                    setMissingOptionSelected(!missingOptionSelected);
                    setSelectedChoice(undefined);
                    setSelectedLeafNode(undefined);
                    setNextButtonClicked(false);
                  }}
                  className={cn(
                    missingOptionSelected && "bg-[#0052FF] text-white hover:bg-blue-600"
                  )}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  My option is missing
                </Button>
              )}
              
              {/* Spacer */}
              <div className="flex-1" />
              
              {/* Next Button */}
              <Button
                onClick={handleNext}
                disabled={!selectedLeafNode && !missingOptionSelected}
                className="bg-[#0052FF] hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-500 ml-auto"
              >
                Next
              </Button>
            </div>
          </div>
          ) : null
        ) : null}
    </div>
  );
};
