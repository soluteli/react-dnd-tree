# 使用示例

## 基础示例

```tsx
import React from 'react';
import { DndTree } from 'kh-react-dnd-tree';

const x = 3;
const y = 2;
const z = 1;
const gData = [];

const generateData = (_level, _preKey, _tns) => {
  const preKey = _preKey || '0';
  const tns = _tns || gData;

  const children = [];
  for (let i = 0; i < x; i++) {
    const key = `${preKey}-${i}`;
    tns.push({ title: key, key });
    if (i < y) {
      children.push(key);
    }
  }
  if (_level < 0) {
    return tns;
  }
  const level = _level - 1;
  children.forEach((key, index) => {
    tns[index].children = [];
    return generateData(level, key, tns[index].children);
  });
};
generateData(z);

export default () => {
  // const handleNodeSelect = (key, data) => {
  //   console.log('handleNodeSelect', key, data);
  // };
  // const handleNodeExpand = (key, data) => {
  //   console.log('handleNodeExpand', key, data);
  // };

  // const handleTreeDataChange = (data) => {
  //   console.log('handleTreeDataChange', data);
  // };
  return (
    <DndTree
      treeData={gData}
      // onNodeSelect={handleNodeSelect}
      // onNodeExpand={handleNodeExpand}
      // onTreeDataChange={handleTreeDataChange}
    />
  );
};
```

## 拖拽确认

```tsx
import React, { useState } from 'react';
import { DndTree } from 'kh-react-dnd-tree';

const x = 3;
const y = 2;
const z = 1;
const gData = [];

const generateData = (_level, _preKey, _tns) => {
  const preKey = _preKey || '0';
  const tns = _tns || gData;

  const children = [];
  for (let i = 0; i < x; i++) {
    const key = `${preKey}-${i}`;
    tns.push({ title: key, key });
    if (i < y) {
      children.push(key);
    }
  }
  if (_level < 0) {
    return tns;
  }
  const level = _level - 1;
  children.forEach((key, index) => {
    tns[index].children = [];
    return generateData(level, key, tns[index].children);
  });
};
generateData(z);

export default () => {
  const handleBeforeNodeDrop = (data) => {
    console.log('handleBeforeNodeDrop', data);
    return new Promise((r, j) => {
      const canDrop = confirm('确定要放置吗？');
      r(canDrop);
    });
  };
  return (
    <>
      <DndTree treeData={gData} beforeNodeDrop={handleBeforeNodeDrop} />
    </>
  );
};
```

More skills for writing demo: https://d.umijs.org/guide/basic#write-component-demo

## 禁用拖拽

```tsx
import React, { useState } from 'react';
import { DndTree } from 'kh-react-dnd-tree';

const x = 3;
const y = 2;
const z = 1;
const gData = [];

const generateData = (_level, _preKey, _tns) => {
  const preKey = _preKey || '0';
  const tns = _tns || gData;

  const children = [];
  for (let i = 0; i < x; i++) {
    const key = `${preKey}-${i}`;
    tns.push({ title: key, key });
    if (i < y) {
      children.push(key);
    }
  }
  if (_level < 0) {
    return tns;
  }
  const level = _level - 1;
  children.forEach((key, index) => {
    tns[index].children = [];
    return generateData(level, key, tns[index].children);
  });
};
generateData(z);

export default () => {
  return (
    <>
      <DndTree treeData={gData} drag={false} />
    </>
  );
};
```
