import type { ErrorCode } from '../common/error-code';

// Message names sent from the WebSocket server to both renderer and main Electron processes.
export const SharedServerMessageName = {
  Reply: 'reply',
  ReplyError: 'reply-error',
  NewBannedAccounts: 'new-banned-accounts',
  NewBannedAccountsError: 'new-banned-accounts-error',
} as const;

export type SharedServerMessageName = (typeof SharedServerMessageName)[keyof typeof SharedServerMessageName];

export interface SharedServerMessagePayload {
  [SharedServerMessageName.Reply]: unknown;
  [SharedServerMessageName.ReplyError]: ErrorCode;
  [SharedServerMessageName.NewBannedAccounts]: string[];
  [SharedServerMessageName.NewBannedAccountsError]: ErrorCode;
}
