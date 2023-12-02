import React from 'react';
import { TextInputFilter } from 'csdm/ui/components/inputs/text-input-filter';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useMatchesLoaded } from '../use-matches-loaded';
import { useFuzzySearchText } from '../use-fuzzy-search-text';
import { fuzzySearchTextChanged } from '../matches-actions';
import { useMatchesTable } from '../table/use-matches-table';

export function FuzzySearchTextInput() {
  const dispatch = useDispatch();
  const fuzzySearchText = useFuzzySearchText();
  const matchesLoaded = useMatchesLoaded();
  const table = useMatchesTable();

  const onChange = (text: string) => {
    dispatch(
      fuzzySearchTextChanged({
        text,
      }),
    );
    table.setFuzzySearchText(text);
  };

  return <TextInputFilter value={fuzzySearchText} onChange={onChange} isDisabled={!matchesLoaded} />;
}
