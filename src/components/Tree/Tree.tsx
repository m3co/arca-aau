import React from 'react';
import { State } from 'arca-redux-v4';
import TreeView from '@material-ui/lab/TreeView';
import { parseTreeItems } from '../../utils';
import { tree } from '../../types';
import ArcaTreeItem from './TreeItem';

interface TreeProps {
  treeItems: State['Source']['AAU-Concretize'],
}

const Tree: React.FunctionComponent<TreeProps> = ({
  treeItems,
}) => {
  const parsedTrees = parseTreeItems(treeItems);

  const getTreeItem = (treeItems: tree[]) => treeItems.map(item => (
    <ArcaTreeItem key={item.Key} treeItem={item} getTreeItem={getTreeItem} />
  ));

  return <TreeView>{ getTreeItem(parsedTrees) }</TreeView>;
};

export default Tree;
