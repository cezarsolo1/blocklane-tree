/**
 * Wizard Lookup View
 * 
 * Search-based navigation for decision tree wizard.
 * Allows jumping to any part of the decision tree via search.
 */

import { DecisionNode } from '@/types/decision-tree';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  node: DecisionNode;
  path: string[];
  title: string;
  canNavigate: boolean;
}

interface WizardLookupViewProps {
  searchQuery: string;
  searchResults: SearchResult[];
  onResultSelect: (result: SearchResult) => void;
  className?: string;
}

export const WizardLookupView = ({
  searchQuery,
  searchResults,
  onResultSelect,
  className
}: WizardLookupViewProps) => {

  const handleResultClick = (result: SearchResult) => {
    onResultSelect(result);
  };

  const getBreadcrumbText = (path: string[]): string => {
    return path.slice(1).join(' → '); // Skip root node
  };

  return (
    <div className={cn("space-y-4", className)}>

      {/* Search Instructions */}
      {searchQuery.length === 0 && (
        <div className="text-center py-8">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Search the maintenance wizard
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Type at least 2 characters to search for maintenance issues, rooms, or problems. 
            You can jump directly to any part of the decision tree.
          </p>
        </div>
      )}

      {/* No Results */}
      {searchQuery.length >= 2 && searchResults.length === 0 && (
        <div className="text-center py-8">
          <div className="text-sm text-muted-foreground">
            No results found for "{searchQuery}". Try different keywords like "water", "heating", or "door".
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Search Results ({searchResults.length}):
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.map((result, index) => (
              <Card
                key={`${result.node.node_id}-${index}`}
                className="cursor-pointer transition-all duration-200 hover:bg-muted/50 border-border"
                onClick={() => handleResultClick(result)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium truncate">
                          {result.title}
                        </h4>
                        {result.node.type === 'leaf' && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            final choice
                          </span>
                        )}
                      </div>
                      
                      {result.path.length > 1 && (
                        <div className="text-xs text-muted-foreground truncate">
                          Path: {getBreadcrumbText(result.path)}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 flex-shrink-0"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
