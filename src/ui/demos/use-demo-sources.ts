import { msg } from '@lingui/macro';
import { DemoSource } from 'csdm/common/types/counter-strike';
import { useI18n } from '../hooks/use-i18n';

export function useGetDemoSourceName() {
  const _ = useI18n();

  return (demoSource: DemoSource) => {
    switch (demoSource) {
      case DemoSource.Cevo:
        return _(
          msg({
            context: 'Demo source name',
            message: 'CEVO',
          }),
        );
      case DemoSource.Challengermode:
        return _(
          msg({
            context: 'Demo source name',
            message: 'Challengermode',
          }),
        );
      case DemoSource.Ebot:
        return _(
          msg({
            context: 'Demo source name',
            message: 'eBot',
          }),
        );
      case DemoSource.Esl:
        return _(
          msg({
            context: 'Demo source name',
            message: 'ESL',
          }),
        );
      case DemoSource.Esea:
        return _(
          msg({
            context: 'Demo source name',
            message: 'ESEA',
          }),
        );
      case DemoSource.Esportal:
        return _(
          msg({
            context: 'Demo source name',
            message: 'Esportal',
          }),
        );
      case DemoSource.FaceIt:
        return _(
          msg({
            context: 'Demo source name',
            message: 'FACEIT',
          }),
        );
      case DemoSource.Fastcup:
        return _(
          msg({
            context: 'Demo source name',
            message: 'FASTCUP',
          }),
        );
      case DemoSource.Gamersclub:
        return _(
          msg({
            context: 'Demo source name',
            message: 'Gamers Club',
          }),
        );
      case DemoSource.Popflash:
        return _(
          msg({
            context: 'Demo source name',
            message: 'PopFlash',
          }),
        );
      case DemoSource.Valve:
        return _(
          msg({
            context: 'Demo source name',
            message: 'Valve',
          }),
        );
      default:
        return _(
          msg({
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
      value: DemoSource.Gamersclub,
      name: getDemoSourceName(DemoSource.Gamersclub),
    },
    {
      value: DemoSource.Popflash,
      name: getDemoSourceName(DemoSource.Popflash),
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
