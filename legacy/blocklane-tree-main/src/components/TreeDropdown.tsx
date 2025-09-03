import { useEffect, useMemo, useState } from 'react';
import { MaintenanceItem } from '../../packages/core/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronRight } from 'lucide-react';

interface TreeDropdownProps {
  items: MaintenanceItem[];
  onItemClick: (item: MaintenanceItem) => void;
  selectedItem?: MaintenanceItem;
  placeholder?: string;
}

/**
 * Shows the picked label even if the current items array changes (e.g. after a leaf click).
 * When the selected value no longer exists in `items`, we:
 *  - keep a cached `selectedLabel`
 *  - set <Select value=""> so <SelectValue> renders the placeholder
 *  - set the placeholder to the cached label
 */
export const TreeDropdown = ({
  items,
  onItemClick,
  selectedItem,
  placeholder = 'Kies een optie...',
}: TreeDropdownProps) => {
  const [selectedValue, setSelectedValue] = useState<string>(selectedItem?.key || '');
  const [selectedLabel, setSelectedLabel] = useState<string>(selectedItem?.label || '');

  // Sync internal state when parent changes selectedItem
  useEffect(() => {
    if (selectedItem) {
      setSelectedValue(selectedItem.key);
      setSelectedLabel(selectedItem.label);
    } else {
      setSelectedValue('');
      // keep last selectedLabel for display fallback
    }
  }, [selectedItem?.key, selectedItem?.label]);

  // Is the current value present in the current items list?
  const hasMatchingItem = useMemo(
    () => items.some((i) => i.key === selectedValue),
    [items, selectedValue]
  );

  const displayValue = hasMatchingItem ? selectedValue : '';
  const displayPlaceholder = hasMatchingItem ? placeholder : (selectedLabel || placeholder);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    const item = items.find((i) => i.key === value);
    if (item) {
      setSelectedLabel(item.label);
      onItemClick(item);
    }
  };

  return (
    <Select value={displayValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={displayPlaceholder} />
        <ChevronRight className="h-4 w-4 opacity-50" />
      </SelectTrigger>
      <SelectContent className="bg-background border border-border shadow-md">
        {items.map((item) => (
          <SelectItem
            key={item.key}
            value={item.key}
            className="cursor-pointer bg-[#3E5370] text-white hover:bg-[#32455a] hover:text-white"
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
