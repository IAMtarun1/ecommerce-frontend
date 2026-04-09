import toast from 'react-hot-toast';

// Clean toast styles without icons
const toastStyles = {
  success: {
    style: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#fff',
      borderRadius: '12px',
      padding: '12px 20px',
      fontWeight: '500',
      fontSize: '14px',
      letterSpacing: '0.3px',
      boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.25)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
  },
  error: {
    style: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#fff',
      borderRadius: '12px',
      padding: '12px 20px',
      fontWeight: '500',
      fontSize: '14px',
      letterSpacing: '0.3px',
      boxShadow: '0 8px 20px -4px rgba(239, 68, 68, 0.25)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
  },
  info: {
    style: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: '#fff',
      borderRadius: '12px',
      padding: '12px 20px',
      fontWeight: '500',
      fontSize: '14px',
      letterSpacing: '0.3px',
      boxShadow: '0 8px 20px -4px rgba(59, 130, 246, 0.25)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
  },
  loading: {
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      borderRadius: '12px',
      padding: '12px 20px',
      fontWeight: '500',
      fontSize: '14px',
      letterSpacing: '0.3px',
      boxShadow: '0 8px 20px -4px rgba(102, 126, 234, 0.25)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
  },
};

// Function to show loading toast that transforms
export const showLoadingToast = (loadingMessage, successMessageOrFn, errorMessageOrFn, asyncFunction) => {
  // Show loading toast
  const toastId = toast.loading(loadingMessage, {
    position: 'top-center',
    style: toastStyles.loading.style,
    icon: null,
    duration: Infinity,
  });

  // Execute async function
  asyncFunction()
    .then((result) => {
      // Get success message (either string or function that returns string)
      const successMessage = typeof successMessageOrFn === 'function' 
        ? successMessageOrFn(result) 
        : successMessageOrFn;
      
      // Transform to success
      toast.success(successMessage, {
        id: toastId,
        duration: 3000,
        position: 'top-center',
        style: toastStyles.success.style,
        icon: null,
      });
      return result;
    })
    .catch((error) => {
      // Get error message (either string or function that returns string)
      const errorMessage = typeof errorMessageOrFn === 'function' 
        ? errorMessageOrFn(error) 
        : errorMessageOrFn || 'Operation failed';
      
      // Transform to error
      toast.error(errorMessage, {
        id: toastId,
        duration: 4000,
        position: 'top-center',
        style: toastStyles.error.style,
        icon: null,
      });
      throw error;
    });
};

// Simple toasts (for non-loading scenarios)
export const showSuccess = (message, duration = 3000) => {
  toast.success(message, {
    duration: duration,
    position: 'top-center',
    style: toastStyles.success.style,
    icon: null,
  });
};

export const showError = (message, duration = 4000) => {
  toast.error(message, {
    duration: duration,
    position: 'top-center',
    style: toastStyles.error.style,
    icon: null,
  });
};

export const showInfo = (message, duration = 3000) => {
  toast(message, {
    duration: duration,
    position: 'top-center',
    style: toastStyles.info.style,
    icon: null,
  });
};

// Cart specific toast
export const showCartAdded = (productName) => {
  showSuccess(`${productName} added to cart`, 2000);
};

// Order specific toasts
export const showOrderPlaced = (orderNumber) => {
  showSuccess(`Order ${orderNumber} placed successfully`, 4000);
};

export const showOrderCancelled = (orderNumber) => {
  showSuccess(`Order ${orderNumber} cancelled`, 4000);
};
