import React, { useRef, useState } from 'react';
import { TextInput, type TextInputHandlers } from './text-input';

type Props<Value> = {
  isDisabled: boolean;
  placeholder: string;
  noResultMessage: string;
  selectedValues: Value[];
  onValueSelected: (value: Value) => void;
  onValueRemoved: (value: Value) => void;
  search: (value: string, ignoredValues: Value[]) => Promise<Value[]>;
  renderResult: (result: Value) => React.ReactNode;
  renderValue: (value: Value) => React.ReactNode;
  getValueId: (value: Value) => string;
};

export function SearchInput<Value = unknown>({
  isDisabled,
  placeholder,
  noResultMessage,
  search,
  selectedValues,
  onValueSelected,
  onValueRemoved,
  renderValue,
  getValueId,
  renderResult,
}: Props<Value>) {
  const timer = useRef(0);
  const inputRef = useRef<TextInputHandlers | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const [results, setResults] = useState<Value[]>([]);
  const [isListVisible, setIsListVisible] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const selectValue = (value: Value) => {
    setResults([]);
    onValueSelected(value);
    inputRef.current?.setValue('');
  };

  const onChange = (event: React.ChangeEvent) => {
    window.clearTimeout(timer.current);

    timer.current = window.setTimeout(async () => {
      const value = (event.target as HTMLInputElement).value;
      if (value.length < 2) {
        setFocusedIndex(0);
        setIsListVisible(false);
        setResults([]);
        return;
      }

      const result = await search(value, selectedValues);

      setFocusedIndex(0);
      setIsListVisible(true);
      setResults(result);
    }, 500);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setIsListVisible(false);
      return;
    }

    if (results.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const nextIndex = focusedIndex === results.length - 1 ? 0 : focusedIndex + 1;
        setFocusedIndex(nextIndex);
        resultsRef.current?.scrollTo({
          top: nextIndex * 35,
        });
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const previousIndex = focusedIndex - 1 < 0 ? results.length - 1 : focusedIndex - 1;
        setFocusedIndex(previousIndex);
        resultsRef.current?.scrollTo({
          top: previousIndex * 35,
        });
        break;
      }
      case 'Enter': {
        event.preventDefault();
        const result = results[focusedIndex];
        if (result) {
          selectValue(result);
        }
        break;
      }
    }
  };

  const onFocus = () => {
    setIsListVisible(true);
  };

  const onBlur = () => {
    setIsListVisible(false);
  };

  const renderResults = () => {
    if (!isListVisible || inputRef.current?.value() === '') {
      return null;
    }

    return (
      <div className="absolute z-10 w-full">
        <div
          className="flex flex-col gap-y-4 bg-gray-50 border border-gray-400 rounded max-h-[200px] overflow-auto"
          ref={resultsRef}
        >
          {results.length > 0 ? (
            results.map((result, index) => {
              const hasFocus = focusedIndex === index;
              return (
                <div
                  className={`px-8 py-4 hover:bg-gray-100 ${hasFocus ? 'bg-gray-75' : ''}`}
                  key={getValueId(result)}
                  onMouseDown={(event) => {
                    event.stopPropagation();
                    selectValue(result);
                  }}
                >
                  {renderResult(result)}
                </div>
              );
            })
          ) : (
            <p className="p-8">{noResultMessage}</p>
          )}
        </div>
      </div>
    );
  };

  const renderSelectedValues = () => {
    if (selectedValues.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap max-h-[134px] overflow-y-auto mt-8 gap-x-8 gap-y-4">
        {selectedValues.map((value) => {
          return (
            <div
              key={getValueId(value)}
              className="flex items-center justify-center px-8 py-4 border rounded text-gray-700 gap-x-8"
            >
              {renderValue(value)}
              <button
                disabled={isDisabled}
                className="text-gray-800 hover:disabled:text-gray-800 hover:text-gray-900"
                onClick={() => {
                  onValueRemoved(value);
                }}
              >
                X
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative">
      <TextInput
        isDisabled={isDisabled}
        placeholder={placeholder}
        onChange={onChange}
        ref={inputRef}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
      {renderResults()}
      {renderSelectedValues()}
    </div>
  );
}
