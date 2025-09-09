export type AdditionalDetails = unknown; // heterogeneous; keep flexible

export interface MaintenanceLogInput {
  issue_leaf_id: string;
  issue_path: string[];     // breadcrumb labels
  issue_title: string;      // human readable
  description?: string;
  photos?: string[];        // public URLs
  extra?: AdditionalDetails;// any shape from final leaf
  submitted_by?: string;    // optional user id
}

export interface MaintenanceLog extends MaintenanceLogInput {
  id: string;
  submitted_at: string;
  status: 'submitted' | 'in_review' | 'scheduled' | 'resolved';
}
