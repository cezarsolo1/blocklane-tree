/**
 * Title Helper Utilities
 * 
 * Handles both string and LocalizedText titles for backward compatibility
 */

import { LocalizedText } from '@/types/decision-tree';

export function getNodeTitle(title: string | LocalizedText, lang: 'en' | 'nl' = 'en'): string {
  if (typeof title === 'string') {
    return title;
  }
  
  if (title && typeof title === 'object') {
    return title[lang] || title.en || title.nl || 'Untitled';
  }
  
  return 'Untitled';
}

export function hasLocalizedTitle(title: string | LocalizedText): title is LocalizedText {
  return typeof title === 'object' && title !== null && ('en' in title || 'nl' in title);
}
