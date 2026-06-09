'use client';
import { useEffect, useRef, useState } from 'react';
import type { FocusEvent, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode } from 'react';

export interface DropdownSelectItem {
    value: string;
    label: string;
}

export interface DropdownSelectGroup {
    label: string;
    items: DropdownSelectItem[];
}

interface DropdownSelectProps {
    id: string;
    ariaLabel: string;
    wrapperClassName: string;
    selectClassName: string;
    placeholder: string;
    selectedValue: string | null;
    groups: DropdownSelectGroup[];
    icon: ReactNode;
    onSelect: (value: string | null) => void;
}

export default function DropdownSelect({
    id,
    ariaLabel,
    wrapperClassName,
    selectClassName,
    placeholder,
    selectedValue,
    groups,
    icon,
    onSelect,
}: DropdownSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tooltip, setTooltip] = useState<{ label: string; top: number; side: 'left' | 'right' } | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const listboxId = `${id}-listbox`;
    const selectedItem = selectedValue
        ? groups.flatMap(group => group.items).find(item => item.value === selectedValue)
        : null;
    const selectedLabel = selectedItem?.label || placeholder;

    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (rootRef.current?.contains(event.target as Node)) return;
            setIsOpen(false);
            setTooltip(null);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                setTooltip(null);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const handleSelect = (value: string | null) => {
        onSelect(value);
        setIsOpen(false);
        setTooltip(null);
    };

    const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsOpen(true);
        }
    };

    const showTooltip = (
        label: string,
        event: ReactMouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>
    ) => {
        const labelElement = event.currentTarget.querySelector<HTMLElement>('.dropdown-select-option-label');
        if (!labelElement || labelElement.scrollWidth <= labelElement.clientWidth) {
            setTooltip(null);
            return;
        }

        const rootRect = rootRef.current?.getBoundingClientRect();
        if (!rootRect) return;

        const optionRect = event.currentTarget.getBoundingClientRect();
        setTooltip({
            label,
            top: optionRect.top - rootRect.top + optionRect.height / 2,
            side: rootRect.left > 280 ? 'left' : 'right',
        });
    };

    return (
        <div className={wrapperClassName} ref={rootRef}>
            {icon}
            <button
                id={id}
                type="button"
                className={`${selectClassName} dropdown-select-trigger`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listboxId}
                aria-label={ariaLabel}
                onClick={() => setIsOpen(open => !open)}
                onKeyDown={handleTriggerKeyDown}
            >
                <span className="dropdown-select-value">{selectedLabel}</span>
            </button>
            {isOpen && (
                <div className="dropdown-select-menu" id={listboxId} role="listbox" aria-label={ariaLabel}>
                    <button
                        type="button"
                        role="option"
                        aria-selected={!selectedValue}
                        className={`dropdown-select-menu-option${!selectedValue ? ' is-selected' : ''}`}
                        onClick={() => handleSelect(null)}
                    >
                        <span className="dropdown-select-option-label">{placeholder}</span>
                    </button>
                    {groups.map(group => (
                        <div className="dropdown-select-menu-section" key={group.label}>
                            <div className="dropdown-select-menu-group" role="presentation">
                                {group.label}
                            </div>
                            {group.items.map(item => (
                                <button
                                    key={item.value}
                                    type="button"
                                    role="option"
                                    aria-selected={selectedValue === item.value}
                                    className={`dropdown-select-menu-option${selectedValue === item.value ? ' is-selected' : ''}`}
                                    onMouseEnter={(event) => showTooltip(item.label, event)}
                                    onMouseLeave={() => setTooltip(null)}
                                    onFocus={(event) => showTooltip(item.label, event)}
                                    onBlur={() => setTooltip(null)}
                                    onClick={() => handleSelect(item.value)}
                                >
                                    <span className="dropdown-select-option-label">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            )}
            {isOpen && tooltip && (
                <div
                    className={`dropdown-select-tooltip is-${tooltip.side}`}
                    style={{ top: tooltip.top }}
                    role="tooltip"
                >
                    {tooltip.label}
                </div>
            )}
        </div>
    );
}
