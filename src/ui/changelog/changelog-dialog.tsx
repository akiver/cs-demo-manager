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
              <Category title="MAPS">
                <Item>Support for the new maps added in the May 9, 2025 CS2 update.</Item>
              </Category>
              <Category title="DEMOS/MATCHES">
                <Item>
                  Added an export mode selection dialog when exporting players' voices. You can now choose between:
                  <ul className="list-disc list-inside ml-16">
                    <li>One file per player (no silence, only voice)</li>
                    <li>One file per player (with silence, demo length)</li>
                    <li>
                      Single file (all players voices are mixed together in one audio file, with silence, demo length)
                    </li>
                  </ul>
                </Item>
              </Category>
              <Category title="TEAM">
                <Item>
                  Added a <strong>Performance</strong> tab in the team page that shows side, bomb, and round outcomes
                  stats.
                </Item>
              </Category>
              <Category title="ANALYZE">
                <Item>
                  Added support for <ExternalLink href="https://esplay.com">Esplay</ExternalLink> demos.
                </Item>
              </Category>
              <Category title="SEARCH">
                <Item>
                  Added a <strong>Through smoke kills</strong> event to find kills made through smoke.
                </Item>
              </Category>
              <Category title="PLAYERS">
                <Item>
                  Added a context menu item and a button to export players to XLSX from the list/player's page.
                </Item>
              </Category>
              <Category title="PLAYBACK">
                <Item>
                  Counter-Strike launch parameters defined in the playback settings are now passed to the game when
                  using HLAE through its <code>-customLaunchOptions</code> parameter.
                </Item>
                <Item>
                  Added HLAE command-line parameters input in the app video settings. It's passed to HLAE when watching
                  a demo.
                </Item>
              </Category>
              <Category title="DEMOS">
                <Item>Added back the context menu item to export players voices from the list.</Item>
              </Category>
              <Category title="VIDEO">
                <Item>It's now possible to add multiple sequences with the same start/end ticks.</Item>
              </Category>
              <Category title="MATCH">
                <Item>
                  Added a <strong>Round outcomes by economy type</strong> chart in the <strong>Economy</strong> tab.
                </Item>
              </Category>
              <Category title="2D VIEWER">
                <Item>The bomb is now drawn when it's dropped.</Item>
              </Category>
            </ul>
          </div>
          <div>
            <h2 className="text-subtitle mb-8">Fixes</h2>
            <ul>
              <Category title="DOWNLOAD">
                <Item>
                  Crash when loading last MM matches and a game was played on <i>cs_agency</i>.
                </Item>
              </Category>
              <Category title="UI">
                <Item>Column sorting now takes case into account.</Item>
              </Category>
              <Category title="MATCH">
                <Item>Wallbang/no scope kills always 0 in scoreboard</Item>
              </Category>
              <Category title="PLAYERS">
                <Item>Error when loading more than 65536 players</Item>
              </Category>
              <Category title="VIDEO">
                <Item>Properly detect FFmpeg executables that use a git based version.</Item>
              </Category>
              <Category title="ANALYZE">
                <Item>Fixed possible errors.</Item>
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
