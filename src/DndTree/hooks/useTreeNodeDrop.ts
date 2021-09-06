import { Key } from '../types';
import { ConnectDropTarget, DropTargetMonitor, useDrop } from 'react-dnd';
import { DRAG_TYPE } from '../constants';
import { useContext } from 'react';
import TreeContext from '../TreeContext';
import { traverseFindChildNode } from '../utils/treeUtil';

type IDropItem = {
  key: Key;
};

type IDropCollected = {
  isOver: Boolean;
  item: IDropItem;
};

export default function useTreeNodeDrop(
  key,
  doDrop,
): [IDropCollected, ConnectDropTarget, Boolean] {
  const treeContext = useContext(TreeContext);
  const { keyEntities } = treeContext;

  function _canDrop(item) {
    const dropKey = key;
    const dragKey = item.key;
    const isSelf = item.key === key;
    if (isSelf) {
      return false;
    } else {
      const dragNode = keyEntities[dragKey];
      // 1. 判断是不是子节点
      const isDragToChild = traverseFindChildNode(dragNode, dropKey);
      // console.log('isDragToChild', isDragToChild)
      return !isDragToChild;
    }
  }

  const [dropCollected, drop] = useDrop<IDropItem, IDropItem, IDropCollected>(
    () => {
      return {
        accept: DRAG_TYPE,
        item: { key },
        canDrop(item: IDropItem, monitor) {
          return _canDrop(item);
        },
        drop(item, monitor) {
          // drag drop
          doDrop(item.key, key);
          return item;
        },
        collect: (monitor) => {
          return {
            isOver: monitor.isOver(),
            item: monitor.getItem(),
          };
        },
      };
    },
  );
  const item = dropCollected.item;
  const isTrueOver = dropCollected?.isOver && _canDrop(item);

  return [dropCollected, drop, isTrueOver];
}
