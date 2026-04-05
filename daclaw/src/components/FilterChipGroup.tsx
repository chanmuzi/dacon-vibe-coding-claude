interface FilterChip {
  key: string;
  label: string;
  testId?: string;
}

interface FilterChipGroupProps {
  items: FilterChip[];
  activeKey: string;
  onChange: (key: string) => void;
}

export default function FilterChipGroup({ items, activeKey, onChange }: FilterChipGroupProps) {
  return (
    <>
      {items.map((item) => (
        <button
          key={item.key}
          data-testid={item.testId}
          onClick={() => onChange(item.key)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer active:scale-[0.98] ${
            activeKey === item.key
              ? 'bg-primary text-text-on-primary'
              : 'bg-background text-text-secondary hover:text-text-primary hover:bg-primary-light'
          }`}
        >
          {item.label}
        </button>
      ))}
    </>
  );
}
