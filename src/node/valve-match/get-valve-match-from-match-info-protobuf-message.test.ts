import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { CDataGCCStrike15_v2_MatchInfo } from 'csgo-protobuf';
import { getValveMatchFromMatchInfoProtobufMesssage } from './get-valve-match-from-match-info-protobuf-message';
import type { ValveMatch } from 'csdm/common/types/valve-match';

async function readInfoFile(fileName: string) {
  const filePath = fileURLToPath(new URL(`fixtures/${fileName}`, import.meta.url));
  const buffer = await fs.readFile(filePath);
  const bytes = new Uint8Array(buffer);
  const matchMessage: CDataGCCStrike15_v2_MatchInfo = CDataGCCStrike15_v2_MatchInfo.fromBinary(bytes);

  return matchMessage;
}

function buildMatchForSnapshot(match: ValveMatch) {
  match.protobufBytes = new Uint8Array();

  return match;
}

describe('get Valve match from protobuf message', () => {
  describe('Valve tournaments', () => {
    it('should return correct values for a match with overtime', async () => {
      const fileName = 'match730_003189280594026561777_1796106830_900';
      const matchMessage = await readInfoFile(`${fileName}.dem.info`);
      const match = getValveMatchFromMatchInfoProtobufMesssage(matchMessage);

      expect(buildMatchForSnapshot(match)).toMatchSnapshot(fileName);
    });

    it('should return correct values for a match without overtime', async () => {
      const fileName = 'match730_003189870870709403769_1988138084_900';
      const matchMessage = await readInfoFile(`${fileName}.dem.info`);

      const match = getValveMatchFromMatchInfoProtobufMesssage(matchMessage);

      expect(buildMatchForSnapshot(match)).toMatchSnapshot(fileName);
    });
  });

  describe('Matchmaking', () => {
    it('should return correct values', async () => {
      const fileName = 'match730_003498492722937856210_1557600280_214';
      const matchMessage = await readInfoFile(`${fileName}.dem.info`);

      const match = getValveMatchFromMatchInfoProtobufMesssage(matchMessage);

      expect(buildMatchForSnapshot(match)).toMatchSnapshot(fileName);
    });

    it('should return correct values for a match with old protobuf definition', async () => {
      const fileName = 'match730_003028590839392632871_1662707805_136';
      const matchMessage = await readInfoFile(`${fileName}.dem.info`);

      const match = getValveMatchFromMatchInfoProtobufMesssage(matchMessage);

      expect(buildMatchForSnapshot(match)).toMatchSnapshot(fileName);
    });
  });
});
