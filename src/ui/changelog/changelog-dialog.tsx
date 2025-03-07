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
              <Category title="UI">
                <Item>Added a changelog that will be displayed when the app has been updated.</Item>
                <Item>
                  Comment columns are now sortable, and the comment is displayed in a tooltip when the icon is hovered
                  over.
                </Item>
              </Category>
              <Category title="ANALYZE">
                <Item>
                  Added support for <ExternalLink href="https://renown.gg/">Renown</ExternalLink> demos.
                </Item>
              </Category>
              <Category title="PLAYBACK">
                <Item>
                  Added <strong>CS2</strong> aliases that you can type into the game's console or bind it to a keyboard
                  key to listen to specific team/player's voices when watching an <strong>analyzed demo</strong> from
                  the app. The following aliases are available:
                  <ul className="list-disc list-inside ml-16">
                    <li>
                      <code className="font-bold">voice_all</code>: listen to all players
                    </li>
                    <li>
                      <code className="font-bold">voice_ct</code>: listen to players that <strong>STARTED</strong> as CT
                    </li>
                    <li>
                      <code className="font-bold">voice_t</code>: listen to players that <strong>STARTED</strong> as T
                    </li>
                    <li>
                      <code className="font-bold">voice_STEAMID64</code>: listen to a specific player. Replace{' '}
                      <code>STEAMID64</code> by the player's SteamID64. Example: <code>voice_76561198000697560</code>.
                    </li>
                  </ul>
                  <Warning>
                    It's important to note that for teams aliases it's the starting side, not the current one!
                  </Warning>
                </Item>
              </Category>
              <Category title="VIDEO">
                <Item>
                  <span>
                    It's now possible to generate videos using the HLAE sampling system that "streams" the game frames
                    directly to FFmpeg.
                  </span>
                  <p>
                    It means that you don't need a lot of disk space as images are not saved on the disk anymore and the
                    generation is faster.
                  </p>
                  <p>
                    Please see the updated{' '}
                    <ExternalLink href="https://cs-demo-manager.com/docs/guides/video">documentation</ExternalLink> for
                    details.
                  </p>
                  <Warning>This feature requires HLAE so it's available only on Windows!</Warning>
                </Item>
                <Item>
                  Added an option to select the "recording system". <strong>Counter-Strike</strong> (
                  <code>startmovie</code> command) or <strong>HLAE</strong> (<code>mirv_streams</code> command).
                </Item>
                <Item>
                  <span>
                    Added an option to select the output format (<strong>Images</strong>,{' '}
                    <strong>Images + video</strong>, or <strong>Video</strong>).
                  </span>
                  <p>
                    It also means that the checkboxes "Generate only raw files" and "Delete raw files after encoding"
                    are gone.
                  </p>
                </Item>
                <Item>
                  <span>
                    Removed the option to define the folder where raw files are saved. It's now directly saved in the
                    output folder <strong>when using HLAE</strong> or moved to the output folder otherwise.
                  </span>
                  <p>
                    It didn't really make sens because the raw files were actually saved on the disk where CS is
                    installed and then moved (the <code>startmovie</code> command doesn't allow to define the output).
                  </p>
                </Item>
                <Item>Allow to set seconds before/after each kill/round to start/stop sequences through a dialog.</Item>
                <Item>
                  Added a checkbox "<strong>Show only death notices</strong>" in sequences edition dialog.
                </Item>
                <Item>Added checkboxes in the players table to enable/disable players voice.</Item>
                <Item>It's now possible to change the death notices duration per sequence.</Item>
                <Item>Default recording settings are now configurable from the app settings.</Item>
                <Item>It's now possible to install FFmpeg without installing HLAE first on Windows.</Item>
              </Category>
              <Category title="Match">
                <Item>Added search input in chat tab to filter messages.</Item>
                <Item>Added search input in chat tab to filter messages.</Item>
              </Category>

              <Category title="MATCHES">
                <Item>Added context-menu item to export chat messages.</Item>
              </Category>

              <Category title="SEARCH">
                <Item>Added no scope kills event.</Item>
              </Category>
              <Category title="PLAYER">
                <Item>
                  Added <strong>utilities</strong> and <strong>opening duels</strong> stats panel.
                </Item>
                <Item>
                  Added "<strong>Export players voice</strong>" in matches table context-menu.
                </Item>
              </Category>

              <Category title="DOWNLOAD">
                <Item>
                  Added support for downloading demos from{' '}
                  <ExternalLink href="https://www.5eplay.com/">5EPlay</ExternalLink>.
                </Item>
                <Item>
                  Improved error message when retrieving last MM matches while your Steam account is in-game on another
                  device.
                </Item>
              </Category>

              <Category title="DEMOS">
                <Item>
                  Added a UI option to redirect to the match page (instead of the demo page) when opening an analyzed
                  demo. It's disabled by default.
                </Item>
              </Category>
            </ul>
          </div>
          <div>
            <h2 className="text-subtitle mb-8">Fixes</h2>
            <ul>
              <Category title="ANALYZE" warning="Requires re-analyzing demos.">
                <Item>Incorrect trade kill/death detection.</Item>
                <Item>Missing chat messages.</Item>
              </Category>
              <Category title="MATCH">
                <Item>Possible wrong duels matrix values.</Item>
              </Category>
              <Category title="VIDEO">
                <Item>New FFmpeg major/minor version not detected on Windows.</Item>
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
