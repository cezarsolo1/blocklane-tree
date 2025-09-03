/**
 * MyOptionMissing Component
 * 
 * Shows "My option is missing" button only when current node has leaf children.
 * Based on spec section 2.5 - "My option is missing" rule.
 */

import { DecisionNode, DecisionTree } from '@/types/decision-tree';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

interface MyOptionMissingProps {
  node: DecisionNode;
  tree: DecisionTree;
  onClick: () => void;
}

export const MyOptionMissing = ({ node, tree, onClick }: MyOptionMissingProps) => {
  // Show only when current node has leaf children
  const hasLeafChildren = node.type === 'branch' && 
    node.children.some(childId => {
      const child = tree.nodes[childId];
      return child && child.type === 'leaf';
    });

  if (!hasLeafChildren) {
    return null;
  }

  return (
    <div className="flex justify-center mt-6">
      <Button
        onClick={onClick}
        variant="outline"
        className="flex items-center gap-2"
      >
        <HelpCircle className="h-4 w-4" />
        My option is missing
      </Button>
    </div>
  );
};
