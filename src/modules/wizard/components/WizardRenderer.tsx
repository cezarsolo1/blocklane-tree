/**
 * WizardRenderer Component
 * 
 * Main wizard renderer that handles different node types.
 * Based on spec section 1.2 - Wizard UI Renderer.
 */

import { DecisionNode, WizardState, DecisionTree } from '@/types/decision-tree';
import { TreeGrid } from './TreeGrid';
import { VideoCheckNode } from './VideoCheckNode';
import { LeafNode } from './LeafNode';
import { Breadcrumbs } from './Breadcrumbs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { DescribeMedia } from '@/pages/DescribeMedia';
import { ContactQuestions } from '@/pages/ContactQuestions';
import { Review } from '@/pages/Review';
import { Submitted } from '@/pages/Submitted';

interface WizardRendererProps {
  state: WizardState;
  tree: DecisionTree;
  onNavigate: (path: string[]) => void;
  onNodeSelect: (node: DecisionNode) => void;
  onVideoOutcome: (outcome: 'yes' | 'no') => void;
  onLeafContinue: () => void;
  onBack: () => void;
  onMyOptionMissing: () => void;
  onDescribeMediaSubmit: (data: { description: string; photos: File[] }) => void;
  onContactQuestionsSubmit: (data: { contact: any; answers: any }) => void;
  onReviewSubmit: () => void;
  onNewTicket: () => void;
  currentTicketId?: string;
  className?: string;
}

export const WizardRenderer = ({
  state,
  tree,
  onNavigate,
  onNodeSelect,
  onVideoOutcome,
  onLeafContinue,
  onBack,
  onMyOptionMissing,
  onDescribeMediaSubmit,
  onContactQuestionsSubmit,
  onReviewSubmit,
  onNewTicket,
  currentTicketId,
  className
}: WizardRendererProps) => {
  const { current_node, path } = state;
  const breadcrumbs = path.map((segment, index) => {
    const nodePath = path.slice(0, index + 1);
    // TODO: Get actual node title from engine
    return {
      label: segment,
      path: nodePath
    };
  });

  const canGoBack = path.length > 0;
  const showMyOptionMissing = current_node.type === 'branch' && 
    current_node.children.some(childId => {
      const child = tree.nodes[childId];
      return child && child.type === 'leaf';
    });

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <Breadcrumbs 
          items={breadcrumbs} 
          onNavigate={onNavigate}
          className="mb-4"
        />
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {current_node.title.en}
          </h1>
          
          {canGoBack && (
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {current_node.type === 'branch' && (
          <>
            <TreeGrid
              node={current_node}
              tree={tree}
              onItemClick={onNodeSelect}
              selectedNode={state.selected_choice ? 
                tree.nodes[state.selected_choice] : 
                undefined
              }
            />
            
            {showMyOptionMissing && (
              <div className="flex justify-center">
                <Button
                  onClick={onMyOptionMissing}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <HelpCircle className="h-4 w-4" />
                  My option is missing
                </Button>
              </div>
            )}
          </>
        )}

        {current_node.type === 'video_check' && (
          <VideoCheckNode
            node={current_node}
            onOutcome={onVideoOutcome}
          />
        )}

        {current_node.type === 'leaf' && (
          <LeafNode
            node={current_node}
            onContinue={onLeafContinue}
          />
        )}

        {/* Flow Pages */}
        {state.flow_state === 'describe_media' && currentTicketId && (
          <DescribeMedia
            ticketId={currentTicketId}
            requiredFields={state.current_node.type === 'leaf' ? state.current_node.required_fields : []}
            onNext={onDescribeMediaSubmit}
            onBack={onBack}
          />
        )}

        {state.flow_state === 'contact_questions' && currentTicketId && (
          <ContactQuestions
            ticketId={currentTicketId}
            questionGroups={state.current_node.type === 'leaf' ? state.current_node.question_groups : []}
            onNext={onContactQuestionsSubmit}
            onBack={onBack}
          />
        )}

        {state.flow_state === 'review' && currentTicketId && (
          <Review
            ticketId={currentTicketId}
            flowData={state.flow_data}
            onNext={onReviewSubmit}
            onBack={onBack}
          />
        )}

        {state.flow_state === 'submitted' && (
          <Submitted
            onNewTicket={onNewTicket}
          />
        )}
      </div>
    </div>
  );
};
