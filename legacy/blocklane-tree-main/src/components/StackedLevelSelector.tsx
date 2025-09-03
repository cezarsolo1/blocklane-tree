import { useState, useEffect } from 'react';
import { MaintenanceItem } from '../../packages/core/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { findNodeByPath, getPathSegments } from '@/lib/tree';

interface StackedLevelSelectorProps {
  currentPath: string[];
  onPathChange: (path: string[]) => void;
  onItemClick: (item: MaintenanceItem) => void;
  selectedItem?: MaintenanceItem;
  searchResults?: MaintenanceItem[];
  isSearching: boolean;
}

interface LevelState {
  path: string[];
  selectedKey: string;
  selectedLabel: string;
  availableItems: MaintenanceItem[];
  isLocked: boolean;
}

export const StackedLevelSelector = ({
  currentPath,
  onPathChange,
  onItemClick,
  selectedItem,
  searchResults = [],
  isSearching,
}: StackedLevelSelectorProps) => {
  const [levelStates, setLevelStates] = useState<LevelState[]>([]);

  // Build level states based on current path
  useEffect(() => {
    const states: LevelState[] = [];
    
    // Build states for each level in the path
    for (let i = 0; i <= currentPath.length; i++) {
      const pathUpToLevel = currentPath.slice(0, i);
      const currentNode = findNodeByPath(pathUpToLevel);
      
      if (!currentNode || currentNode.type === 'leaf') {
        break;
      }
      
      const availableItems = currentNode.children;
      const isLastLevel = i === currentPath.length;
      
      // Check if we have a selected leaf that belongs to this level
      let selectedKey = '';
      let selectedLabel = '';
      let isLocked = !isLastLevel;
      
      if (isLastLevel && selectedItem) {
        // If we have a selected leaf, show it as selected and locked
        selectedKey = selectedItem.key.split('.').pop() || '';
        selectedLabel = selectedItem.label;
        isLocked = true;
      } else if (!isLastLevel) {
        // For non-last levels, show the path selection
        selectedKey = currentPath[i];
        selectedLabel = availableItems.find(item => item.key.split('.').pop() === selectedKey)?.label || '';
        isLocked = true;
      }
      
      states.push({
        path: pathUpToLevel,
        selectedKey: selectedKey,
        selectedLabel: selectedLabel,
        availableItems: availableItems,
        isLocked: isLocked,
      });
    }
    
    setLevelStates(states);
  }, [currentPath, selectedItem]);

  const handleLevelChange = (levelIndex: number, selectedKey: string) => {
    const item = levelStates[levelIndex].availableItems.find(i => i.key.split('.').pop() === selectedKey);
    if (!item) return;

    if (item.type === 'leaf') {
      // Leaf selected - trigger the leaf selection
      onItemClick(item);
    } else {
      // Menu node - update path and navigate deeper
      const newPath = getPathSegments(item.key);
      onPathChange(newPath);
    }
  };

  const handleUnlock = (levelIndex: number) => {
    // Go back to this level by updating the path
    const newPath = levelStates[levelIndex].path;
    onPathChange(newPath);
  };

  const handleSearchResultClick = (item: MaintenanceItem) => {
    // For search results, we need to auto-populate the full path
    if (item.type === 'leaf') {
      // Extract the path from the leaf's key and set the full path
      const fullPath = getPathSegments(item.key);
      const pathToParent = fullPath.slice(0, -1); // Remove the leaf key itself
      onPathChange(pathToParent);
      // Then select the leaf
      setTimeout(() => onItemClick(item), 0);
    } else {
      // For menu nodes, navigate to that level
      const newPath = getPathSegments(item.key);
      onPathChange(newPath);
    }
  };

  // If searching, show search results instead
  if (isSearching && searchResults.length > 0) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Zoekresultaten:
        </div>
        <Select value="" onValueChange={(key) => {
          const item = searchResults.find(i => i.key === key);
          if (item) handleSearchResultClick(item);
        }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecteer een zoekresultaat..." />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border shadow-md">
            {searchResults.map((item) => (
              <SelectItem
                key={item.key}
                value={item.key}
                className="cursor-pointer bg-[#3E5370] text-white hover:bg-[#32455a] hover:text-white"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{item.label}</span>
                  {item.type === 'leaf' && <span className="text-xs opacity-75 ml-2">(eindkeuze)</span>}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (levelStates.length === 0) return null;

  return (
    <div className="space-y-3">
      {levelStates.map((level, levelIndex) => (
        <div key={levelIndex} className="space-y-2">
          {level.isLocked ? (
            // Locked level - show selected value with change link
            <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-md">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Niveau {levelIndex + 1}:</span>
                <span className="text-sm">{level.selectedLabel}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleUnlock(levelIndex)}
                className="text-xs text-primary hover:text-primary-foreground"
              >
                Wijzig
              </Button>
            </div>
          ) : (
            // Active level - show dropdown
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                Niveau {levelIndex + 1}: Maak uw keuze
              </div>
              <Select 
                value={level.selectedKey} 
                onValueChange={(key) => handleLevelChange(levelIndex, key)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Kies een optie..." />
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-md">
                  {level.availableItems.map((item) => (
                    <SelectItem
                      key={item.key}
                      value={item.key.split('.').pop() || ''}
                      className="cursor-pointer bg-[#3E5370] text-white hover:bg-[#32455a] hover:text-white"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{item.label}</span>
                        {item.type === 'leaf' && <span className="text-xs opacity-75 ml-2">(eindkeuze)</span>}
                      </div>
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