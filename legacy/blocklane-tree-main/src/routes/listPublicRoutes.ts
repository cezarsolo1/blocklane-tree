import type { RouteObject } from "react-router-dom";
import { routeConfig } from "@/routes/router";

function collectPaths(routes: RouteObject[] | undefined): string[] {
  if (!routes) return [];
  const out: string[] = [];
  
  for (const r of routes) {
    if (r.path) {
      // Filter: exclude params/wildcards (e.g., /:id, /*, /a/:b)
      const isParamOrWildcard = /[:*]/.test(r.path);
      
      if (!isParamOrWildcard) {
        out.push(r.path);
      }
    }
  }
  
  return out;
}

/** Return sorted, de-duplicated, concrete routes */
export function getConcreteRoutes(): string[] {
  const all = collectPaths(routeConfig);
  // De-dupe + sort (stable alphabetical for predictable order)
  return Array.from(new Set(all)).sort((a, b) => a.localeCompare(b));
}