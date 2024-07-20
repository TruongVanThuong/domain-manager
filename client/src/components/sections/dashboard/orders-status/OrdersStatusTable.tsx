import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';
import DataGridFooter from 'components/common/DataGridFooter';
import {
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridApi,
  GridColDef,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  useGridApiRef,
} from '@mui/x-data-grid';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
// import axios from 'axios';

interface Domain {
  id: number | string;
  domain: string;
  ip: string;
  date: string | Date;
  isNew?: boolean;
}

interface OrdersStatusTableProps {
  searchText: string;
  rows: Domain[];
  onUpdateRow: (updatedRow: Domain) => void;
  onDeleteRow: (id: GridRowId) => void;
}

const OrdersStatusTable = ({ searchText, rows, onUpdateRow, onDeleteRow  }: OrdersStatusTableProps) => {
  const apiRef = useGridApiRef<GridApi>();
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<GridRowModel | null>(null);

  useEffect(() => {
    apiRef.current.setQuickFilterValues(searchText.split(/\b\W+\b/).filter((word) => word !== ''));
  }, [searchText, apiRef, rows]);

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleShowClick = (id: GridRowId) => {
    const row = rows.find((r) => r.id === id);
    setSelectedRow(row || null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRow(null);
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    // const editedRow = rows.find((  row) => row.id === id);
    // if (editedRow) {
    //   onUpdateRow(editedRow);
    // }
  };
  
  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
    
    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      // setRows(rows.filter((row) => row.id !== id));
    }
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    onDeleteRow(id);
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false } as Domain;
    onUpdateRow(updatedRow);
    return updatedRow;
  };


  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      minWidth: 80,
      flex: 1,
      resizable: false,
    },
    {
      field: 'domain',
      headerName: 'Domain',
      sortable: false,
      flex: 1,
      minWidth: 120,
      resizable: false,
      editable: true,
      renderHeader: () => (
        <Stack alignItems="center" gap={0.75}>
          <Typography mt={0.175} variant="caption" letterSpacing={0.5}>
            Domain
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'ip',
      headerName: 'IP',
      sortable: false,
      flex: 1,
      minWidth: 120,
      resizable: false,
      editable: true,
      renderHeader: () => (
        <Stack alignItems="center" gap={0.75}>
          <Typography mt={0.175} variant="caption" letterSpacing={0.5}>
            IP
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'date',
      type: 'dateTime',
      headerName: 'Date',
      editable: true,
      minWidth: 100,
      flex: 1,
      resizable: false,
      renderHeader: () => (
        <Stack alignItems="center" gap={0.75}>
          <IconifyIcon icon="mdi:calendar" color="neutral.main" fontSize="body1.fontSize" />
          <Typography mt={0.175} variant="caption" letterSpacing={0.5}>
            Date
          </Typography>
        </Stack>
      ),
      valueGetter: (date) => {
        return new Date(date);
      },
      // renderCell: (date) => format(new Date(date), 'MMM dd, yyyy'),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      minWidth: 120,
      flex: 1,
      cellClassName: 'actions',
      resizable: false,
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<IconifyIcon color="primary.main" icon="mdi:content-save" sx={{ fontSize: 'body1.fontSize' }} />}
              label="Save"
              onClick={handleSaveClick(id)}
              size="small"
            />,
            <GridActionsCellItem
              icon={<IconifyIcon color="text.secondary" icon="iconamoon:sign-times-duotone" sx={{ fontSize: 'body1.fontSize' }} />}
              label="Cancel"
              onClick={handleCancelClick(id)}
              size="small"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<IconifyIcon icon="mdi:eye" color="text.secondary" sx={{ fontSize: 'body1.fontSize' }} />}
            label="Show"
            onClick={() => handleShowClick(id)}
            size="small"
          />,
          <GridActionsCellItem
            icon={<IconifyIcon icon="fluent:edit-32-filled" color="text.secondary" sx={{ fontSize: 'body1.fontSize' }} />}
            label="Edit"
            onClick={handleEditClick(id)}
            size="small"
          />,
          <GridActionsCellItem
            icon={<IconifyIcon icon="mingcute:delete-3-fill" color="text.secondary" sx={{ fontSize: 'body1.fontSize' }} />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            size="small"
          />,
        ];
      },
    },
  ];

  return (
    <>
      <DataGrid
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        rowHeight={80}
        editMode="row"
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 6,
            },
          },
          sorting: {
            sortModel: [{ field: 'id', sort: 'desc' }],
          },
        }}
        checkboxSelection
        pageSizeOptions={[6]}
        disableColumnMenu
        disableVirtualization
        disableRowSelectionOnClick
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{
          pagination: DataGridFooter,
        }}
        slotProps={{
          toolbar: { 
            // setRows, 
            setRowModesModel 
          },
        }}
      />
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          color: '#000',
        }}>
          <Typography id="modal-title" variant="h6" component="h2">
            Chi tiết
          </Typography>
          {selectedRow && (
            <Box id="modal-description" sx={{ mt: 2 }}>
              <Typography>ID: {selectedRow.id}</Typography>
              <Typography>Name Server: {selectedRow.domain}</Typography>
              <Typography>IP: {selectedRow.ip}</Typography>
              <Typography>Date: {format(new Date(selectedRow.date), 'MMM dd, yyyy')}</Typography>
            </Box>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default OrdersStatusTable;
