import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  emptyMessage = 'No entries found'
}) => {
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
              >
                {column.label}
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
          {data.map((row) => (
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
