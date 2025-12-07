import type { ThirdPartyAccount } from './third-party-account';

export type FiveEPlayAccount = ThirdPartyAccount & {
  domainId: string;
};
