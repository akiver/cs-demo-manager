import { useLocale } from '../settings/ui/use-locale';

export function useFormatMoney() {
  const locale = useLocale();

  return (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 0,
    }).format(amount);
  };
}
