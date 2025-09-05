/**
 * TreeGrid Component
 * 
 * Renders decision tree nodes as a grid of tiles.
 * Based on legacy TreeGrid.tsx but adapted for new decision tree structure.
 */

import { DecisionNode, DecisionTree } from '@/types/decision-tree';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Bath, 
  ChefHat, 
  Flame, 
  Droplets, 
  DoorOpen, 
  Zap,
  Wrench,
  AlertTriangle,
  Video
} from 'lucide-react';

interface TreeGridProps {
  node: DecisionNode;
  tree: DecisionTree;
  onItemClick: (node: DecisionNode) => void;
  selectedNode?: DecisionNode;
  className?: string;
}

const getIconForNode = (node: DecisionNode) => {
  const nodeId = node.node_id.toLowerCase();
  
  if (node.type === 'video_check') return Video;
  if (nodeId.includes('bathroom') || nodeId.includes('toilet')) return Bath;
  if (nodeId.includes('kitchen')) return ChefHat;
  if (nodeId.includes('heating') || nodeId.includes('boiler')) return Flame;
  if (nodeId.includes('water') || nodeId.includes('leak')) return Droplets;
  if (nodeId.includes('door') || nodeId.includes('access')) return DoorOpen;
  if (nodeId.includes('electric') || nodeId.includes('power')) return Zap;
  if (node.type === 'leaf' && node.leaf_reason === 'emergency') return AlertTriangle;
  
  return Wrench;
};

/**
 * Clean tiles:
 * - All tiles: neutral styling
 * - Selected tile: ring + subtle primary bg
 * - No end-page hints (no "Description required", emojis, etc.)
 */
export const TreeGrid = ({ node, tree, onItemClick, selectedNode, className }: TreeGridProps) => {
  // Only render grid for branch nodes
  if (node.type !== 'branch') {
    return null;
  }

  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
      className
    )}>
      {node.children.map((childId) => {
        const child = tree.nodes[childId];
        if (!child) return null;
        
        const Icon = getIconForNode(child);
        const isSelected = selectedNode?.node_id === child.node_id;
        const isLeaf = child.type === 'leaf';
        const isVideoCheck = child.type === 'video_check';

        return (
          <Card
            key={child.node_id}
            className={cn(
              "cursor-pointer transition-all duration-200 bg-[#3E5370] text-white hover:bg-[#32455a] focus-visible:ring-[#3E5370] border-[#3E5370]",
              isSelected && "ring-2 ring-[#3E5370] ring-offset-2 border-[#32455a]"
            )}
            onClick={() => onItemClick(child)}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full mb-3",
                  // White icon background with grey-blue text to maintain contrast
                  "bg-white/20 text-white"
                )}
              >
                {isLeaf && child.leaf_reason === 'emergency' ? (
                  <AlertTriangle className="h-6 w-6" />
                ) : isVideoCheck ? (
                  <Video className="h-6 w-6" />
                ) : (
                  <Icon className="h-6 w-6" />
                )}
              </div>

              <h3 className="text-sm font-medium text-white">
                {typeof child.title === 'string' ? child.title : child.title.en}
              </h3>

              {/* No extra leaf hints under tiles */}
            </CardContent>
          </Card>
        );
      }).filter(Boolean)}
    </div>
  );
};
