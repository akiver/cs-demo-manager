import { useLingui } from '@lingui/react/macro';
import { DemoSource } from 'csdm/common/types/counter-strike';
import { assertSoftNever } from 'csdm/common/assert-soft-never';

export function useGetDemoSourceName() {
  const { t } = useLingui();

  return (demoSource: DemoSource) => {
    switch (demoSource) {
      case DemoSource.Cevo:
        return t({
          context: 'Demo source name',
          message: 'CEVO',
        });
      case DemoSource.Challengermode:
        return t({
          context: 'Demo source name',
          message: 'Challengermode',
        });
      case DemoSource.Ebot:
        return t({
          context: 'Demo source name',
          message: 'eBot',
        });
      case DemoSource.Esl:
        return t({
          context: 'Demo source name',
          message: 'ESL',
        });
      case DemoSource.Esea:
        return t({
          context: 'Demo source name',
          message: 'ESEA',
        });
      case DemoSource.Esplay:
        return t({
          context: 'Demo source name',
          message: 'Esplay',
        });
      case DemoSource.Esportal:
        return t({
          context: 'Demo source name',
          message: 'Esportal',
        });
      case DemoSource.FaceIt:
        return t({
          context: 'Demo source name',
          message: 'FACEIT',
        });
      case DemoSource.Fastcup:
        return t({
          context: 'Demo source name',
          message: 'FASTCUP',
        });
      case DemoSource.FiveEPlay:
        return t({
          context: 'Demo source name',
          message: '5EPlay',
        });
      case DemoSource.Gamersclub:
        return t({
          context: 'Demo source name',
          message: 'Gamers Club',
        });
      case DemoSource.MatchZy:
        return t({
          context: 'Demo source name',
          message: 'MatchZy',
        });
      case DemoSource.PerfectWorld:
        return t({
          context: 'Demo source name',
          message: 'Perfect World',
        });
      case DemoSource.Popflash:
        return t({
          context: 'Demo source name',
          message: 'PopFlash',
        });
      case DemoSource.Renown:
        return t({
          context: 'Demo source name',
          message: 'Renown',
        });
      case DemoSource.Valve:
        return t({
          context: 'Demo source name',
          message: 'Valve',
        });
      case DemoSource.Unknown:
        return t({
          context: 'Demo source name',
          message: 'Unknown',
        });
      default:
        return assertSoftNever(
          demoSource,
          t({
            context: 'Demo source name',
            message: 'Unknown',
          }),
        );
    }
  };
}

export function useDemoSources() {
  const getDemoSourceName = useGetDemoSourceName();

  return [
    {
      value: DemoSource.Cevo,
      name: getDemoSourceName(DemoSource.Cevo),
    },
    {
      value: DemoSource.Challengermode,
      name: getDemoSourceName(DemoSource.Challengermode),
    },
    {
      value: DemoSource.Ebot,
      name: getDemoSourceName(DemoSource.Ebot),
    },
    {
      value: DemoSource.Esl,
      name: getDemoSourceName(DemoSource.Esl),
    },
    {
      value: DemoSource.Esea,
      name: getDemoSourceName(DemoSource.Esea),
    },
    {
      value: DemoSource.Esplay,
      name: getDemoSourceName(DemoSource.Esplay),
    },
    {
      value: DemoSource.Esportal,
      name: getDemoSourceName(DemoSource.Esportal),
    },
    {
      value: DemoSource.FaceIt,
      name: getDemoSourceName(DemoSource.FaceIt),
    },
    {
      value: DemoSource.Fastcup,
      name: getDemoSourceName(DemoSource.Fastcup),
    },
    {
      value: DemoSource.FiveEPlay,
      name: getDemoSourceName(DemoSource.FiveEPlay),
    },
    {
      value: DemoSource.Gamersclub,
      name: getDemoSourceName(DemoSource.Gamersclub),
    },
    {
      value: DemoSource.MatchZy,
      name: getDemoSourceName(DemoSource.MatchZy),
    },
    {
      value: DemoSource.PerfectWorld,
      name: getDemoSourceName(DemoSource.PerfectWorld),
    },
    {
      value: DemoSource.Popflash,
      name: getDemoSourceName(DemoSource.Popflash),
    },
    {
      value: DemoSource.Renown,
      name: getDemoSourceName(DemoSource.Renown),
    },
    {
      value: DemoSource.Valve,
      name: getDemoSourceName(DemoSource.Valve),
    },
    {
      value: DemoSource.Unknown,
      name: getDemoSourceName(DemoSource.Unknown),
    },
  ];
}
