import toast from 'react-hot-toast';

export const showSuccess = (message) => {
  toast.success(message);
};

export const showError = (message) => {
  toast.error(message);
};

export const showInfo = (message) => {
  toast(message, {
    icon: 'ℹ️',
  });
};

export const showApiError = (error) => {
  const message = error?.response?.data?.message || error?.message || 'Something went wrong';
  toast.error(message);
};
