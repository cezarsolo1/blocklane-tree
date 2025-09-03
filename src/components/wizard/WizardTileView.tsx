/**
 * Wizard Tile View
 * 
 * Tile-based navigation for decision tree wizard.
 * Based on legacy TreeGrid.tsx with English translations.
 */

import { DecisionNode } from '@/types/decision-tree';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Bath, 
  ChefHat, 
  Flame, 
  Droplets, 
  DoorOpen, 
  Zap,
  AlertTriangle,
  Building,
  Home
} from 'lucide-react';

interface WizardTileViewProps {
  choices: Array<{ index: number; node: DecisionNode; title: string }>;
  onChoiceSelect: (choiceIndex: number) => void;
  selectedChoice?: number;
  className?: string;
}

const getIconForNode = (nodeId: string, title: string) => {
  const key = nodeId.toLowerCase();
  const titleLower = title.toLowerCase();
  
  if (key.includes('bathroom') || titleLower.includes('bathroom') || titleLower.includes('toilet')) return Bath;
  if (key.includes('kitchen') || titleLower.includes('kitchen')) return ChefHat;
  if (key.includes('heating') || titleLower.includes('heating') || titleLower.includes('boiler')) return Flame;
  if (key.includes('water') || titleLower.includes('water') || titleLower.includes('leak')) return Droplets;
  if (key.includes('doors') || key.includes('door') || titleLower.includes('door') || titleLower.includes('garage')) return DoorOpen;
  if (key.includes('electricity') || key.includes('electrical') || titleLower.includes('electrical') || titleLower.includes('power')) return Zap;
  if (key.includes('emergency') || titleLower.includes('emergency') || titleLower.includes('fire')) return AlertTriangle;
  if (key.includes('common') || titleLower.includes('common') || titleLower.includes('elevator') || titleLower.includes('lift')) return Building;
  return Home;
};

export const WizardTileView = ({ choices, onChoiceSelect, selectedChoice, className }: WizardTileViewProps) => {
  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8",
      className
    )}>
      {choices.map((choice) => {
        const Icon = getIconForNode(choice.node.node_id, choice.title);
        const isSelected = selectedChoice === choice.index;
        const isEmergency = choice.node.node_id.includes('emergency') || choice.title.toLowerCase().includes('emergency');

        return (
          <Card
            key={choice.node.node_id}
            className={cn(
              "group cursor-pointer transition-all duration-75 rounded-lg shadow-none",
              // Default state
              "bg-gray-50 border border-gray-200 text-gray-700",
              // Hover state - only apply if not selected
              !isSelected && "hover:bg-gray-100 hover:border-gray-300 hover:text-gray-800 hover:shadow-sm hover:scale-105",
              // Selected state - maintain blue on hover
              isSelected && "bg-[#0052FF] border-[#0052FF] text-white hover:bg-[#0052FF] hover:border-[#0052FF] hover:scale-105",
              "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
            )}
            onClick={() => onChoiceSelect(choice.index)}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8 text-center h-32 md:h-36">
              <div
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-full mb-4",
                  // Default circle background
                  "bg-gray-100",
                  // Hover circle background - only if not selected
                  !isSelected && "group-hover:bg-gray-200",
                  // Selected circle background (transparent to let blue shine through)
                  isSelected && "bg-transparent"
                )}
              >
                {isEmergency ? (
                  <AlertTriangle className={cn(
                    "h-10 w-10",
                    isSelected ? "text-white" : "text-gray-600 group-hover:text-gray-700"
                  )} />
                ) : (
                  <Icon className={cn(
                    "h-10 w-10",
                    isSelected ? "text-white" : "text-gray-600 group-hover:text-gray-700"
                  )} />
                )}
              </div>

              <h3 className={cn(
                "text-sm md:text-base font-medium leading-relaxed",
                isSelected ? "text-white" : "text-gray-700 group-hover:text-gray-800"
              )}>
                {choice.title}
              </h3>

            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
