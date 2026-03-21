import { PushNotificationService } from './pushNotificationService';
import { getSupabaseClient } from '../lib/supabaseClient';

export type NotificationType = 
  | 'new_material'
  | 'schedule_change'
  | 'payment_reminder'
  | 'payment_overdue'
  | 'class_reminder'
  | 'announcement';

export interface NotificationData {
  type: NotificationType;
  recipientId: string;
  title: string;
  body: string;
  data?: any;
  scheduledFor?: Date;
}

export class NotificationManager {
  /**
   * Send a notification to a specific user
   */
  static async sendNotification(data: NotificationData): Promise<void> {
    try {
      // If scheduled for future, schedule it
      if (data.scheduledFor && data.scheduledFor > new Date()) {
        PushNotificationService.scheduleNotification(
          data.title,
          data.body,
          data.scheduledFor,
          {
            tag: `${data.type}_${data.recipientId}`,
            data: { ...data.data, type: data.type }
          }
        );
        return;
      }

      // Send immediately
      await PushNotificationService.showLocalNotification({
        title: data.title,
        body: data.body,
        tag: `${data.type}_${data.recipientId}`,
        data: { ...data.data, type: data.type },
        actions: this.getActionsForType(data.type)
      });

      // Log notification to database (optional)
      await this.logNotification(data);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Send notification to multiple users
   */
  static async sendToMultipleUsers(
    userIds: string[],
    baseNotification: Omit<NotificationData, 'recipientId'>
  ): Promise<void> {
    const promises = userIds.map(userId =>
      this.sendNotification({
        ...baseNotification,
        recipientId: userId
      })
    );

    await Promise.all(promises);
  }

  /**
   * Send notification to all students in a studio
   */
  static async sendToStudioStudents(
    studioId: string,
    baseNotification: Omit<NotificationData, 'recipientId'>
  ): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { data: enrollments, error } = await supabase
        .from('student_memberships')
        .select('student_id')
        .eq('studio_id', studioId)
        .eq('status', 'active');

      if (error) throw error;

      const studentIds = enrollments?.map(e => e.student_id) || [];
      await this.sendToMultipleUsers(studentIds, baseNotification);
    } catch (error) {
      console.error('Error sending notification to studio students:', error);
    }
  }

  /**
   * Specific notification helpers
   */
  static async notifyNewMaterial(
    studentIds: string[],
    materialName: string,
    studioName: string
  ): Promise<void> {
    await this.sendToMultipleUsers(studentIds, {
      type: 'new_material',
      title: 'New Material Available',
      body: `${materialName} has been uploaded to ${studioName}`,
      data: { materialName, studioName }
    });
  }

  static async notifyScheduleChange(
    studentIds: string[],
    studioName: string,
    newDate: string,
    oldDate?: string
  ): Promise<void> {
    const body = oldDate
      ? `Class for ${studioName} moved from ${oldDate} to ${newDate}`
      : `New class scheduled for ${studioName} on ${newDate}`;

    await this.sendToMultipleUsers(studentIds, {
      type: 'schedule_change',
      title: 'Schedule Update',
      body,
      data: { studioName, newDate, oldDate }
    });
  }

  static async notifyPaymentReminder(
    studentId: string,
      amount: number,
      dueDate: string
  ): Promise<void> {
    await this.sendNotification({
      type: 'payment_reminder',
      recipientId: studentId,
      title: 'Payment Reminder',
      body: `Your payment of $${amount.toFixed(2)} is due on ${dueDate}`,
      data: { amount, dueDate },
      scheduledFor: new Date(dueDate)
    });
  }

  static async notifyPaymentOverdue(
    studentId: string,
    amount: number,
    daysOverdue: number
  ): Promise<void> {
    await this.sendNotification({
      type: 'payment_overdue',
      recipientId: studentId,
      title: 'Payment Overdue',
      body: `Your payment of $${amount.toFixed(2)} is ${daysOverdue} days overdue`,
      data: { amount, daysOverdue }
    });
  }

  static async notifyClassReminder(
    studentId: string,
    studioName: string,
    classTime: string
  ): Promise<void> {
    // Schedule for 1 hour before class
    const classDateTime = new Date(classTime);
    const reminderTime = new Date(classDateTime.getTime() - 60 * 60 * 1000);

    await this.sendNotification({
      type: 'class_reminder',
      recipientId: studentId,
      title: 'Class Reminder',
      body: `Your ${studioName} class starts in 1 hour`,
      data: { studioName, classTime },
      scheduledFor: reminderTime
    });
  }

  static async notifyAnnouncement(
    userIds: string[],
    title: string,
    message: string
  ): Promise<void> {
    await this.sendToMultipleUsers(userIds, {
      type: 'announcement',
      title,
      body: message,
      data: { isAnnouncement: true }
    });
  }

  /**
   * Get appropriate actions for notification type
   */
  private static getActionsForType(type: NotificationType) {
    switch (type) {
      case 'new_material':
        return [
          {
            action: 'view_materials',
            title: 'View Materials'
          }
        ];
      case 'payment_reminder':
      case 'payment_overdue':
        return [
          {
            action: 'pay_now',
            title: 'Pay Now'
          }
        ];
      case 'schedule_change':
        return [
          {
            action: 'view_schedule',
            title: 'View Schedule'
          }
        ];
      default:
        return [
          {
            action: 'open_app',
            title: 'Open App'
          }
        ];
    }
  }

  /**
   * Log notification to database for tracking
   */
  private static async logNotification(data: NotificationData): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: data.recipientId,
          type: data.type,
          title: data.title,
          body: data.body,
          data: data.data,
          scheduled_for: data.scheduledFor?.toISOString(),
          sent_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  /**
   * Initialize notification system for a user
   */
  static async initializeForUser(userId: string): Promise<void> {
    try {
      const initialized = await PushNotificationService.initialize();
      if (initialized) {
        console.log(`Notifications initialized for user ${userId}`);
      }
    } catch (error) {
      console.error(`Error initializing notifications for user ${userId}:`, error);
    }
  }
}
