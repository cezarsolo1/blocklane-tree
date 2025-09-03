import maintenanceData from '../../packages/core/maintenance.json';
import { MaintenanceItem, TreeNode, LeafNode } from '../../packages/core/types';

export const getMaintenanceTree = (): MaintenanceItem => {
  return maintenanceData as MaintenanceItem;
};

// Find a node by a path like ["common_areas","lift"] or ["common_areas","lift","total_outage"]
export const findNodeByPath = (path: string[]): MaintenanceItem | null => {
  let currentNode: MaintenanceItem = getMaintenanceTree();

  if (!Array.isArray(path) || path.length === 0) return currentNode;

  for (let depth = 0; depth < path.length; depth++) {
    const seg = path[depth];

    if (currentNode.type === 'leaf' || !('children' in currentNode)) {
      return null; // can't go deeper from a leaf
    }

    // Match child by the segment at THIS depth
    const next = currentNode.children.find((child) => {
      const childSegs = String(child.key).split('.').filter(Boolean);
      return childSegs[depth] === seg;
    });

    if (!next) return null;
    currentNode = next;
  }

  return currentNode;
};

export const getPathSegments = (key: string): string[] => {
  return key.split('.');
};

export const getParentPath = (path: string[]): string[] => {
  return path.slice(0, -1);
};

export const getBreadcrumbs = (path: string[]): { label: string; path: string[] }[] => {
  const breadcrumbs = [{ label: 'Start', path: [] }];
  
  let currentPath: string[] = [];
  for (const segment of path) {
    currentPath = [...currentPath, segment];
    const node = findNodeByPath(currentPath);
    if (node) {
      breadcrumbs.push({
        label: node.label,
        path: [...currentPath]
      });
    }
  }
  
  return breadcrumbs;
};

export const searchNodes = (query: string, node?: MaintenanceItem): MaintenanceItem[] => {
  const searchInNode = node || getMaintenanceTree();
  const results: MaintenanceItem[] = [];
  
  const searchRecursive = (currentNode: MaintenanceItem) => {
    if (currentNode.label.toLowerCase().includes(query.toLowerCase())) {
      results.push(currentNode);
    }
    
    if (currentNode.type === 'menu') {
      currentNode.children.forEach(child => {
        searchRecursive(child);
      });
    }
  };
  
  if (searchInNode.type === 'menu') {
    searchInNode.children.forEach(child => {
      searchRecursive(child);
    });
  }
  
  return results;
};

// Convert an array of path segments into the user-facing labels (any depth)
export const keysToLabels = (path: string[]): string[] => {
  const labels: string[] = [];
  let node: MaintenanceItem = getMaintenanceTree();

  for (let depth = 0; depth < path.length; depth++) {
    const seg = path[depth];

    if (node.type === 'leaf' || !('children' in node)) break;

    const child = node.children.find((c) => {
      const childSegs = String(c.key).split('.').filter(Boolean);
      return childSegs[depth] === seg;
    });

    if (!child) break;

    labels.push(child.label);
    node = child;
  }

  return labels;
};

export const hasLeafChildren = (node: MaintenanceItem | null): boolean => {
  if (!node || node.type === 'leaf') return false;
  return node.children.some(child => child.type === 'leaf');
};