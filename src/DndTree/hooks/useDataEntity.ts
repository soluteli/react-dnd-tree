import TreeContext from '../TreeContext';
import { Key } from '../types';
import { useContext } from 'react';

export default function useDataEntity(key: Key) {
  const treeContext = useContext(TreeContext);
  const { keyEntities, expandKeys, onNodeExpand } = treeContext;
  const dataEntity = keyEntities[key];
  return dataEntity;
}
