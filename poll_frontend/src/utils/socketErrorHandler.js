// src/utils/socketErrorHandler.js
import { toast } from 'react-toastify';

export const handleSocketError = (error) => {
  if (!error) {
    toast.error('An unknown error occurred');
    return;
  }

  // Handle validation errors (status 400)
  if (error.status === 400) {
    if (Array.isArray(error.message)) {
      error.message.forEach((err) => {
        toast.error(err);
      });
    } else {
      toast.error(error.message || error.error || 'Validation failed');
    }
  } 
  // Handle other errors
  else {
    toast.error(error.message || error.error || 'Something went wrong');
  }
};
