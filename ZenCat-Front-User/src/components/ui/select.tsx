import * as React from 'react';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

export function Select({
  value,
  onValueChange,
  children,
  placeholder,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || '');

  const selectRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sync internal state with external value prop
  React.useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  const items = React.Children.toArray(
    children,
  ) as React.ReactElement<SelectItemProps>[];
  const selectedItem = items.find((item) => item.props.value === selectedValue);

  return (
    <div className={cn('relative', className)} ref={selectRef}>
      <button
        type="button"
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={cn(
            'block truncate',
            !selectedValue && 'text-muted-foreground',
          )}
        >
          {selectedItem ? selectedItem.props.children : placeholder}
        </span>
        <ChevronDownIcon
          className={cn(
            'h-4 w-4 opacity-50 transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-1">
            {items.map((item) => (
              <button
                key={item.props.value}
                type="button"
                className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleValueChange(item.props.value)}
              >
                {item.props.children}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SelectItem({ value, children }: SelectItemProps) {
  return <div data-value={value}>{children}</div>;
}
