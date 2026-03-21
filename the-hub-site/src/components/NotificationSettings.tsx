import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { PushNotificationService } from '../services/pushNotificationService';

interface NotificationSettingsProps {
  userId: string;
  onNotificationPermissionChange?: (granted: boolean) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  onNotificationPermissionChange
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkNotificationSupport();
  }, []);

  const checkNotificationSupport = async () => {
    try {
      const initialized = await PushNotificationService.initialize();
      setIsSupported(initialized);
      
      if (initialized) {
        setPermission(Notification.permission);
        setIsSubscribed(PushNotificationService.isUserSubscribed());
      }
    } catch (err) {
      console.error('Error checking notification support:', err);
      setIsSupported(false);
    }
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const subscribed = await PushNotificationService.subscribe();
      
      if (subscribed) {
        setIsSubscribed(true);
        setPermission('granted');
        setSuccess('Notifications enabled successfully!');
        onNotificationPermissionChange?.(true);
        
        // Show a test notification
        setTimeout(() => {
          PushNotificationService.showLocalNotification({
            title: 'Notifications Enabled!',
            body: 'You will now receive updates about new materials, schedule changes, and payment reminders.',
            icon: '/icon-192x192.png',
            tag: 'welcome'
          });
        }, 1000);
      } else {
        setError('Failed to enable notifications. Please check your browser settings.');
      }
    } catch (err) {
      setError('Failed to enable notifications. Please try again.');
      console.error('Error enabling notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const unsubscribed = await PushNotificationService.unsubscribe();
      
      if (unsubscribed) {
        setIsSubscribed(false);
        setPermission('default');
        setSuccess('Notifications disabled.');
        onNotificationPermissionChange?.(false);
      } else {
        setError('Failed to disable notifications.');
      }
    } catch (err) {
      setError('Failed to disable notifications. Please try again.');
      console.error('Error disabling notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (isSubscribed) {
      await PushNotificationService.showLocalNotification({
        title: 'Test Notification',
        body: 'This is a test notification from The Hub Music School!',
        icon: '/icon-192x192.png',
        tag: 'test',
        actions: [
          {
            action: 'explore',
            title: 'Open App'
          }
        ]
      });
    }
  };

  if (!isSupported) {
    return (
      <Card className="space-y-4 border-white/15 bg-black/30">
        <div className="flex items-center gap-3 text-white/70">
          <BellOff className="h-5 w-5 text-red-500" />
          <p className="text-sm uppercase tracking-[0.3rem]">Notifications Not Supported</p>
        </div>
        <p className="text-sm text-white/60">
          Your browser doesn't support push notifications. Please try using a modern browser like Chrome, Firefox, or Safari.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4 border-white/15 bg-black/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-white/70">
          <Bell className="h-5 w-5 text-hub-gold" />
          <p className="text-sm uppercase tracking-[0.3rem]">Push Notifications</p>
        </div>
        <Badge variant={isSubscribed ? 'success' : 'neutral'}>
          {isSubscribed ? 'Enabled' : 'Disabled'}
        </Badge>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <p className="text-sm text-emerald-300">{success}</p>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-sm text-white/60">
          Enable notifications to receive updates about:
        </p>
        <ul className="space-y-1 text-xs text-white/50">
          <li>• New class materials uploaded</li>
          <li>• Schedule changes and reminders</li>
          <li>• Payment due dates</li>
          <li>• Important announcements</li>
        </ul>
      </div>

      <div className="flex gap-3">
        {!isSubscribed ? (
          <Button
            onClick={handleEnableNotifications}
            disabled={isLoading || permission === 'denied'}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enabling...
              </>
            ) : permission === 'denied' ? (
              <>
                <BellOff className="mr-2 h-4 w-4" />
                Blocked in Browser
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Enable Notifications
              </>
            )}
          </Button>
        ) : (
          <>
            <Button
              onClick={handleDisableNotifications}
              disabled={isLoading}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                <>
                  <BellOff className="mr-2 h-4 w-4" />
                  Disable
                </>
              )}
            </Button>
            
            <Button
              onClick={handleTestNotification}
              variant="ghost"
              className="border-white/10 text-white/70"
            >
              Test
            </Button>
          </>
        )}
      </div>

      {permission === 'denied' && (
        <div className="text-xs text-white/40 bg-white/5 p-3 rounded-lg">
          <p className="font-medium mb-1">Notifications blocked</p>
          <p>You've blocked notifications in your browser. To enable them:</p>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Click the lock icon in your address bar</li>
            <li>Find "Notifications" in the permissions</li>
            <li>Change setting to "Allow"</li>
            <li>Refresh this page</li>
          </ol>
        </div>
      )}
    </Card>
  );
};
