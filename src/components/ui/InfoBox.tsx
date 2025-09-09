import React from 'react';
import { cn } from '@/lib/utils';

interface InfoBoxProps {
  title: string;
  body: string | React.ReactNode;
  actions?: (string | React.ReactNode)[];
  footerNote?: string;
  variant?: 'warning' | 'info' | 'success' | 'error';
  className?: string;
}

const variantStyles = {
  warning: {
    background: 'bg-amber-50',
    border: 'border-amber-200',
    titleColor: 'text-amber-900',
    bodyColor: 'text-amber-800',
    footerColor: 'text-amber-600'
  },
  info: {
    background: 'bg-blue-50',
    border: 'border-blue-200',
    titleColor: 'text-blue-900',
    bodyColor: 'text-blue-800',
    footerColor: 'text-blue-600'
  },
  success: {
    background: 'bg-green-50',
    border: 'border-green-200',
    titleColor: 'text-green-900',
    bodyColor: 'text-green-800',
    footerColor: 'text-green-600'
  },
  error: {
    background: 'bg-red-50',
    border: 'border-red-200',
    titleColor: 'text-red-900',
    bodyColor: 'text-red-800',
    footerColor: 'text-red-600'
  }
};

const actionIcons = {
  warning: '⚠️',
  info: '💡',
  success: '✅',
  error: '❌'
};

export const InfoBox: React.FC<InfoBoxProps> = ({
  title,
  body,
  actions = [],
  footerNote,
  variant = 'info',
  className
}) => {
  const styles = variantStyles[variant];
  const icon = actionIcons[variant];

  const renderBody = () => {
    if (typeof body === 'string') {
      // Split by double newlines for paragraphs, then handle single newlines within paragraphs
      const paragraphs = body.split('\\n\\n');
      return paragraphs.map((paragraph, index) => {
        if (paragraph.trim() === '---') {
          return <hr key={index} className="my-4 border-gray-300" />;
        }
        
        // Handle single newlines within paragraphs and markdown-style bold text
        const formattedText = paragraph
          .replace(/\\n/g, '<br />')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        return (
          <p 
            key={index} 
            className={cn("mb-3 last:mb-0", styles.bodyColor)}
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        );
      });
    }
    return body;
  };

  return (
    <div className={cn(
      "rounded-2xl border p-6 shadow-sm",
      styles.background,
      styles.border,
      className
    )}>
      {/* Title */}
      <h3 className={cn(
        "text-xl font-semibold mb-4",
        styles.titleColor
      )}>
        {title}
      </h3>

      {/* Body Content */}
      <div className="mb-4">
        {renderBody()}
      </div>

      {/* Actions Section */}
      {actions.length > 0 && (
        <div className="mb-4">
          <h4 className={cn(
            "font-semibold mb-3",
            styles.titleColor
          )}>
            Wat kunt u doen?
          </h4>
          <ul className="space-y-2">
            {actions.map((action, index) => (
              <li key={index} className={cn(
                "flex items-start gap-2",
                styles.bodyColor
              )}>
                <span className="text-sm mt-0.5 flex-shrink-0">🔧</span>
                <span className="text-sm leading-relaxed">
                  {typeof action === 'string' ? action : action}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer Note */}
      {footerNote && (
        <div className="pt-3 border-t border-gray-200">
          <p className={cn(
            "text-xs leading-relaxed flex items-start gap-2",
            styles.footerColor
          )}>
            <span className="flex-shrink-0">{icon}</span>
            <span>{footerNote}</span>
          </p>
        </div>
      )}
    </div>
  );
};
