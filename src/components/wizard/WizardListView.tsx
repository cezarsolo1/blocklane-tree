/**
 * Wizard Cascading Menu View
 * 
 * Dropdown-based navigation for decision tree wizard.
 * Uses same navigation logic as Tile view but renders with dynamic dropdown levels.
 */

import { DecisionNode } from '@/types/decision-tree';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardCascadingMenuViewProps {
  breadcrumbs: Array<{ nodeId: string; title: string }>;
  choices: Array<{ index: number; node: DecisionNode; title: string }>;
  onChoiceSelect: (choiceIndex: number) => void;
  onBreadcrumbClick: (nodeId: string) => void;
  selectedChoice?: number;
  className?: string;
}

interface Level {
  nodeId: string;
  title: string;
  selectedValue: string;
  selectedLabel: string;
  isCompleted: boolean;
  availableChoices?: Array<{ index: number; node: DecisionNode; title: string }>;
}

export const WizardListView = ({
  breadcrumbs,
  choices,
  onChoiceSelect,
  onBreadcrumbClick,
  selectedChoice,
  className
}: WizardCascadingMenuViewProps) => {
  // Build levels from breadcrumbs - each represents a navigation step
  const levels: Level[] = [];
  
  // Skip the root breadcrumb (first one) and add completed levels
  for (let i = 1; i < breadcrumbs.length - 1; i++) {
    const breadcrumb = breadcrumbs[i];
    const nextBreadcrumb = breadcrumbs[i + 1];
    
    levels.push({
      nodeId: breadcrumb.nodeId,
      title: breadcrumb.title,
      selectedValue: nextBreadcrumb.nodeId,
      selectedLabel: nextBreadcrumb.title,
      isCompleted: true
    });
  }
  
  // Add current level if we have choices available
  if (choices.length > 0) {
    const currentBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
    const selectedChoice_ = selectedChoice !== undefined ? choices[selectedChoice] : undefined;
    const isEndNode = selectedChoice_ && selectedChoice_.node.type === 'leaf';
    
    if (isEndNode) {
      // For end nodes, show as completed level
      levels.push({
        nodeId: currentBreadcrumb.nodeId,
        title: currentBreadcrumb.title,
        selectedValue: selectedChoice_.node.node_id,
        selectedLabel: selectedChoice_.title,
        isCompleted: true
      });
    } else {
      // For non-end nodes, show as current level with dropdown
      levels.push({
        nodeId: currentBreadcrumb.nodeId,
        title: currentBreadcrumb.title,
        selectedValue: selectedChoice_?.node.node_id || '',
        selectedLabel: selectedChoice_?.title || '',
        isCompleted: false,
        availableChoices: choices
      });
    }
  }

  const handleLevelChange = (levelIndex: number, selectedNodeId: string) => {
    const level = levels[levelIndex];
    if (level.availableChoices) {
      const choice = level.availableChoices.find(
        (c: { index: number; node: DecisionNode; title: string }) => c.node.node_id === selectedNodeId
      );
      if (choice) {
        onChoiceSelect(choice.index);
      }
    }
  };

  const handleChangeLevel = (levelIndex: number) => {
    const level = levels[levelIndex];
    onBreadcrumbClick(level.nodeId);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {levels.map((level, levelIndex) => (
        <div key={`${level.nodeId}-${levelIndex}`}>
          {level.isCompleted ? (
            // Completed level - show selected value with change link
            <div className="flex items-center justify-between p-4 bg-[#0052FF] border border-[#0052FF] text-white rounded-lg min-h-[60px]">
              <div className="flex items-center gap-3">
                <span className="font-medium">{level.title}:</span>
                <span>{level.selectedLabel}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleChangeLevel(levelIndex)}
                className="text-white hover:text-white hover:bg-white/20 text-sm"
              >
                Change
              </Button>
            </div>
          ) : (
            // Current level - show dropdown
            <div className="space-y-2">
              <div className="text-base font-medium text-gray-900">
                {level.title}
              </div>
              <Select 
                value={level.selectedValue} 
                onValueChange={(nodeId) => handleLevelChange(levelIndex, nodeId)}
              >
                <SelectTrigger className="w-full h-12 bg-gray-50 border border-gray-200 hover:bg-gray-100 focus:bg-white focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20">
                  <SelectValue placeholder="Choose an option..." />
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  {level.availableChoices?.map((choice) => (
                    <SelectItem
                      key={choice.node.node_id}
                      value={choice.node.node_id}
                      className="cursor-pointer hover:bg-gray-50 focus:bg-[#0052FF] focus:text-white data-[highlighted]:bg-[#0052FF] data-[highlighted]:text-white"
                    >
                      {choice.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
