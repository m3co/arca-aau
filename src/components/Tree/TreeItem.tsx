import React, { Fragment } from 'react';
import toString from 'lodash/toString';
import { makeStyles } from '@material-ui/core/styles';
import TreeItem from '@material-ui/lab/TreeItem';
import Divider from '@material-ui/core/Divider';
import Description from '@material-ui/icons/Description';
import Folder from '@material-ui/icons/Folder';
import { isKeyWithDash, parseToCurrencyFormat } from '../../utils';
import { tree } from '../../types';
import AAUTable from '../Table/Table';

interface ArcaTreeItemProps {
  treeItem: tree,
  getTreeItem: (item: tree[]) => React.ReactNode,
}

const useStyles = makeStyles({
  treeItem: {
    position: 'relative',
    marginTop: 10,
    '& .MuiTreeItem-group': {
      borderLeft: '1px solid #999999',
      marginLeft: 8,
      paddingLeft: 8,
    },
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
    margin: '0 0 0 5px',
  },
  labelUnit: {
    fontSize: 14,
    lineHeight: '14px',
    color: '#999999',
    margin: '0 5px 5px 5px',
  },
  folder: {
    color: '#999999',
  },
  description: {
    padding: '32px 24px 0',
  },
});

const ArcaTreeItem: React.FunctionComponent<ArcaTreeItemProps> = ({
  treeItem, getTreeItem,
}) => {
  const classes = useStyles();
  const keyClasses = isKeyWithDash(treeItem.Key) ? classes.labelTitleWithDash : classes.labelTitle;
  const estimated = treeItem.Estimated ? parseToCurrencyFormat(String(treeItem.Estimated)) : '';
  const p = treeItem.P ? `P=${treeItem.P}` : '';
  const labelTwo = [toString(treeItem.Unit), p, estimated].join(' ');

  return (
    <TreeItem
      className={classes.treeItem}
      icon={treeItem.items ? <Folder className={classes.folder} /> : <Description />}
      key={treeItem.Key}
      nodeId={treeItem.Key}
      label={(
        <Fragment>
          <h2 className={keyClasses}>{`${treeItem.Key}`}</h2>
          <p className={classes.labelDesc}>{ treeItem.Description }</p>
          <p className={classes.labelUnit}>{ labelTwo }</p>
        </Fragment>
      )}
    >
      <div className={classes.description}>
        <AAUTable treeItem={treeItem} />
      </div>
      <Divider />
      { treeItem.items && getTreeItem(treeItem.items) }
    </TreeItem>
  );
};

export default ArcaTreeItem;
