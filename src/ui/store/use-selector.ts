import type { TypedUseSelectorHook } from 'react-redux';
// eslint-disable-next-line
import { useSelector as useSelectorRedux } from 'react-redux';
import type { RootState } from './reducers';

export const useSelector: TypedUseSelectorHook<RootState> = useSelectorRedux;
