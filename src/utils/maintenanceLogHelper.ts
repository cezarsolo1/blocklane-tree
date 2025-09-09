/**
 * Client helper functions for maintenance logs
 */

import { submitMaintenanceLog } from '../modules/api/maintenanceLogs';
import type { MaintenanceLogInput } from '../types/maintenance';
import type { LeafNode } from '../types/decision-tree';
import type { ContactFormData } from '../pages/ContactDetails';
import type { UploadedPhoto } from '../components/wizard/PhotoDropzone';

/**
 * Save final wizard step data as a maintenance log
 */
export async function saveFinalStepLog(
  leafNode: LeafNode,
  breadcrumbs: Array<{ nodeId: string; title: string }>,
  description: string,
  photos: UploadedPhoto[],
  contactData?: ContactFormData,
  customAnswers?: Record<string, any>
): Promise<void> {
  const logData: MaintenanceLogInput = {
    issue_leaf_id: leafNode.node_id,
    issue_path: breadcrumbs.map(b => b.title),
    issue_title: typeof leafNode.title === 'string' ? leafNode.title : leafNode.title.nl || leafNode.title.en,
    description: description || undefined,
    photos: photos.map(p => p.previewUrl).filter(Boolean),
    extra: {
      leaf_type: leafNode.leaf_type,
      leaf_reason: leafNode.leaf_reason,
      contactData,
      customAnswers,
      breadcrumbs,
      timestamp: new Date().toISOString()
    }
  };

  await submitMaintenanceLog(logData);
}
