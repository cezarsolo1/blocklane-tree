/**
 * LeafNode Component
 * 
 * Renders leaf nodes and handles their outcomes.
 * Based on spec section 2.1 - leaf node type.
 */

import { LeafNode as LeafNodeType } from '@/types/decision-tree';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Wrench,
  ArrowRight
} from 'lucide-react';

interface LeafNodeProps {
  node: LeafNodeType;
  onContinue: () => void;
}

const getLeafIcon = (node: LeafNodeType) => {
  if (node.leaf_reason === 'emergency') return AlertTriangle;
  if (node.leaf_type === 'end_no_ticket') return CheckCircle;
  if (node.leaf_type === 'start_ticket') return Wrench;
  return XCircle;
};

const getLeafMessage = (node: LeafNodeType) => {
  switch (node.leaf_reason) {
    case 'emergency':
      return {
        title: 'Emergency Situation',
        message: 'This appears to be an emergency. Please contact emergency services immediately if needed.',
        action: 'Contact Emergency Services',
        variant: 'destructive' as const
      };
    case 'tenant_responsibility':
      return {
        title: 'Tenant Responsibility',
        message: 'This issue is typically the tenant\'s responsibility to fix. Please handle this yourself.',
        action: 'Understood',
        variant: 'secondary' as const
      };
    case 'video_resolved':
      return {
        title: 'Problem Resolved',
        message: 'Great! The video helped you solve the problem. No ticket needed.',
        action: 'Done',
        variant: 'default' as const
      };
    case 'standard_wizard':
    case 'video_not_resolved':
    case 'option_missing':
      return {
        title: 'Create Maintenance Ticket',
        message: 'Let\'s create a maintenance ticket to get this issue resolved.',
        action: 'Continue to Ticket',
        variant: 'default' as const
      };
    default:
      return {
        title: 'Issue Identified',
        message: 'We\'ve identified your issue. Let\'s proceed with the next steps.',
        action: 'Continue',
        variant: 'default' as const
      };
  }
};

export const LeafNode = ({ node, onContinue }: LeafNodeProps) => {
  const Icon = getLeafIcon(node);
  const message = getLeafMessage(node);
  const isEndNoTicket = node.leaf_type === 'end_no_ticket';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {typeof node.title === 'string' ? node.title : node.title.en}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Message */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">{message.title}</h3>
            <p className="text-gray-600">{message.message}</p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            {isEndNoTicket ? (
              <Button
                onClick={onContinue}
                variant={message.variant}
                className="flex items-center gap-2"
                size="lg"
              >
                {message.action}
              </Button>
            ) : (
              <Button
                onClick={onContinue}
                variant={message.variant}
                className="flex items-center gap-2"
                size="lg"
              >
                {message.action}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Additional Info */}
          {node.leaf_type === 'start_ticket' && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {node.required_fields?.includes('description') && (
                  <li>• Describe the issue in detail</li>
                )}
                {node.required_fields?.includes('photos') && (
                  <li>• Add photos of the problem</li>
                )}
                {node.question_groups?.includes('contact_at_home') && (
                  <li>• Provide contact information</li>
                )}
                {node.question_groups?.includes('entry_permission') && (
                  <li>• Grant entry permission for contractors</li>
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
