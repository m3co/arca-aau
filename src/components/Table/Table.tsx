import React, { useState } from 'react';
import toString from 'lodash/toString';
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
  };

  const handleChangeNewRow = (cell: keyof tree) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setNewItem({
      ...newItem,
      [cell]: parseCell(cell, value),
    });
  };

  const handleChangeCheckboxNewRow = (cell: keyof tree) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewItem({
      ...newItem,
      [cell]: event.target.checked,
    });
  };

  const getField = (col: keyof tree, item: tree, isNewRow?: boolean) => {
    const handleCheckbox = isNewRow ? handleChangeCheckboxNewRow : handleChangeCheckbox;
    const handleInput = isNewRow ? handleChangeNewRow : handleChange;

    switch (col) {
      case 'Concreted':
        return (
          <Checkbox
            checked={!!item[col]}
            onChange={handleCheckbox(col)}
            color='default'
          />
        );
      case 'Description':
        return (
          <Input
            value={toString(item[col])}
            onChange={handleInput(col)}
            disableUnderline
            placeholder='Description'
          />
        );
      case 'Unit':
        return (
          <Input
            value={toString(item[col])}
            onChange={handleInput(col)}
            disableUnderline
            placeholder='Unit'
          />
        );
      case 'Estimated':
        return (
          <Input
            onChange={handleInput(col)}
            value={item[col] ? parseToCurrencyFormat(toString(item[col])) : ''}
            disableUnderline
            placeholder='$0'
          />
        );
      case 'P':
        return (
          <Input
            onChange={handleInput(col)}
            value={toString(item[col])}
            disableUnderline
            placeholder='0.000'
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
