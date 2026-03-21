export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export class PushNotificationService {
  private static swRegistration: ServiceWorkerRegistration | null = null;
  private static isSubscribed = false;
  private static subscription: PushSubscription | null = null;

  /**
   * Initialize the push notification service
   */
  static async initialize(): Promise<boolean> {
    try {
      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        console.warn('Service workers are not supported');
        return false;
      }

      // Check if push notifications are supported
      if (!('PushManager' in window)) {
        console.warn('Push notifications are not supported');
        return false;
      }

      // Register service worker
      const swRegistration = await navigator.serviceWorker.register('/sw.js');
      PushNotificationService.swRegistration = swRegistration;
      
      console.log('Service Worker registered:', swRegistration);

      // Check existing subscription
      const existingSubscription = await swRegistration.pushManager.getSubscription();
      PushNotificationService.isSubscribed = !!existingSubscription;
      PushNotificationService.subscription = existingSubscription;

      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  /**
   * Request permission and subscribe to push notifications
   */
  static async subscribe(): Promise<boolean> {
    try {
      if (!PushNotificationService.swRegistration) {
        throw new Error('Service worker not registered');
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      // Subscribe to push notifications
      const subscription = await PushNotificationService.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: PushNotificationService.urlBase64ToUint8Array(
          (import.meta.env.VITE_VAPID_PUBLIC_KEY) || ''
        )
      });

      PushNotificationService.subscription = subscription;
      PushNotificationService.isSubscribed = true;

      // Save subscription to backend
      await PushNotificationService.saveSubscriptionToBackend(subscription);

      console.log('User is subscribed to push notifications');
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  static async unsubscribe(): Promise<boolean> {
    try {
      if (!PushNotificationService.subscription) {
        return true;
      }

      const unsubscribed = await PushNotificationService.subscription.unsubscribe();
      PushNotificationService.isSubscribed = false;
      PushNotificationService.subscription = null;

      // Remove subscription from backend
      await PushNotificationService.removeSubscriptionFromBackend();

      console.log('User is unsubscribed from push notifications');
      return unsubscribed;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  /**
   * Check if user is subscribed
   */
  static isUserSubscribed(): boolean {
    return PushNotificationService.isSubscribed;
  }

  /**
   * Get current subscription
   */
  static getSubscription(): PushSubscription | null {
    return PushNotificationService.subscription;
  }

  /**
   * Send a local notification (for immediate feedback)
   */
  static async showLocalNotification(data: PushNotificationData): Promise<void> {
    try {
      if (!('serviceWorker' in navigator) || !PushNotificationService.swRegistration) {
        // Fallback to regular notification if service worker is not available
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(data.title, {
            body: data.body,
            icon: data.icon,
            badge: data.badge,
            tag: data.tag,
            data: data.data
          });
        }
        return;
      }

      // Send notification through service worker
      await PushNotificationService.swRegistration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/icon-192x192.png',
        badge: data.badge || '/badge-72x72.png',
        tag: data.tag,
        data: data.data,
        vibrate: [100, 50, 100],
        requireInteraction: true
      });
    } catch (error) {
      console.error('Error showing local notification:', error);
    }
  }

  /**
   * Save subscription to backend
   */
  private static async saveSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription,
          userAgent: navigator.userAgent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription to backend');
      }
    } catch (error) {
      console.error('Error saving subscription to backend:', error);
      throw error;
    }
  }

  /**
   * Remove subscription from backend
   */
  private static async removeSubscriptionFromBackend(): Promise<void> {
    try {
      if (!PushNotificationService.subscription) {
        return;
      }

      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: PushNotificationService.subscription
        })
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from backend');
      }
    } catch (error) {
      console.error('Error removing subscription from backend:', error);
      throw error;
    }
  }

  /**
   * Convert URL base64 to Uint8Array (for VAPID key)
   */
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Schedule a notification (using browser's notification API as fallback)
   */
  static scheduleNotification(
    title: string,
    body: string,
    scheduledTime: Date,
    options?: Partial<PushNotificationData>
  ): void {
    const now = new Date().getTime();
    const scheduledTimeMs = scheduledTime.getTime();
    const delay = scheduledTimeMs - now;

    if (delay <= 0) {
      // Show immediately if scheduled time is in the past
      PushNotificationService.showLocalNotification({
        title,
        body,
        ...options
      });
      return;
    }

    // Use setTimeout as a simple scheduler
    setTimeout(() => {
      PushNotificationService.showLocalNotification({
        title,
        body,
        ...options
      });
    }, delay);
  }
}

// Types for TypeScript
declare global {
  interface Window {
    Notification: any;
  }
}
