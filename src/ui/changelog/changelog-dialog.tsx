import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { useDialog } from '../components/dialogs/use-dialog';
import { CloseButton } from '../components/buttons/close-button';
import { ExternalLink } from '../components/external-link';
import { ExclamationTriangleIcon } from '../icons/exclamation-triangle-icon';
import { Donate } from '../components/donate';

function Category({ children }: { children: ReactNode }) {
  return <strong className="uppercase">[{children}]</strong>;
}

function Warning({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-x-4 mb-8">
      <ExclamationTriangleIcon className="size-12 text-orange-700" />
      <p className="text-caption">{children}</p>
    </div>
  );
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
        <div className="flex flex-col gap-y-16 max-w-[700px]">
          <div>
            {/* eslint-disable lingui/no-unlocalized-strings */}
            <h2 className="text-subtitle mb-8">New features and improvements</h2>
            <ul className="list-disc list-inside">
              <li>
                <Category>UI</Category> Added a changelog that will be displayed when the app has been updated.
              </li>
              <li>
                <Category>PLAYBACK</Category> Added <strong>CS2</strong> aliases that you can type into the game's
                console or bind it to a keyboard key to listen to specific team/player's voices when watching an{' '}
                <strong>analyzed demo</strong> from the app. The following aliases are available:
                <ul className="list-disc list-inside ml-16">
                  <li>
                    <code className="selectable font-bold">voice_all</code>: listen to all players
                  </li>
                  <li>
                    <code className="selectable font-bold">voice_ct</code>: listen to players that{' '}
                    <strong>STARTED</strong> as CT
                  </li>
                  <li>
                    <code className="selectable font-bold">voice_t</code>: listen to players that{' '}
                    <strong>STARTED</strong> as T
                  </li>
                  <li>
                    <code className="selectable font-bold">voice_STEAMID64</code>: listen to a specific player. Replace{' '}
                    <code>STEAMID64</code> by the player's SteamID64. Example: <code>voice_76561198000697560</code>.
                  </li>
                </ul>
                <Warning>
                  It's important to note that for teams aliases it's the starting side, not the current one!
                </Warning>
              </li>
              <li>
                <Category>MATCH</Category> Added search input in chat tab to filter messages.
              </li>
              <li>
                <Category>MATCHES</Category> Added context-menu item to export chat messages.
              </li>
              <li>
                <Category>SEARCH</Category> Added no scope kills event.
              </li>
              <li>
                <Category>PLAYER</Category> Added <strong>utilities</strong> and <strong>opening duels</strong> stats
                panel.
              </li>
              <li>
                <Category>PLAYER</Category> Added "<strong>Export players voice</strong>" in matches table context-menu.
              </li>
              <li>
                <Category>DOWNLOAD</Category> Added support for downloading demos from{' '}
                <ExternalLink href="https://www.5eplay.com/">5EPlay</ExternalLink>.
              </li>
              <li>
                <Category>DOWNLOAD</Category> Improved error message when retrieving last MM matches while your Steam
                account is in-game on another device.
              </li>
              <li>
                <Category>UI</Category> Comment columns are now sortable, and the comment is displayed in a tooltip when
                the icon is hovered over.
              </li>
              <li>
                <Category>DEMOS</Category> Added a UI option to redirect to the match page (instead of the demo page)
                when opening an analyzed demo. It's disabled by default.
              </li>
              <li>
                <Category>VIDEO</Category> Allow to set seconds before/after each kill/round to start/stop sequences
                through a dialog.
              </li>
              <li>
                <Category>VIDEO</Category> Added a checkbox "<strong>Show only death notices</strong>" in sequences
                edition dialog.
              </li>
              <li>
                <Category>VIDEO</Category> Added checkboxes in the players table to enable/disable players voice.
              </li>
              <li>
                <Category>VIDEO</Category> It's now possible to change the death notices duration per sequence.
              </li>
              <li>
                <Category>VIDEO</Category> Default recording settings are now configurable from the app settings.
              </li>
              <li>
                <Category>VIDEO</Category> It's now possible to install FFmpeg without installing HLAE first on Windows.
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-subtitle mb-8">Fixes</h2>
            <ul className="list-disc list-inside">
              <li>
                <Category>ANALYZE</Category> Incorrect trade kill/death detection.{' '}
                <Warning>Requires re-analyzing demos.</Warning>
              </li>
              <li>
                <Category>ANALYZE</Category> Missing chat messages.
              </li>
              <li>
                <Category>MATCH</Category> Possible wrong duels matrix values.
              </li>
              <li>
                <Category>VIDEO</Category> New FFmpeg major/minor version not detected on Windows.
              </li>
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
