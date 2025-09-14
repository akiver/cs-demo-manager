// Translation is not possible here as the locale provider is under the error boundary.
/* eslint-disable lingui/no-unlocalized-strings */
import React, { useEffect } from 'react';
import { useRouteError } from 'react-router';
import { Button, ButtonVariant } from './components/buttons/button';
import { makeElementNonInert } from './shared/inert';
import { APP_ELEMENT_ID } from './shared/element-ids';

export function ErrorBoundary() {
  const error = useRouteError();
  const errorData = error instanceof Error ? (error.stack ?? error.message) : JSON.stringify(error);

  useEffect(() => {
    makeElementNonInert(APP_ELEMENT_ID);
  }, []);

  const buildIssueUrl = () => {
    const info = window.csdm.getAppInformation();
    const system: string[] = [
      `Version: ${APP_VERSION}`,
      `OS: ${info.platform} ${info.arch} ${info.osVersion}`,
      `Electron: ${info.electronVersion}`,
      `Chrome: ${info.chromeVersion}`,
    ];
    const title = 'Runtime error';
    const environment = system.join('\n');
    const stacktrace = `\`\`\`\n${errorData}\n\`\`\``;

    const url = new URL('https://github.com/akiver/cs-demo-manager/issues/new');
    url.searchParams.set('template', 'bug_report.yml');
    url.searchParams.set('title', title);
    url.searchParams.set('environment', environment);
    url.searchParams.set('additional', stacktrace);

    return url.toString();
  };

  return (
    <div className="flex size-full flex-col items-center">
      <div className="h-48 w-full drag" />
      <div className="flex w-full flex-col gap-y-12 p-24">
        <h1 className="text-title">A runtime error occurred</h1>

        <div>
          <p>Oops! Something went wrong.</p>
          <p>Please click the button below and follow the instructions on GitHub to report the problem.</p>
          <p>This will help us to fix the issue.</p>
        </div>

        <div className="flex w-full flex-col gap-y-16">
          <div className="flex items-center gap-x-8">
            <Button
              variant={ButtonVariant.Primary}
              onClick={() => {
                window.open(buildIssueUrl());
              }}
            >
              Start submitting an issue on GitHub
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(errorData);
              }}
            >
              Copy error
            </Button>
            <Button
              onClick={() => {
                window.csdm.browseToFile(logger.getLogFilePath());
              }}
            >
              Reveal log file
            </Button>
            <Button
              onClick={async () => {
                try {
                  await window.csdm.resetSettings();
                } catch (error) {
                  logger.error(error);
                }
              }}
            >
              Reset settings
            </Button>
            <Button
              onClick={() => {
                window.csdm.restartApp();
              }}
            >
              Restart the application
            </Button>
          </div>
          <div>
            <h2 className="text-subtitle">Error</h2>
            <div className="max-h-[600px] overflow-auto rounded-8 bg-gray-100">
              <pre className="p-8 select-text">{errorData}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
