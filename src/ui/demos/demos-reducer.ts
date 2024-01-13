import { createReducer } from '@reduxjs/toolkit';
import type { Demo } from 'csdm/common/types/demo';
import { Status } from 'csdm/common/types/status';
import { folderRemoved, folderAdded, folderUpdated } from 'csdm/ui/settings/folders/folder-actions';
import {
  deleteDemosSuccess,
  demosSourceUpdated,
  fetchDemosError,
  fetchDemosStart,
  fetchDemosSuccess,
  fuzzySearchTextChanged,
  selectionChanged,
  demoRenamed,
  demosTypeUpdated,
  fetchDemosProgress,
  demosDeleted,
} from './demos-actions';
import { commentUpdated } from 'csdm/ui/comment/comment-actions';
import { demoDownloadedInCurrentFolderLoaded } from 'csdm/ui/downloads/downloads-actions';
import { checksumsTagsUpdated, tagDeleted } from 'csdm/ui/tags/tags-actions';
import { insertMatchSuccess } from '../analyses/analyses-actions';

export type DemosState = {
  readonly status: Status;
  readonly entities: Demo[];
  readonly selectedDemosPath: string[];
  readonly fuzzySearchText: string;
  readonly loadedDemoCount: number;
  readonly demoToLoadCount: number;
};

const initialState: DemosState = {
  status: Status.Idle,
  entities: [],
  selectedDemosPath: [],
  fuzzySearchText: '',
  loadedDemoCount: 0,
  demoToLoadCount: 0,
};

export const demosReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchDemosStart, (state) => {
      state.status = Status.Loading;
      state.entities = [];
      state.demoToLoadCount = 0;
      state.loadedDemoCount = 0;
    })
    .addCase(fetchDemosSuccess, (state, action) => {
      state.status = Status.Success;
      state.entities = action.payload;
    })
    .addCase(fetchDemosError, (state) => {
      state.status = Status.Error;
    })
    .addCase(fetchDemosProgress, (state, action) => {
      state.demoToLoadCount = action.payload.demoToLoadCount;
      state.loadedDemoCount = action.payload.demoLoadedCount;
    })
    .addCase(deleteDemosSuccess, (state, action) => {
      state.entities = state.entities.filter((demo) => {
        return !action.payload.includes(demo.filePath);
      });
    })
    .addCase(selectionChanged, (state, action) => {
      state.selectedDemosPath = action.payload.demosPath;
    })
    .addCase(commentUpdated, (state, action) => {
      const demos = state.entities.filter((demo) => demo.checksum === action.payload.checksum);
      for (const demo of demos) {
        demo.comment = action.payload.comment;
      }
    })
    .addCase(checksumsTagsUpdated, (state, action) => {
      const demos = state.entities.filter((demo) => action.payload.checksums.includes(demo.checksum));
      for (const demo of demos) {
        demo.tagIds = action.payload.tagIds;
      }
    })
    .addCase(demosSourceUpdated, (state, action) => {
      const demos = state.entities.filter((demo) => action.payload.checksums.includes(demo.checksum));
      for (const demo of demos) {
        demo.source = action.payload.source;
      }
    })
    .addCase(demosTypeUpdated, (state, action) => {
      const demos = state.entities.filter((demo) => action.payload.checksums.includes(demo.checksum));
      for (const demo of demos) {
        demo.type = action.payload.type;
      }
    })
    .addCase(demoRenamed, (state, action) => {
      const demo = state.entities.find((demo) => {
        return demo.checksum === action.payload.checksum;
      });
      if (demo) {
        demo.name = action.payload.name;
      }
    })
    .addCase(fuzzySearchTextChanged, (state, action) => {
      state.fuzzySearchText = action.payload.text;
    })
    .addCase(demoDownloadedInCurrentFolderLoaded, (state, action) => {
      const demo = state.entities.find((demo) => demo.filePath === action.payload.filePath);
      if (demo === undefined) {
        state.entities.push(action.payload);
      }
    })
    .addCase(insertMatchSuccess, (state, action) => {
      const demos = state.entities.filter((demo) => demo.checksum === action.payload.checksum);
      for (const demo of demos) {
        Object.assign(demo, action.payload);
      }
    })
    .addCase(demosDeleted, () => {
      return initialState;
    })
    .addCase(folderAdded, () => {
      return initialState;
    })
    .addCase(folderUpdated, () => {
      return initialState;
    })
    .addCase(folderRemoved, () => {
      return initialState;
    })
    .addCase(tagDeleted, () => {
      return initialState;
    });
});
