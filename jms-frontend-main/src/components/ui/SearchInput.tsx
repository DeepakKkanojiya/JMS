import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocalValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), debounceMs);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Search
        size={15}
        color="#94A3B8"
        style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
      />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="form-input"
        style={{
          paddingLeft: '36px',
          paddingRight: localValue ? '34px' : '13px',
          minWidth: '220px',
        }}
      />
      {localValue && (
        <button
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '10px',
            background: '#F1F5F9',
            border: '1px solid #E2E8F0',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
            transition: 'all 0.15s',
          }}
          title="Clear search"
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
};
