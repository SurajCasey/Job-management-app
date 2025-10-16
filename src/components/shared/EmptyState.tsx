import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="p-12 flex flex-col justify-center items-center ">
      <div className="mb-6 text-gray-300">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
