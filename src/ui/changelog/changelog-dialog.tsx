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
              <Category title="2D VIEWER">
                <Item>
                  You can now play an audio file in the 2D viewer during playback. See the{' '}
                  <ExternalLink href="https://cs-demo-manager.com/docs/guides/2d-viewer">documentation</ExternalLink>{' '}
                  for usage instructions.
                </Item>
              </Category>
              <Category title="MATCHES">
                <Item>A filter to export voices of only specific players is available in the export context-menu.</Item>
              </Category>
              <Category title="MATCH">
                <Item>Added melee weapons (knife, taser) stats in the weapons tab.</Item>
              </Category>
              <Category title="SETTINGS">
                <Item>
                  Added a playback option to use older internal{' '}
                  <ExternalLink href="https://cs-demo-manager.com/docs/guides/playback#cs2-plugin-compatibility">
                    CS2 'plugin'
                  </ExternalLink>
                  . This allows to watch old demos not supported by the last CS2 build in combination of using an older
                  CS2 Steam beta branch.
                </Item>
                <Item>Non-existent demos folders are now preserved on app startup.</Item>
              </Category>
              <Category title="DOWNLOAD">
                <Item>
                  The date of the match when downloading non-Valve demos is now more accurate. We retrieve it from the
                  third-party service.
                </Item>
              </Category>
              <Category title="VIDEO">
                <Item>
                  Added a player filter in the 'Generate players' sequence' dialog to generate sequences for multiple
                  players.
                </Item>
                <Item>
                  Added a round filter in the 'Generate players' sequence' dialog to generate sequences only for
                  specific rounds.
                </Item>
                <Item>Added an option to preserve existing sequences in the "generate players' sequence" dialog.</Item>
                <Item>Options requiring HLAE are hidden if the recording system is not HLAE.</Item>
                <Item>
                  The app now uses the HLAE command <code>mirv_replace_name</code> (added in version 2.184.0) to replace
                  player names.
                </Item>
              </Category>
            </ul>
          </div>
          <div>
            <h2 className="text-subtitle mb-8">Fixes</h2>
            <ul>
              <Category title="GENERAL">
                <Item>Support for the 28th July 2025 CS2 update.</Item>
              </Category>
              <Category title="2D VIEWER">
                <Item>Flashbang icons in the players overview now match the number of flashbangs a player has.</Item>
              </Category>
              <Category title="VIDEO">
                <Item>
                  Last player not visible in the table from the section "Override player options" of the "Edit sequences
                  settings" dialog.
                </Item>
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
