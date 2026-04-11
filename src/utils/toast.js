import toast from 'react-hot-toast';

// Toast styling constants
const toastStyles = {
  success: {
    style: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#fff',
      borderRadius: '12px',
      padding: '12px 20px',
      fontWeight: '500',
      fontSize: '14px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    icon: '✅',
  },
  error: {
    style: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#fff',
      borderRadius: '12px',
      padding: '12px 20px',
      fontWeight: '500',
      fontSize: '14px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    icon: '❌',
  },
  info: {
    style: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: '#fff',
      borderRadius: '12px',
      padding: '12px 20px',
      fontWeight: '500',
      fontSize: '14px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    icon: 'ℹ️',
  },
  loading: {
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      borderRadius: '12px',
      padding: '12px 20px',
      fontWeight: '500',
      fontSize: '14px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
  },
};

// Transformable loading toast
export const showLoadingToast = (loadingMessage, successMessage, errorMessage, asyncFunction) => {
  const toastId = toast.loading(loadingMessage, {
    position: 'top-center',
    style: toastStyles.loading.style,
    icon: null,
    duration: Infinity,
  });

  asyncFunction()
    .then((result) => {
      const successMsg = typeof successMessage === 'function' ? successMessage(result) : successMessage;
      toast.success(successMsg, {
        id: toastId,
        duration: 3000,
        position: 'top-center',
        style: toastStyles.success.style,
        icon: toastStyles.success.icon,
      });
      return result;
    })
    .catch((error) => {
      const errorMsg = typeof errorMessage === 'function' ? errorMessage(error) : errorMessage || 'Operation failed';
      toast.error(errorMsg, {
        id: toastId,
        duration: 4000,
        position: 'top-center',
        style: toastStyles.error.style,
        icon: toastStyles.error.icon,
      });
      throw error;
    });
};

// Simple toast notifications
export const showSuccess = (message, duration = 3000) => {
  toast.success(message, {
    duration,
    position: 'top-center',
    style: toastStyles.success.style,
    icon: toastStyles.success.icon,
  });
};

export const showError = (message, duration = 4000) => {
  toast.error(message, {
    duration,
    position: 'top-center',
    style: toastStyles.error.style,
    icon: toastStyles.error.icon,
  });
};

export const showInfo = (message, duration = 3000) => {
  toast(message, {
    duration,
    position: 'top-center',
    style: toastStyles.info.style,
    icon: toastStyles.info.icon,
  });
};

// Cart specific
export const showCartAdded = (productName) => {
  showSuccess(`${productName} added to cart`, 2000);
};

// Order specific
export const showOrderPlaced = (orderNumber) => {
  showSuccess(`Order ${orderNumber} placed successfully`, 5000);
};

export const showOrderCancelled = (orderNumber) => {
  showSuccess(`Order ${orderNumber} cancelled`, 4000);
};
