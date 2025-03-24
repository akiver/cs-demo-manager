import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { PlayerSheetName } from 'csdm/node/xlsx/player-sheet-name';
import { SheetName } from 'csdm/node/xlsx/sheet-name';

export const sheetTranslations: Record<string, MessageDescriptor> = {
  [PlayerSheetName.General]: msg({
    context: 'Excel sheet',
    message: 'General',
  }),
  [PlayerSheetName.Maps]: msg({
    context: 'Excel sheet',
    message: 'Maps',
  }),
  [PlayerSheetName.Clutch]: msg({
    context: 'Excel sheet',
    message: 'Clutch',
  }),
  [PlayerSheetName.Economy]: msg({
    context: 'Excel sheet',
    message: 'Economy',
  }),
  [SheetName.Players]: msg({
    context: 'Excel sheet',
    message: 'Players',
  }),
  [SheetName.Kills]: msg({
    context: 'Excel sheet',
    message: 'Rounds',
  }),
  [SheetName.Rounds]: msg({
    context: 'Excel sheet',
    message: 'Kills',
  }),
  [SheetName.Weapons]: msg({
    context: 'Excel sheet',
    message: 'Weapons',
  }),
  [SheetName.Clutches]: msg({
    context: 'Excel sheet',
    message: 'Clutches',
  }),
  [SheetName.Utility]: msg({
    context: 'Excel sheet',
    message: 'Utility',
  }),
  [SheetName.PlayersFlashbangMatrix]: msg({
    context: 'Excel sheet',
    message: 'Players Flashbang matrix',
  }),
};
