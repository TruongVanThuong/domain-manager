import { fontFamily } from 'theme/typography';
import {
  useState,
  useEffect,
  ChangeEvent
} from 'react';
import {
  GridRowId,
} from '@mui/x-data-grid';
import axios from 'axios';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import DateSelect from 'components/dates/DateSelect';
import IconifyIcon from 'components/base/IconifyIcon';
import OrdersStatusTable from './OrdersStatusTable';
import Modal from '@mui/material/Modal';
import toastr from 'toastr';

interface Domain {
  id: number | string;
  domain: string;
  ip: string;
  date: string | Date;
}

const API_URL = "http://localhost:5000";

const OrdersStatus = () => {
  const [searchText, setSearchText] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  // const [newDomain, setNewDomain] = useState({ id: '', ip: '', domain: '', date: '' });
  const [inputDomain, setInputDomain] = useState(''); // Thêm state để giữ dữ liệu nhập

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/orders-status`); // Đảm bảo endpoint chính xác
      setDomains(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      toastr.error('Lỗi khi lấy dữ liệu.');
    }
  };

  const addDomain = async () => {

    if (!inputDomain) {
      toastr.error('Vui lòng không để trống dữ liệu.');
      return;
    }

    // Tách domain và IP từ inputDomain
    let domain = inputDomain;
    let ip = '';

    // Xóa tiền tố http:// hoặc https:// nếu có
    domain = domain.replace(/^https?:\/\//, '');

    // Tách phần IP nếu có
    if (domain.includes(':')) {
      const parts = domain.split(':');
      domain = parts[0];
      ip = parts[1];
    }

    const newDomainData: Domain = {
      id: new Date().toISOString().replace(/[-:]/g, '').split('.')[0], // hoặc một cách khác để tạo id duy nhất
      domain: domain,
      ip: ip,
      date: new Date(),
    };

    try {
      const response = await axios.post(`${API_URL}/api/orders-status`, newDomainData);
      const addedDomain = response.data; // Giả sử server trả về domain đã được thêm
      setDomains(prevDomains => [...prevDomains, addedDomain]); // Cập nhật state trực tiếp
      setOpenModal(false);
      setInputDomain(''); // Đặt lại trường nhập dữ liệu
      toastr.success('Domain đã được thêm thành công.');
    } catch (error) {
      console.error('Lỗi khi thêm Domain:', error);
      toastr.error('Lỗi khi thêm Domain.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleUpdateRow = async (updatedRow: Domain) => {
    try {
      // Gọi API để cập nhật dữ liệu trên server
      const response = await axios.put(`${API_URL}/api/orders-status/${updatedRow.id}`, updatedRow);
      const updatedData = response.data;

      if (response.status === 200) {
        // Cập nhật state local nếu server trả về thành công
        setDomains(prevDomains => prevDomains.map(domain =>
          domain.id === updatedData.id ? updatedData : domain
        ));
        toastr.success('Cập nhật thành công');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      toastr.error('Có lỗi xảy ra khi cập nhật');
    }
  };

  const handleDeleteRow = async (id: GridRowId) => {
    try {
      // Gọi API để xóa dữ liệu trên server
      const response = await axios.delete(`${API_URL}/api/orders-status/${id}`);

      if (response.status === 200) {
        // Cập nhật state local nếu server trả về thành công
        setDomains(prevDomains => prevDomains.filter(domain => domain.id !== id));
        toastr.success('Xóa thành công');
      }
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      toastr.error('Có lỗi xảy ra khi xóa');
    }
  };

  const handleInputDomainChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputDomain(e.target.value);
  };

  return (
    <Paper sx={{ px: 0 }}>
      <Stack
        px={3.5}
        spacing={1.5}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
      >
        <Stack
          spacing={2}
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          flexGrow={1}
        >
          <Typography variant="h6" fontWeight={400} fontFamily={fontFamily.workSans}>
            Orders Status
          </Typography>
          <TextField
            variant="filled"
            size="small"
            placeholder="Search for..."
            value={searchText}
            onChange={handleInputChange}
            sx={{ width: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconifyIcon icon={'mingcute:search-line'} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        <Stack
          spacing={1.5}
          direction={{ xs: 'column-reverse', sm: 'row' }}
          alignItems={{ xs: 'flex-end', sm: 'center' }}
        >
          <DateSelect />
          <Button variant="contained" size="small" onClick={handleOpenModal}>
            Create order
          </Button>
        </Stack>
      </Stack>

      <Box mt={1.5} sx={{ height: 594, width: 1 }}>
        <OrdersStatusTable
          searchText={searchText}
          rows={domains}
          onUpdateRow={handleUpdateRow}
          onDeleteRow={handleDeleteRow}
        />
      </Box>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
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
        }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add New Domain
          </Typography>
          <TextField
            fullWidth
            label="Domain"
            name="domain"
            value={inputDomain}
            onChange={handleInputDomainChange}
            variant="outlined"
            margin="normal"
          />
          <Button variant="contained" onClick={addDomain} sx={{ mt: 2 }}>
            Add Domain
          </Button>
        </Box>
      </Modal>
    </Paper>
  );
};

export default OrdersStatus;
