'use client';
import toast from 'react-hot-toast';
import { createNotificationController } from './notificationController.mjs';

export const notifications = createNotificationController(toast);
