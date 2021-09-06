import React from 'react';
import { TreeContextProps } from './types';
const TreeContext = React.createContext<TreeContextProps | null>(null);
export default TreeContext;
