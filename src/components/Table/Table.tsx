import React, { useState } from 'react';
import toString from 'lodash/toString';
import { Row, State } from 'arca-redux-v4';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableFooter from '@material-ui/core/TableFooter';
import TableRow from '@material-ui/core/TableRow';
import Input from '@material-ui/core/Input';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { socket } from '../../redux/store';
import { tree } from '../../types';
import { parseToCurrencyFormat, parseCell } from '../../utils';

const useStyles = makeStyles({
  col: {
    textTransform: 'capitalize',
  },
  cell: {
    '&:hover': {
      backgroundColor: '#f7f7f7',
    },
  },
  addCell: {
    borderBottom: 'none',
  },
  addRow: {
    marginBottom: 32,
  },
});

interface AAUTableProps {
  treeItem: tree,
}

const AAUTable: React.FunctionComponent<AAUTableProps> = ({
  treeItem,
}) => {
  const classes = useStyles();
  const columns = ['Concreted', 'Description', 'Unit', 'P', 'Estimated'];

  const [isAddMode, setAddMode] = useState(false);
  const [item, setItem] = useState(treeItem);
  const [newItem, setNewItem] = useState({} as tree);

  const toggleAddMode = () => {
    setAddMode(!isAddMode);
  };

  const createRow = () => {
    onSubmit('AAU', newItem, true);
  };

  const onSubmit = (source: keyof State['Source'], itemToSend: tree, isNewRow?: boolean) => {
    const parsedItem = {
      ...(isNewRow ? { Concreted: false } : { Concreted: itemToSend.Concreted }),
      Description: itemToSend.Description,
      Estimated: itemToSend.Estimated,
      Expand: itemToSend.Expand,
      ...(isNewRow ? {} : { Key: itemToSend.Key }),
      P: Number(itemToSend.P),
      ...(isNewRow ? { Parent: item.Key } : { Parent: itemToSend.Parent }),
      Project: itemToSend.Project,
      Unit: itemToSend.Unit,
    } as Row;

    if (isNewRow) {
      socket.insert(source, parsedItem);
      toggleAddMode();
    } else {
      socket.update(source, parsedItem, { Key: itemToSend.Key });
    }
  };

  const handleChange = (cell: keyof tree) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setItem({
      ...item,
      [cell]: parseCell(cell, value),
    });
  };

  const handleChangeCheckbox = (cell: keyof tree) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setItem({
      ...item,
      [cell]: event.target.checked,
    });

    onSubmit('AAU-Concretize', {
      ...item,
      [cell]: event.target.checked,
    });
  };

  const handleChangeNewRow = (cell: keyof tree) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setNewItem({
      ...newItem,
      [cell]: parseCell(cell, value),
    });
  };

  const onKeyPress = (isNewRow?: boolean) => (event: React.KeyboardEvent<HTMLInputElement>) => {
    const itemToSubmit = isNewRow ? newItem : item;

    if (event.key === 'Enter') {
      onSubmit('AAU', itemToSubmit, isNewRow);
    }
  };

  const onBlurCell = (isNewRow?: boolean) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isNewRow) {
      onSubmit('AAU', item);
    }
  };

  const getField = (col: keyof tree, item: tree, isNewRow?: boolean) => {
    const handleInput = isNewRow ? handleChangeNewRow : handleChange;

    switch (col) {
      case 'Concreted':
        return (
          <Checkbox
            checked={!!item[col]}
            {...(isNewRow ? {} : { onChange: handleChangeCheckbox(col) })}
            color='default'
            disabled={isNewRow}
          />
        );
      case 'Description':
        return (
          <Input
            value={toString(item[col])}
            onChange={handleInput(col)}
            disableUnderline
            placeholder='Description'
            onKeyPress={onKeyPress(isNewRow)}
            onBlur={onBlurCell(isNewRow)}
          />
        );
      case 'Unit':
        return (
          <Input
            value={toString(item[col])}
            onChange={handleInput(col)}
            disableUnderline
            placeholder='Unit'
            onKeyPress={onKeyPress(isNewRow)}
            onBlur={onBlurCell(isNewRow)}
          />
        );
      case 'Estimated':
        return (
          <Input
            onChange={handleInput(col)}
            value={item[col] ? parseToCurrencyFormat(toString(item[col])) : ''}
            disableUnderline
            placeholder='$0'
            onKeyPress={onKeyPress(isNewRow)}
            onBlur={onBlurCell(isNewRow)}
          />
        );
      case 'P':
        return (
          <Input
            onChange={handleInput(col)}
            value={toString(item[col])}
            disableUnderline
            placeholder='0.000'
            onKeyPress={onKeyPress(isNewRow)}
            onBlur={onBlurCell(isNewRow)}
          />
        );
      default:
        return (
          <Input
            value={toString(item[col])}
            disableUnderline
            disabled
          />
        );
    }
  };

  return (
    <TableContainer className={isAddMode ? classes.addRow : ''}>
      <Table size='small'>
        <TableHead>
          <TableRow>
            {
              columns.map((col, i) => (
                <TableCell className={classes.col} key={`${col[1]}-${String(i)}`}>{col}</TableCell>
              ))
            }
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {
              columns.map((col: keyof tree, index) => (
                <TableCell
                  key={`${col[1]}-${String(index)}}`}
                  className={classes.cell}
                >
                  { getField(col, item) }
                </TableCell>
              ))
            }
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5} align='center' className={classes.addCell}>
              <IconButton onClick={toggleAddMode}>
                { isAddMode ? <CancelIcon fontSize='small' /> : <AddCircleIcon fontSize='small' /> }
              </IconButton>
              {
                isAddMode && (
                  <IconButton onClick={createRow}>
                    <CheckCircleIcon fontSize='small' />
                  </IconButton>
                )
              }
            </TableCell>
          </TableRow>
          {
            isAddMode && (
              <TableRow>
                {
                  columns.map((col: keyof tree, index) => (
                    <TableCell
                      key={`${col[1]}-${String(index)}}`}
                      className={classes.cell}
                    >
                      { getField(col, newItem, true) }
                    </TableCell>
                  ))
                }
              </TableRow>
            )
          }
        </TableFooter>
      </Table>
    </TableContainer>
  );
};

export default AAUTable;
