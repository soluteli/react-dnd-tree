import {
  DataNode,
  Key,
  FlattenNode,
  FieldNames,
  GetKey,
  DataEntity,
  IAdjustMethod,
} from '../types';
import omit from './omit';

export function fillFieldNames(fieldNames?: FieldNames) {
  const { title, key, children } = fieldNames || {};

  return {
    title: title || 'title',
    key: key || 'key',
    children: children || 'children',
  };
}

export function getPosition(level: string | number, index: number) {
  return `${level}-${index}`;
}

export function getKey(key: Key, pos: string) {
  if (key !== null && key !== undefined) {
    return key;
  }
  return pos;
}

type ExternalGetKey = GetKey<DataNode> | string;
interface TraverseDataNodesConfig {
  childrenPropName?: string;
  externalGetKey?: ExternalGetKey;
  fieldNames?: FieldNames;
}

/**
 * 打平树形结构
 * @param treeNodeList
 * @param expandedKeys
 * @param fieldNames
 * @returns
 */
export function flattenTreeData(
  treeNodeList: DataNode[],
  expandedKeys: Key[] | true,
  fieldNames?: FieldNames,
): FlattenNode[] {
  const {
    title: fieldTitle,
    key: fieldKey,
    children: fieldChildren,
  } = fillFieldNames(fieldNames);

  const expandedKeySet = new Set(expandedKeys === true ? [] : expandedKeys);
  const flattenList: FlattenNode[] = [];

  function dig(
    list: DataNode[],
    parent: FlattenNode | null = null,
  ): FlattenNode[] {
    return list.map((treeNode, index) => {
      const pos: string = getPosition(parent ? parent.pos : '0', index);
      const mergedKey = getKey(treeNode[fieldKey], pos);

      // Add FlattenDataNode into list
      const flattenNode: FlattenNode = {
        ...omit(treeNode, [fieldTitle, fieldKey, fieldChildren] as any),
        title: treeNode[fieldTitle],
        key: mergedKey,
        parent,
        pos,
        children: [],
        data: treeNode,
        // isStart: [...(parent ? parent.isStart : []), index === 0],
        // isEnd: [...(parent ? parent.isEnd : []), index === list.length - 1],
      };

      flattenList.push(flattenNode);

      // Loop treeNode children
      if (expandedKeys === true || expandedKeySet.has(mergedKey)) {
        flattenNode.children = dig(treeNode[fieldChildren] || [], flattenNode);
      } else {
        flattenNode.children = [];
      }

      return flattenNode;
    });
  }

  dig(treeNodeList);

  return flattenList;
}

/**
 * 遍历节点
 * Traverse all the data by `treeData`.
 * Please not use it out of the `rc-tree` since we may refactor this code.
 */
export function traverseDataNodes(
  dataNodes: DataNode[],
  callback: (data: {
    node: DataNode;
    index: number;
    pos: string;
    key: Key;
    parentPos: string | number;
    parentNode: DataNode | null;
    level: number;
  }) => void,
  // To avoid too many params, let use config instead of origin param
  config?: TraverseDataNodesConfig | string,
) {
  let mergedConfig: TraverseDataNodesConfig = {};
  if (typeof config === 'object') {
    mergedConfig = config;
  } else {
    mergedConfig = { externalGetKey: config };
  }
  mergedConfig = mergedConfig || {};

  // Init config
  const { childrenPropName, externalGetKey, fieldNames } = mergedConfig;

  const { key: fieldKey, children: fieldChildren } = fillFieldNames(fieldNames);

  const mergeChildrenPropName = childrenPropName || fieldChildren;

  // Get keys
  let syntheticGetKey: (node: DataNode, pos?: string) => Key;
  if (externalGetKey) {
    if (typeof externalGetKey === 'string') {
      syntheticGetKey = (node: DataNode) =>
        (node as any)[externalGetKey as string];
    } else if (typeof externalGetKey === 'function') {
      syntheticGetKey = (node: DataNode) =>
        (externalGetKey as GetKey<DataNode>)(node);
    }
  } else {
    syntheticGetKey = (node, pos) => getKey(node[fieldKey], pos);
  }

  // Process
  function processNode(
    node: DataNode,
    index?: number,
    parent?: { node: DataNode; pos: string; level: number },
  ) {
    const children = node ? node[mergeChildrenPropName] : dataNodes;
    const pos = node ? getPosition(parent.pos, index) : '0';

    // Process node if is not root
    if (node) {
      const key: Key = syntheticGetKey(node, pos);
      const data = {
        node,
        index,
        pos,
        key,
        parentPos: parent.node ? parent.pos : null,
        parentNode: parent.node ? parent.node : null,
        level: parent.level + 1,
      };

      callback(data);
    }

    // Process children node
    if (children) {
      children.forEach((subNode, subIndex) => {
        processNode(subNode, subIndex, {
          node,
          pos,
          level: parent ? parent.level + 1 : -1,
        });
      });
    }
  }

  processNode(null);
}

