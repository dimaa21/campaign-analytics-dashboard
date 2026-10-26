import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { cx, fieldClass } from '../../utils/cx';

interface Option {
  value: string;
  label: string;
}

export function MultiSelect({
  label,
  options,
  selected,
  onToggle,
  onClear,
  placeholder,
  disabled = false,
}: {
  label: string;
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const labelId = useId();
  const valueId = useId();

  useEffect(() => {
    if (!open) return undefined;
    listRef.current?.focus();
    const onPointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  const summary = (() => {
    if (selected.length === 0) return placeholder;
    const labels = options.filter((option) => selected.includes(option.value)).map((option) => option.label);
    if (labels.length <= 2) return labels.join(', ');
    return `${label} · ${labels.length}`;
  })();

  const activeOption = options[active];
  const activeId = activeOption ? `${listId}-${activeOption.value}` : undefined;

  const openList = () => {
    if (disabled) return;
    setActive(0);
    setOpen(true);
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openList();
    }
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => Math.min(options.length - 1, index + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => Math.max(0, index - 1));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActive(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActive(Math.max(0, options.length - 1));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (activeOption) onToggle(activeOption.value);
    }
  };

  return (
    <div ref={containerRef} className="relative min-w-[10.5rem] flex-1">
      <span id={labelId} className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      <button
        ref={buttonRef}
        type="button"
        className={cx(fieldClass, 'flex w-full items-center justify-between gap-2 text-left')}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${labelId} ${valueId}`}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onTriggerKeyDown}
      >
        <span id={valueId} className="truncate">
          {summary}
        </span>
        <span aria-hidden="true" className="text-muted">
          ▾
        </span>
      </button>
      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          aria-multiselectable="true"
          aria-activedescendant={activeId}
          tabIndex={-1}
          onKeyDown={onListKeyDown}
          className="absolute z-30 mt-1 max-h-64 w-full min-w-[14rem] overflow-auto rounded-md border border-line bg-panel p-1 shadow-lg"
        >
          <li className="px-1 py-1">
            <button type="button" className="text-xs text-muted underline-offset-2 hover:underline" onClick={onClear}>
              Clear
            </button>
          </li>
          {options.map((option, index) => {
            const isSelected = selected.includes(option.value);
            return (
              <li key={option.value} id={`${listId}-${option.value}`} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  className={cx(
                    'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm',
                    index === active ? 'bg-soft' : 'hover:bg-soft',
                  )}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => onToggle(option.value)}
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      'grid h-4 w-4 place-items-center rounded border text-[10px]',
                      isSelected ? 'border-accent bg-accent text-canvas' : 'border-line',
                    )}
                  >
                    {isSelected ? '✓' : ''}
                  </span>
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
