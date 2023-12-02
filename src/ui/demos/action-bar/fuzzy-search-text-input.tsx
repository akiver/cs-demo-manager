import React from 'react';
import { fuzzySearchTextChanged } from 'csdm/ui/demos/demos-actions';
import { useDemosLoaded } from 'csdm/ui/demos/use-demos-loaded';
import { useFuzzySearchText } from 'csdm/ui/demos/use-fuzzy-search-text';
import { TextInputFilter } from 'csdm/ui/components/inputs/text-input-filter';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useDemosTable } from '../table/use-demos-table';

export function FuzzySearchTextInput() {
  const dispatch = useDispatch();
  const fuzzySearchText = useFuzzySearchText();
  const demosLoaded = useDemosLoaded();
  const table = useDemosTable();

  const onChange = (text: string) => {
    dispatch(
      fuzzySearchTextChanged({
        text,
      }),
    );
    table.setFuzzySearchText(text);
  };

  return <TextInputFilter value={fuzzySearchText} onChange={onChange} isDisabled={!demosLoaded} />;
}
