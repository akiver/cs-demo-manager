import type { LinguiConfig } from '@lingui/conf';
import { formatter } from '@lingui/format-po';

const config: LinguiConfig = {
  locales: ['en', 'fr', 'es', 'pt-BR', 'zh-CN', 'zh-TW', 'de', 'ru'],
  sourceLocale: 'en',
  orderBy: 'origin',
  format: formatter({ lineNumbers: false }),
  catalogs: [
    {
      path: '<rootDir>/src/ui/translations/{locale}/messages',
      include: ['src/ui'],
    },
  ],
};

export default config;
