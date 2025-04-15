import { Toaster } from 'sonner';

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      theme="light"
    />
  );
}; 