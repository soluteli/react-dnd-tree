import React from 'react';
import { FC } from 'react';

type IndentProps = {
  level: number;
  isStart: Boolean;
  isEnd: Boolean;
};

const Indent: FC<IndentProps> = (props) => {
  const { level, isStart = false, isEnd = false } = props;
  let paddingWidth = 0;
  if (isStart) {
    if (isEnd) {
      paddingWidth = 16 * (level + 1);
    } else {
      paddingWidth = 16 * level; // 0
    }
  } else {
    if (isEnd) {
      paddingWidth = 16 * (level + 1);
    } else {
      paddingWidth = 16 * level; // 0
    }
  }
  return (
    <span
      className="tree-node-indent"
      style={{
        display: 'inline-block',
        width: `${paddingWidth}px`,
      }}
    />
  );
};

export default Indent;
