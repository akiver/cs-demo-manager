import { configureStore } from '@reduxjs/toolkit';
import { reducers } from 'csdm/ui/store/reducers';

export const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: {
        warnAfter: 200,
      },
    });
  },
});
