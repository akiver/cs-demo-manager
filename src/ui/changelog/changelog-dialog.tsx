import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { useDialog } from '../components/dialogs/use-dialog';
import { CloseButton } from '../components/buttons/close-button';
import { ExternalLink } from '../components/external-link';
import { ExclamationTriangleIcon } from '../icons/exclamation-triangle-icon';
import { Donate } from '../components/donate';

function Warning({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-x-4">
      <ExclamationTriangleIcon className="size-12 text-orange-700" />
      <p className="text-caption">{children}</p>
    </div>
  );
}

function Category({ title, warning, children }: { title: string; warning?: string; children: ReactNode }) {
  return (
    <li>
      <div className="flex items-center gap-x-8">
        <strong className="uppercase">{title}</strong>
        {warning && <Warning>{warning}</Warning>}
      </div>
      <ul className="list-disc list-inside pl-12">{children}</ul>
    </li>
  );
}

function Item({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}

// ! This component has to be updated before each public release.
export function ChangelogDialog() {
  const { hideDialog } = useDialog();

  return (
    <Dialog>
      <DialogHeader>
        <DialogTitle>
          <Trans>Changelog version {APP_VERSION}</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="flex flex-col gap-y-16 max-w-[700px] **:select-text">
          <div>
            {/* eslint-disable lingui/no-unlocalized-strings */}
            <h2 className="text-subtitle mb-8">New features and improvements</h2>
            <ul>
              <Category title="DEMOS">
                <Item>Added back the context menu item to export players voices from the list.</Item>
              </Category>
            </ul>
          </div>
          <div>
            <h2 className="text-subtitle mb-8">Fixes</h2>
            <ul>
              <Category title="UI">
                <Item>Handle case sensitivity when sorting table columns.</Item>
              </Category>
            </ul>
          </div>
          {/* eslint-enable lingui/no-unlocalized-strings */}
          <Donate />
        </div>
      </DialogContent>
      <DialogFooter>
        <ExternalLink href="https://cs-demo-manager.com">
          <Trans>Visit website</Trans>
        </ExternalLink>
        <CloseButton onClick={hideDialog} />
      </DialogFooter>
    </Dialog>
  );
}
