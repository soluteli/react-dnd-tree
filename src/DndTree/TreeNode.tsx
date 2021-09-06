import React, { useCallback } from 'react';
import { useContext, FC } from 'react';
import TreeContext from './TreeContext';
import { TreeNodeProps } from './types';
import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';
import Indent from './Indent';
import cz from 'classnames';

import { DRAG_TYPE } from './constants';
import { ConnectDropTarget, useDrag, useDrop } from 'react-dnd';
import useTreeNodeDrop from './hooks/useTreeNodeDrop';
import useDataEntity from './hooks/useDataEntity';

const TreeNode: FC<TreeNodeProps> = (props) => {
  const { data } = props;
  const { key } = data;

  const dataEntity = useDataEntity(key);
  const { children } = dataEntity;

  const treeContext = useContext(TreeContext);
  const {
    expandKeys,
    selectedKeys,
    onNodeExpand,
    onNodeDrop,
    onNodeSelect,
    canDrag,
  } = treeContext;

  // icon 图标
  const isExpand = expandKeys.includes(key);
  let icon = null;
  const hasChildren = Array.isArray(children) && children.length > 0;
  const iconProps = {
    style: {
      cursor: 'pointer',
    },
    onClick: () => {
      onNodeExpand(key, dataEntity);
    },
  };
  if (hasChildren) {
    icon = !isExpand ? (
      <CaretRightOutlined size={16} {...iconProps} />
    ) : (
      <CaretDownOutlined {...iconProps} />
    );
  }

  // 拖拽
  const [collected, dragRef, dragPreview] = useDrag(() => {
    return {
      type: DRAG_TYPE,
      item: { key },
      collect: (monitor) => {
        // console.log('monitor', monitor)
        return {
          isDragging: monitor.isDragging(),
          // startPointer: monitor.getInitialClientOffset(),
          // startRect: monitor.getInitialSourceClientOffset(),
          // latestPointer: monitor.getClientOffset(),
          // deltaPointer: monitor.getDifferenceFromInitialOffset(),
          // deltaRect: monitor.getSourceClientOffset()
        };
      },
    };
  });

  // 放置
  const [, dropContentRef, isDropContentOver] = useTreeNodeDrop(
    key,
    (sK, tK) => {
      onNodeDrop({
        sourceKey: sK,
        targetKey: tK,
        adjustMethod: 'insert',
      });
    },
  );

  // 放置到前面
  const [, dropBeforeRef, isDropBeforeOver] = useTreeNodeDrop(key, (sK, tK) => {
    onNodeDrop({
      sourceKey: sK,
      targetKey: tK,
      adjustMethod: 'insertBefore',
    });
  });

  // 放置到后面
  const [, dropAfterRef, isDropAfterOver] = useTreeNodeDrop(key, (sK, tK) => {
    onNodeDrop({
      sourceKey: sK,
      targetKey: tK,
      adjustMethod: 'insertAfter',
    });
  });

  const handleSelect = useCallback(() => {
    onNodeSelect(key, dataEntity);
  }, [key, onNodeSelect]);

  return (
    <div className="mtree-node-container">
      <Indent
        level={dataEntity.level}
        isStart={dataEntity.level === 0}
        isEnd={!hasChildren}
      />
      {icon}
      <div className="mtree-node-box" ref={canDrag ? dragRef : null}>
        <div
          ref={canDrag ? dropBeforeRef : null}
          className={cz('mtree-node-holder before', {
            'mtree-dragover-color': isDropBeforeOver,
          })}
        ></div>
        <div
          ref={canDrag ? dropContentRef : null}
          className={cz('mtree-node-content', {
            'mtree-dragover-color': isDropContentOver,
            'mtree-node-content-selected': selectedKeys.includes(key),
          })}
          onClick={handleSelect}
        >
          {data.title}
        </div>
        <div
          ref={canDrag ? dropAfterRef : null}
          className={cz('mtree-node-holder after', {
            'mtree-dragover-color': isDropAfterOver,
          })}
        ></div>
      </div>
    </div>
  );
};

export default TreeNode;
