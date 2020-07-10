import React, { Fragment } from 'react';
import { State } from 'arca-redux-v4';
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import Description from '@material-ui/icons/Description';
import Folder from '@material-ui/icons/Folder';
import TreeItem from '@material-ui/lab/TreeItem';
import { parseTreeItems, isKeyWithDash } from '../../utils';
import { tree } from '../../types';

interface TreeProps {
  treeItems: State['Source']['AAU-Concretize'],
}

const useStyles = makeStyles({
  root: {
    height: 240,
    flexGrow: 1,
    maxWidth: 400,
  },
  treeItem: {
    marginTop: 10,
    '& .MuiTreeItem-group': {
      borderLeft: '1px solid #999999',
      marginLeft: 8,
      paddingLeft: 8,
    },
  },
  folder: {
    color: '#999999',
  },
  file: {
    color: '#61dafb',
  },
  labelTitle: {
    fontSize: 16,
    lineHeight: '16px',
    margin: '5px 5px 0 5px',
  },
  labelTitleWithDash: {
    fontSize: 16,
    lineHeight: '16px',
    margin: '5px 5px 0 5px',
    color: '#999999',
  },
  labelDesc: {
    fontSize: 14,
    lineHeight: '14px',
    color: '#999999',
    margin: '0 5px 5px 5px',
  },
});

const Tree: React.FunctionComponent<TreeProps> = ({
  treeItems,
}) => {
  const classes = useStyles();
  const parsedTrees = parseTreeItems(treeItems);

  const onClickTreeItem = (item: tree) => (event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
  };

  const getTreeItem = (treeItems: tree[]) => treeItems.map((item, i) => {
    const keyClasses = isKeyWithDash(item.Key)
      ? classes.labelTitleWithDash
      : classes.labelTitle;

    if (item.items) {
      return (
        <TreeItem
          className={classes.treeItem}
          key={item.Key + String(i)}
          nodeId={item.Key}
          label={(
            <Fragment>
              <h2 className={keyClasses}>{`${item.Key}`}</h2>
              <p className={classes.labelDesc}>{ item.Description }</p>
            </Fragment>
          )}
        >
          {
            getTreeItem(item.items)
          }
        </TreeItem>
      );
    }

    return (
      <TreeItem
        className={classes.treeItem}
        key={item.Key + String(i)}
        nodeId={item.Key}
        onLabelClick={onClickTreeItem(item)}
        onIconClick={onClickTreeItem(item)}
        label={(
          <Fragment>
            <h2 className={keyClasses}>{`${item.Key}`}</h2>
            <p className={classes.labelDesc}>{ item.Description }</p>
          </Fragment>
        )}
      />
    );
  });

  return (
    <TreeView
      defaultCollapseIcon={<Folder className={classes.folder} />}
      defaultExpandIcon={<Folder className={classes.folder} />}
      defaultEndIcon={<Description />}
    >
      {
        getTreeItem(parsedTrees)
      }
    </TreeView>
  );
};

export default Tree;
