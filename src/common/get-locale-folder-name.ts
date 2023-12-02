export function getLocaleFolderName(locale: string) {
  // Locales where the language (first 2 chars) are the same but the language may be spoken differently given the region (country).
  // For other locales we use the language only.
  const localesToPreserve = ['zh-CN', 'zh-TW', 'pt-BR'];
  if (localesToPreserve.includes(locale)) {
    return locale;
  }

  return new Intl.Locale(locale).language;
}
