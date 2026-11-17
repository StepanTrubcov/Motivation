'use client';

import { useEffect } from 'react';
import { Check, LoaderCircle, CircleAlert, X } from 'lucide-react';
import toast, { Toaster, resolveValue, useToasterStore } from 'react-hot-toast';
import styles from './Toast.module.css';
import { notifications } from '@/lib/notifications';

export default function SingleToastToaster(props) {
  const { toasts } = useToasterStore();
  // react-hot-toast stores the newest notification first.
  const newest = toasts.find((item) => item.visible);

  useEffect(() => {
    toasts.filter((item) => item.visible && item.id !== newest?.id)
      .forEach((item) => toast.dismiss(item.id));
  }, [toasts, newest?.id]);

  return (
    <Toaster
      {...props}
      position="top-center"
      containerStyle={{ top: 'max(96px, calc(max(env(safe-area-inset-top, 0px), var(--tg-safe-area-inset-top, 0px)) + var(--tg-content-safe-area-inset-top, 0px) + 12px))', left: 12, right: 12 }}
      toastOptions={{ success: { duration: 1400 }, error: { duration: 5000 }, ...props.toastOptions }}
    >
      {(item) => {
        if (item.visible && item.id !== newest?.id) return null;
        const error = item.type === 'error';
        const loading = item.type === 'loading';
        return (
          <div
            className={`${styles.toast} ${error ? styles.error : ''} ${item.visible ? styles.enter : styles.exit}`}
            role={error ? 'alert' : 'status'}
            aria-live={error ? 'assertive' : 'polite'}
          >
            <span className={styles.icon} aria-hidden="true">
              {loading ? <LoaderCircle className={styles.spinner} size={22} strokeWidth={2.4} />
                : error ? <CircleAlert size={22} /> : <Check size={20} strokeWidth={2.8} />}
            </span>
            <span className={error ? styles.message : styles.srOnly}>{resolveValue(item.message, item)}</span>
            {error && <button type="button" className={styles.close} aria-label="Закрыть" onClick={() => notifications.dismiss()}><X size={16} /></button>}
          </div>
        );
      }}
    </Toaster>
  );
}
