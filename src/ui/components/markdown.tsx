import React from 'react';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import { unified } from 'unified';

type Props = {
  markdown: string;
};

export function Markdown({ markdown }: Props) {
  const file = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .processSync(markdown);

  return <div dangerouslySetInnerHTML={{ __html: String(file) }} />;
}
