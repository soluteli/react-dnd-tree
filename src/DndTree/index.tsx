import React, { useState, useEffect } from 'react';
import TreeContext from './TreeContext';
import TreeNode from './TreeNode';
import {
  DataEntity,
  DataNode,
  FlattenNode,
  IInternalNodeDropItem,
  Key,
  keyEntitiesType,
  TreeProps,
} from './types';
import { flattenTreeData, convertDataToEntities } from './utils/treeUtil';

import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

import { adjustTree } from './utils/treeUtil';

const Tree: React.FC<TreeProps> = (props) => {
  const { drag: canDrag = true } = props;
  const [treeData, setTreeData] = useState<DataNode[]>(props.treeData || []);
  const [flattenNodes, setFlattenNodes] = useState<FlattenNode[]>([]);

  // 展开的 TreeNode
  const [expandKeys, setExpandKeys] = useState<Key[]>(props.expandKeys || []);
  const [selectedKeys, setSelectedKeys] = useState<Key[]>(
    props.selectedKeys || [],
  );
  const [keyEntities, setKeyEntities] = useState<keyEntitiesType>({});

  useEffect(() => {
    if (Array.isArray(props.treeData)) {
      setTreeData(props.treeData);
    }
  }, [props.treeData]);

  useEffect(() => {
    if (Array.isArray(props.expandKeys)) {
      setExpandKeys(props.expandKeys);
    }
  }, [props.expandKeys]);

  useEffect(() => {
    if (Array.isArray(props.selectedKeys)) {
      setSelectedKeys(props.selectedKeys);
    }
  }, [props.selectedKeys]);

  useEffect(() => {
    const keyEntities = convertDataToEntities(props.treeData);
    setKeyEntities(keyEntities.keyEntities);
    const flattenNodes = flattenTreeData(treeData, expandKeys);
    setFlattenNodes(flattenNodes);
  }, [treeData, expandKeys]);

  const handleNodeSelect = (key, data) => {
    const keyIndex = selectedKeys.findIndex((item) => item === key);
    let newSelectedKeys = [...selectedKeys];
    const isCancelSelected = keyIndex > -1;
    if (isCancelSelected) {
      // newSelectedKeys.splice(keyIndex, 1)
      newSelectedKeys = [];
    } else {
      newSelectedKeys = [key];
    }
    setSelectedKeys(newSelectedKeys);
    props.onNodeSelect &&
      props.onNodeSelect(newSelectedKeys, {
        selected: !isCancelSelected,
        node: data,
        selectedNodes: newSelectedKeys.map((k) => keyEntities[k]),
      });
  };

  const handleNodeExpand = (key, data) => {
    const nodeIndex = expandKeys.indexOf(key);
    const isShrink = nodeIndex > -1;
    if (isShrink) {
      expandKeys.splice(nodeIndex, 1);
    } else {
      expandKeys.push(key);
    }
    // hooks 默认会浅比较
    const newExpandKeys = [...expandKeys];
    setExpandKeys(newExpandKeys);
    props.onNodeExpand &&
      props.onNodeExpand(newExpandKeys, {
        expand: !isShrink,
        node: data,
        expandNodes: newExpandKeys.map((k) => keyEntities[k]),
      });
  };

  const handleNodeDrop = (data: IInternalNodeDropItem) => {
    function doNodeDrop() {
      // adjustTree 不触发引用变化
      const newTreeData = adjustTree(treeData, data);
      setTreeData([...newTreeData]);
      // onTreeDataChange 只在拖拽时触发，且不改变数据引用，这样可以避免 props.treeData 变化时反复 render
      props.onTreeDataChange && props.onTreeDataChange(newTreeData);
    }
    if (props.beforeNodeDrop) {
      if (typeof props.beforeNodeDrop === 'function') {
        const dragNode = keyEntities[data.sourceKey];
        const dropNode = keyEntities[data.targetKey];
        const result = props.beforeNodeDrop({
          dragNode,
          dropNode,
          dropMethod: data.adjustMethod,
        });
        if (!result.then) {
          throw new Error('Mtree prop beforeNodeDrop must Return an promise');
        }
        result.then((canDrop) => {
          if (canDrop) {
            doNodeDrop();
          }
        });
      } else {
        throw new Error('Mtree prop beforeNodeDrop is not a function');
      }
    } else {
      doNodeDrop();
    }
  };

  return (
    <div className="mtree-root-contaner">
      <TreeContext.Provider
        value={{
          expandKeys,
          selectedKeys,
          keyEntities,
          canDrag,
          onNodeSelect: handleNodeSelect,
          onNodeDrop: handleNodeDrop,
          onNodeExpand: handleNodeExpand,
        }}
      >
        <DndProvider backend={HTML5Backend}>
          {flattenNodes.map((item) => {
            return <TreeNode key={item.key} data={item} />;
          })}
        </DndProvider>
      </TreeContext.Provider>
    </div>
  );
};

export default Tree;
