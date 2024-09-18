import React from 'react';
import { TableCommentWidget } from 'csdm/ui/components/table/comment-widget';
import type { Demo } from 'csdm/common/types/demo';
import { useUpdateComment } from 'csdm/ui/comment/use-update-comment';

type Props = {
  demos: Demo[];
  onClose: () => void;
};

export function DemoCommentWidget({ onClose, demos }: Props) {
  const updateComment = useUpdateComment();

  if (demos.length === 0) {
    return null;
  }

  const [selectedDemo] = demos;

  const onBlur = (comment: string) => {
    if (comment === selectedDemo.comment) {
      return;
    }

    updateComment({
      checksum: selectedDemo.checksum,
      comment,
    });
  };

  return (
    <TableCommentWidget
      key={`comment-${selectedDemo.checksum}`}
      comment={selectedDemo.comment}
      onClose={onClose}
      onBlur={onBlur}
    />
  );
}
