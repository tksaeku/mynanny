import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import './DataTable.scss';

const DataTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  showActions = true,
  emptyMessage = 'No entries found',
  defaultSort = { column: null, direction: 'desc' }
}) => {
  const [sortConfig, setSortConfig] = useState(defaultSort);

  const handleSort = (columnId) => {
    setSortConfig((prev) => ({
      column: columnId,
      direction: prev.column === columnId && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.column) return data;

    const column = columns.find((c) => c.id === sortConfig.column);
    if (!column) return data;

    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.column];
      let bVal = b[sortConfig.column];

      // Handle date sorting
      if (column.type === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      // Handle numeric sorting
      if (column.type === 'number') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, columns]);

  if (data.length === 0) {
    return (
      <div className="data-table__empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <TableContainer component={Paper} className="data-table" elevation={0}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                className="data-table__header-cell"
                style={{ width: column.width }}
                sortDirection={sortConfig.column === column.id ? sortConfig.direction : false}
              >
                {column.sortable ? (
                  <TableSortLabel
                    active={sortConfig.column === column.id}
                    direction={sortConfig.column === column.id ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
            {showActions && (
              <TableCell align="right" className="data-table__header-cell data-table__actions-cell">
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((row) => (
            <TableRow key={row.id} className="data-table__row">
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  className="data-table__cell"
                >
                  {column.render ? column.render(row[column.id], row) : row[column.id]}
                </TableCell>
              ))}
              {showActions && (
                <TableCell align="right" className="data-table__cell data-table__actions-cell">
                  {onEdit && (
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(row)}
                        className="data-table__action-btn"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onDelete && (
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(row)}
                        className="data-table__action-btn data-table__action-btn--delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
