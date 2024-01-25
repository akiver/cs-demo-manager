// eslint-disable-next-line
import { useDispatch as useDispatchRedux } from 'react-redux';
import type { store } from './store';

type AppDispatch = typeof store.dispatch;

export const useDispatch = useDispatchRedux.withTypes<AppDispatch>();
