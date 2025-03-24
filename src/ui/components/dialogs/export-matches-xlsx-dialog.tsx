import React, { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import type { MatchTable } from 'csdm/common/types/match-table';
import type { ExportMatchesToXlsxPayload } from 'csdm/server/handlers/renderer-process/match/export-matches-to-xlsx-handler';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { SheetName } from 'csdm/node/xlsx/sheet-name';
import { ExportingToXlsxDialog } from './exporting-to-xlsx-dialog';
import { sheetTranslations } from 'csdm/ui/xlsx/xlsx-sheet-translations';
import { ExportXlsxOptionsDialog } from './export-xlsx-options-dialog';

type Match = Pick<MatchTable, 'checksum' | 'name'>;

type Props = {
  matches: Match[];
};

export function ExportMatchesAsXlsxDialog({ matches }: Props) {
  const { t } = useLingui();
  const client = useWebSocketClient();
  const [isExporting, setIsExporting] = useState(false);
  const checksums = matches.map((match) => match.checksum);

  if (isExporting) {
    return <ExportingToXlsxDialog totalCount={matches.length} />;
  }

  return (
    <ExportXlsxOptionsDialog
      ids={checksums}
      renderCheckboxes={(isExportIntoSingleFile) => {
        return (
          <>
            <Checkbox label={t(sheetTranslations[SheetName.General])} name="sheets.general" defaultChecked={true} />
            <Checkbox label={t(sheetTranslations[SheetName.Rounds])} name="sheets.rounds" defaultChecked={true} />
            <Checkbox label={t(sheetTranslations[SheetName.Players])} name="sheets.players" defaultChecked={true} />
            <Checkbox label={t(sheetTranslations[SheetName.Kills])} name="sheets.kills" defaultChecked={true} />
            <Checkbox label={t(sheetTranslations[SheetName.Weapons])} name="sheets.weapons" defaultChecked={true} />
            <Checkbox label={t(sheetTranslations[SheetName.Clutches])} name="sheets.clutches" defaultChecked={true} />
            {isExportIntoSingleFile && (
              <Checkbox
                label={t(sheetTranslations[SheetName.PlayersFlashbangMatrix])}
                name="sheets.playersFlashbangMatrix"
                defaultChecked={true}
              />
            )}
          </>
        );
      }}
      onOutputSelected={(type, outputPath, formData) => {
        const commonPayload: Omit<
          ExportMatchesToXlsxPayload,
          'exportEachMatchToSingleFile' | 'outputFilePath' | 'outputFilePath'
        > = {
          sheets: {
            [SheetName.General]: formData.has('sheets.general'),
            [SheetName.Players]: formData.has('sheets.players'),
            [SheetName.Kills]: formData.has('sheets.kills'),
            [SheetName.Rounds]: formData.has('sheets.rounds'),
            [SheetName.Weapons]: formData.has('sheets.weapons'),
            [SheetName.Clutches]: formData.has('sheets.clutches'),
            [SheetName.PlayersFlashbangMatrix]: formData.has('sheets.playersFlashbangMatrix'),
          },
        };
        let payload: ExportMatchesToXlsxPayload;
        if (type === 'file') {
          payload = {
            ...commonPayload,
            exportEachMatchToSingleFile: false,
            outputFilePath: outputPath,
            checksums,
          };
        } else {
          payload = {
            ...commonPayload,
            exportEachMatchToSingleFile: true,
            outputFolderPath: outputPath,
            matches,
          };
        }

        client.send({
          name: RendererClientMessageName.ExportMatchesToXlsx,
          payload,
        });
        setIsExporting(true);
      }}
    />
  );
}