interface Wrapper {
  posEntities: Record<string, DataEntity>;
  keyEntities: Record<Key, DataEntity>;
}

/**
 * Convert `treeData` into entity records.
 */
export function convertDataToEntities(
  dataNodes: DataNode[],
  {
    initWrapper,
    processEntity,
    onProcessFinished,
    externalGetKey,
    childrenPropName,
    fieldNames,
  }: {
    initWrapper?: (wrapper: Wrapper) => Wrapper;
    processEntity?: (entity: DataEntity, wrapper: Wrapper) => void;
    onProcessFinished?: (wrapper: Wrapper) => void;
    externalGetKey?: ExternalGetKey;
    childrenPropName?: string;
    fieldNames?: FieldNames;
  } = {},
) {
  // Init config
  const mergedExternalGetKey = externalGetKey;

  const posEntities = {};
  const keyEntities = {};
  let wrapper = {
    posEntities,
    keyEntities,
  };

  if (initWrapper) {
    wrapper = initWrapper(wrapper) || wrapper;
  }

  traverseDataNodes(
    dataNodes,
    (item) => {
      const { node, index, pos, key, parentPos, level } = item;
      const entity: DataEntity = { node, index, key, pos, level };

      const mergedKey = getKey(key, pos);

      posEntities[pos] = entity;
      keyEntities[mergedKey] = entity;

      // Fill children
      entity.parent = posEntities[parentPos];
      if (entity.parent) {
        entity.parent.children = entity.parent.children || [];
        entity.parent.children.push(entity);
      }

      if (processEntity) {
        processEntity(entity, wrapper);
      }
    },
    { externalGetKey: mergedExternalGetKey, childrenPropName, fieldNames },
  );

  if (onProcessFinished) {
    onProcessFinished(wrapper);
  }

  return wrapper;
}

export function traverseFindChildNode(targetNode: DataEntity, curKey: Key) {
  if (!targetNode) {
    return false;
  }
  if (Array.isArray(targetNode.children) && targetNode.children.length > 0) {
    return targetNode.children.some((node) => {
      if (node.key === curKey) {
        return true;
      } else {
        return traverseFindChildNode(node, curKey);
      }
    });
  } else {
    return false;
  }
}

type Imeta = {
  sourceKey;
  targetKey;
  adjustMethod: IAdjustMethod;
};
// 调整 node 位置
export function adjustTree(treeData: DataNode[], meta: Imeta) {
  let sourceNode, sourceParentNode, targetNode, targetParentNode;
  const { sourceKey, targetKey, adjustMethod } = meta;

  traverseDataNodes(treeData, (data) => {
    if (data.key === sourceKey) {
      sourceNode = data;
    }
    if (data.key === targetKey) {
      targetNode = data;
    }
  });

  if (!sourceNode) {
    throw new Error('Mtree adjustTree received an invalid sourceKey');
  }
  if (!targetNode) {
    throw new Error('Mtree adjustTree received an invalid targetKey');
  }

  function getParentNode(data) {
    return data.parentNode ? data.parentNode : { children: treeData };
  }

  function getNodeIndex(data) {
    const { node, pos, parentNode } = data;
    const index = +pos.split('-').pop();
    return index;
  }

  function removeNode(data) {
    const { parentNode } = data;
    const index = getNodeIndex(data);
    const parentChildren = (parentNode && parentNode.children) || treeData;
    parentChildren.splice(index, 1);
  }

  function insertBeforeNode(sourceData, targetData) {
    const targetParent = getParentNode(targetData);
    const targetChildren = targetParent.children;

    if (targetChildren) {
      const targetIndex = getNodeIndex(targetData);
      targetChildren.splice(targetIndex, 0, sourceData.node);
    } else {
      targetData.parentNode.children = [sourceData.node];
    }
  }

  function insertAfterNode(sourceData, targetData) {
    const targetParent = getParentNode(targetData);
    const targetChildren = targetParent.children;
    if (targetChildren) {
      const targetIndex = getNodeIndex(targetData);
      targetChildren.splice(targetIndex + 1, 0, sourceData.node);
    } else {
      targetData.parentNode.children = [sourceData.node];
    }
  }

  function insertNode(sourceData, targetData) {
    const targetChildren = targetData.node.children;
    if (targetChildren) {
      targetChildren.push(sourceData.node);
    } else {
      targetData.node.children = [sourceData.node];
    }
  }

  removeNode(sourceNode);

  const methodsMap = {
    insertBefore: insertBeforeNode,
    insert: insertNode,
    insertAfter: insertAfterNode,
  };

  const func = methodsMap[adjustMethod];
  func && func(sourceNode, targetNode);

  return treeData;
}
