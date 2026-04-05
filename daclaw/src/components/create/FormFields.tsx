'use client';

export function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-text-primary mb-1.5">
      {children}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const { error, className, type, onClick, ...rest } = props;
  const isDate = type === 'date';
  return (
    <div>
      <input
        {...rest}
        type={type}
        onClick={isDate ? (e) => {
          (e.target as HTMLInputElement).showPicker?.();
          onClick?.(e);
        } : onClick}
        readOnly={isDate ? false : rest.readOnly}
        className={`w-full bg-surface border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary placeholder:text-text-secondary/50 transition-colors ${
          error ? 'border-error' : 'border-border'
        } ${isDate ? 'cursor-pointer' : ''} ${className ?? ''}`}
      />
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  const { error, className, ...rest } = props;
  return (
    <div>
      <textarea
        {...rest}
        className={`w-full bg-surface border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary placeholder:text-text-secondary/50 resize-none transition-colors ${
          error ? 'border-error' : 'border-border'
        } ${className ?? ''}`}
      />
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
}

export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
      <h2 className="text-sm font-bold text-text-primary">{title}</h2>
      {children}
    </div>
  );
}
