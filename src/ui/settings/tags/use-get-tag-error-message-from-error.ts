import { msg } from '@lingui/macro';
import { ErrorCode } from 'csdm/common/error-code';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

export function useGetTagErrorMessageFromError() {
  const _ = useI18n();

  return (error: unknown) => {
    switch (error) {
      case ErrorCode.TagNameAlreadyToken:
        return _(msg`The name is already taken`);
      case ErrorCode.TagNameTooLong:
        return _(msg`The name is too long`);
      case ErrorCode.TagNameTooShort:
        return _(msg`The name is too short`);
      case ErrorCode.InvalidTagColor:
        return _(msg`Invalid color`);
      default:
        return _(msg`An error occurred`);
    }
  };
}
