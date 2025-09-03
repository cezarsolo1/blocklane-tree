import { MaintenanceItem } from '../../packages/core/types';
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
  AlertTriangle
} from 'lucide-react';

interface TreeGridProps {
  items: MaintenanceItem[];
  onItemClick: (item: MaintenanceItem) => void;
  selectedItem?: MaintenanceItem;
  className?: string;
}

const getIconForKey = (key: string) => {
  if (key.includes('bathroom')) return Bath;
  if (key.includes('kitchen')) return ChefHat;
  if (key.includes('heating')) return Flame;
  if (key.includes('water')) return Droplets;
  if (key.includes('doors')) return DoorOpen;
  if (key.includes('electricity')) return Zap;
  return Wrench;
};

/**
 * Clean tiles:
 * - All tiles: neutral styling
 * - Selected tile: ring + subtle primary bg
 * - No end-page hints (no “Beschrijving vereist”, emojis, etc.)
 */
export const TreeGrid = ({ items, onItemClick, selectedItem, className }: TreeGridProps) => {
  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
      className
    )}>
      {items.map((item) => {
        const Icon = getIconForKey(item.key);
        const isSelected = selectedItem?.key === item.key;
        const isLeaf = item.type === 'leaf';

        return (
          <Card
            key={item.key}
            className={cn(
              "cursor-pointer transition-all duration-200 bg-[#3E5370] text-white hover:bg-[#32455a] focus-visible:ring-[#3E5370] border-[#3E5370]",
              isSelected && "ring-2 ring-[#3E5370] ring-offset-2 border-[#32455a]"
            )}
            onClick={() => onItemClick(item)}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full mb-3",
                  // White icon background with grey-blue text to maintain contrast
                  "bg-white/20 text-white"
                )}
              >
                {isLeaf && item.key.includes('emergency') ? (
                  <AlertTriangle className="h-6 w-6" />
                ) : (
                  <Icon className="h-6 w-6" />
                )}
              </div>

              <h3 className="text-sm font-medium text-white">
                {item.label}
              </h3>

              {/* No extra leaf hints under tiles */}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
