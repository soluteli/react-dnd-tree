export type Key = string | number;

export interface DataNode {
  key: Key;
  title?: React.ReactNode;
  disabled?: boolean;
  children?: DataNode[];
}

export interface FlattenNode {
  key: Key;
  parent: FlattenNode | null;
  children: FlattenNode[];
  pos: string;
  data: DataNode;
  title: React.ReactNode;
  // isStart: boolean[];
  // isEnd: boolean[];
}

export type GetKey<RecordType> = (record: RecordType, index?: number) => Key;

export interface FieldNames {
  title?: string;
  key?: string;
  children?: string;
}

export type keyEntitiesType = Record<Key, DataEntity>;

export type INodeSelect = (key: Key, data: DataEntity) => void;
export type INodeExpand = (key: Key, data: DataEntity) => void;

type INodeDropItem = {
  dragNode: DataEntity;
  dropNode: DataEntity;
  dropMethod: IAdjustMethod;
};

export type IInternalNodeDropItem = {
  sourceKey: Key;
  targetKey: Key;
  adjustMethod: IAdjustMethod;
};

export interface TreeContextProps {
  expandKeys: Key[];
  selectedKeys: Key[];
  keyEntities: keyEntitiesType;
  canDrag: Boolean;
  onNodeSelect: INodeSelect;
  onNodeExpand: INodeExpand;
  onNodeDrop: (data: IInternalNodeDropItem) => void;
}

export interface TreeProps {
  /**
   * @description.zh-CN 树形数据
   * @default
   */
  treeData: DataNode[];

  /**
   * @description.zh-CN 已展开的节点, 不传时为非受控组件
   * @default
   */
  expandKeys?: Key[];

  /**
   * @description.zh-CN 已选中的节点(目前只支持单选), 不传时为非受控组件
   * @default
   */
  selectedKeys?: Key[];

  /**
   * @description.zh-CN 是否可拖拽
   * @default     true
   */
  drag?: Boolean;

  /**
   * @description.zh-CN 树形数据（仅拖拽时）变化时的回调
   * @default
   */
  onTreeDataChange?: (data: DataNode[]) => void;

  /**
   * @description.zh-CN 节点选中时的回调
   * @default
   */
  onNodeSelect?: (
    selectedKeys: Key[],
    data: { selected: Boolean; node: DataEntity; selectedNodes: DataEntity[] },
  ) => void;

  /**
   * @description.zh-CN 节点展开时的回调
   * @default
   */
  onNodeExpand?: (
    expandKeys: Key[],
    data: { expand: Boolean; node: DataEntity; expandNodes: DataEntity[] },
  ) => void;

  /**
   * @description.zh-CN 节点放置前的判断，可以通过它来祖师节点放置
   * @default
   */
  beforeNodeDrop?: (data: INodeDropItem) => Promise<Boolean>;
}

export interface TreeProps {
  treeData: DataNode[];
}
export interface TreeNodeProps {
  data: FlattenNode;
}

export interface Entity {
  // todo
  // node: NodeElement;
  index: number;
  key: Key;
  pos: string;
  parent?: Entity;
  children?: Entity[];
}

export interface DataEntity
  extends Omit<Entity, 'node' | 'parent' | 'children'> {
  node: DataNode;
  parent?: DataEntity;
  children?: DataEntity[];
  level: number;
}

export type IAdjustMethod = 'insertBefore' | 'insert' | 'insertAfter';
