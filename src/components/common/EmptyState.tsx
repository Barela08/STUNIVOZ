import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="py-12 px-4 text-center">
    {icon && (
      <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);
