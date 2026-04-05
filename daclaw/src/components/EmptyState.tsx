import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  testId?: string;
}

export default function EmptyState({ icon, title, description, action, testId }: EmptyStateProps) {
  return (
    <div
      data-testid={testId}
      className="bg-surface border border-border rounded-xl shadow-sm p-16 flex flex-col items-center gap-4 text-center"
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
          {icon}
        </div>
      )}
      <div>
        <p className="text-lg font-semibold text-text-primary">{title}</p>
        {description && (
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="mt-2 px-5 py-2.5 bg-primary text-text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all duration-200 cursor-pointer active:scale-[0.98]"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
