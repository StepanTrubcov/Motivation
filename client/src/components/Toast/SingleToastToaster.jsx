'use client';

import { useEffect } from 'react';
import toast, { Toaster, useToasterStore } from 'react-hot-toast';

const TOAST_LIMIT = 1;

/**
 * Toaster, который показывает только один тост — самый новый.
 * При появлении нового сообщения предыдущие скрываются.
 */
export default function SingleToastToaster(props) {
  const { toasts } = useToasterStore();

  useEffect(() => {
    const visible = toasts.filter((t) => t.visible);
    if (visible.length <= TOAST_LIMIT) return;
    // Оставляем только последний (самый новый), остальные скрываем
    visible.slice(0, -TOAST_LIMIT).forEach((t) => toast.dismiss(t.id));
  }, [toasts]);

  return <Toaster position="top-center" reverseOrder={false} {...props} />;
}
