import React from 'react';
import { Button, ButtonVariant, type Props as ButtonProps } from 'csdm/ui/components/buttons/button';
import { Spinner } from '../spinner';

type Props = ButtonProps & {
  isLoading: boolean;
};

export function SpinnableButton({ children, isLoading = false, isDisabled, variant, ...props }: Props) {
  return (
    <Button isDisabled={isDisabled ?? isLoading} variant={variant ?? ButtonVariant.Primary} {...props}>
      <div className={isLoading ? 'opacity-0' : 'opacity-100'}>{children}</div>
      {isLoading && (
        <div className="absolute left-1/2 -translate-x-1/2">
          <Spinner size={20} />
        </div>
      )}
    </Button>
  );
}
