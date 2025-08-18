import React, { useEffect, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import rehypeStringify from 'rehype-stringify';
import remarkDirective from 'remark-directive';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import rehypeExternalLinks from 'rehype-external-links';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { CloseButton } from 'csdm/ui/components/buttons/close-button';
import { ExternalLink } from 'csdm/ui/components/external-link';
import { Donate } from 'csdm/ui/components/donate';
import { Status } from 'csdm/common/types/status';
import { Spinner } from 'csdm/ui/components/spinner';

function directiveStylingPlugin() {
  return function (tree: Root) {
    visit(tree, function (node) {
      if (node.type === 'containerDirective') {
        const data = node.data ?? (node.data = {});
        data.hName = 'div';
        switch (node.name) {
          case 'warning':
            data.hProperties = { className: 'directive warning' };
            break;
          case 'info':
            data.hProperties = { className: 'directive info' };
            break;
          case 'danger':
            data.hProperties = { className: 'directive danger' };
            break;
        }
      }
    });
  };
}

export function ChangelogDialog() {
  const { hideDialog } = useDialog();
  const [status, setStatus] = useState<Status>(Status.Loading);
  const [html, setHtml] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/akiver/cs-demo-manager.com/refs/heads/main/src/pages/changelog.mdx',
          {
            headers: {
              'User-Agent': 'CS:DM',
            },
          },
        );
        const text = await response.text();
        const versions = text.split('## v').filter((version) => {
          const trimmedVersion = version.trim();
          return trimmedVersion !== '' && trimmedVersion.startsWith('3');
        });
        if (versions.length === 0) {
          throw new Error('No versions found in the changelog');
        }

        let [markdown] = versions;
        // remove the version number
        markdown = markdown.replace(/\d+\.\d+\.\d+/g, '');
        // remove the OSS info directive
        markdown = markdown.replace(/:::[\w-]+\n([\s\S]*?):::/g, '');
        // prepend https://cs-demo-manager.com to links
        markdown = markdown.replace(/]\((\/[^)]+)\)/g, `](https://cs-demo-manager.com$1)`);

        const processor = unified()
          .use(remarkParse)
          .use(remarkDirective)
          .use(directiveStylingPlugin)
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeExternalLinks, { rel: ['noopener', 'noreferrer'], target: '_blank' })
          .use(rehypeStringify);

        const file = await processor.process(markdown);

        setHtml(String(file));
        setStatus(Status.Success);
      } catch (error) {
        logger.log('Failed to fetch changelog');
        logger.error(error);
        setStatus(Status.Error);
      }
    })();
  }, []);

  const renderChangelog = () => {
    if (status === Status.Loading) {
      return (
        <div className="flex items-center justify-center self-center h-[120px]">
          <Spinner size={48} />
        </div>
      );
    }

    if (status === Status.Error) {
      return (
        <p className="text-body-strong">
          <Trans>Failed to load changelog.</Trans>
        </p>
      );
    }

    return <div className="changelog" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <Dialog>
      <DialogHeader>
        <DialogTitle>
          <Trans>Changelog version {APP_VERSION}</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="flex flex-col gap-y-16 max-w-[700px] **:select-text">
          {renderChangelog()}
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
