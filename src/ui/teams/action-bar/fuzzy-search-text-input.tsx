import React from 'react';
import { TextInputFilter } from 'csdm/ui/components/inputs/text-input-filter';
import { useFuzzySearchText } from '../use-fuzzy-search-text';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { fuzzySearchTextChanged } from '../teams-actions';
import { useTeamsTable } from '../table/use-teams-table';

export function FuzzySearchTextInput() {
  const dispatch = useDispatch();
  const fuzzySearchText = useFuzzySearchText();
  const table = useTeamsTable();

  const onChange = (text: string) => {
    dispatch(
      fuzzySearchTextChanged({
        text,
      }),
    );
    table.setFuzzySearchText(text);
  };

  return <TextInputFilter value={fuzzySearchText} onChange={onChange} />;
}
