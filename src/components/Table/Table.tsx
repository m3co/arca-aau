import React, { useState } from 'react';
import toString from 'lodash/toString';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Input from '@material-ui/core/Input';
import Checkbox from '@material-ui/core/Checkbox';
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
});

interface AAUTableProps {
  treeItem: tree,
}

const AAUTable: React.FunctionComponent<AAUTableProps> = ({
  treeItem,
}) => {
  const classes = useStyles();
  const columns = ['Concreted', 'Description', 'Unit', 'P', 'Estimated'];

  const [item, setItem] = useState(treeItem);

  const onBlurCell = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

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

  const getField = (col: keyof tree) => {
    switch (col) {
      case 'Concreted':
        return (
          <Checkbox
            checked={!!item[col]}
            onChange={handleChangeCheckbox(col)}
            color='default'
          />
        );
      case 'Description':
        return (
          <Input
            value={item[col]}
            onChange={handleChange(col)}
            disableUnderline
            placeholder='Description'
          />
        );
      case 'Unit':
        return (
          <Input
            value={item[col]}
            onChange={handleChange(col)}
            disableUnderline
            placeholder='Unit'
          />
        );
      case 'Estimated':
        return (
          <Input
            onChange={handleChange(col)}
            value={item[col] ? parseToCurrencyFormat(toString(item[col])) : ''}
            disableUnderline
            placeholder='$0'
          />
        );
      case 'P':
        return (
          <Input
            onChange={handleChange(col)}
            value={toString(item[col])}
            disableUnderline
            placeholder='0.000'
          />
        );
      default:
        return (
          <Input
            value={item[col]}
            disableUnderline
            disabled
          />
        );
    }
  };

  return (
    <TableContainer>
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
                  { getField(col) }
                </TableCell>
              ))
            }
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AAUTable;
