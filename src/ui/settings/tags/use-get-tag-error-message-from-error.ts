import { useLingui } from '@lingui/react/macro';
import { ErrorCode } from 'csdm/common/error-code';

export function useGetTagErrorMessageFromError() {
  const { t } = useLingui();

  return (error: unknown) => {
    switch (error) {
      case ErrorCode.TagNameAlreadyToken:
        return t`The name is already taken`;
      case ErrorCode.TagNameTooLong:
        return t`The name is too long`;
      case ErrorCode.TagNameTooShort:
        return t`The name is too short`;
      case ErrorCode.InvalidTagColor:
        return t`Invalid color`;
      default:
        return t`An error occurred`;
    }
  };
}
