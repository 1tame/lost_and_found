// src/ToastService.js
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Default config (customize as needed)
const toastConfig = {
  position: 'top-right',
  autoClose: 3000,
  pauseOnHover: true,
  draggable: true,
  closeOnClick: true,
};

export const showSuccess = (message) => {
  toast.success(message, toastConfig);
};

export const showError = (message) => {
  toast.error(message, toastConfig);
};

export const showInfo = (message) => {
  toast.info(message, toastConfig);
};

export const showWarning = (message) => {
  toast.warning(message, toastConfig);
};
