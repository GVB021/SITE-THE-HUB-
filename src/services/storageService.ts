import { getSupabaseClient } from '../lib/supabaseClient';
import { NotificationManager } from './notificationManager';

export interface MaterialFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  storage_path?: string;
  uploaded_at: string;
  studio_id: string;
  professor_id: string;
}

export class StorageService {
  private static readonly BUCKET_NAME = 'class-materials';

  /**
   * Upload a file to Supabase Storage
   */
  static async uploadFile(
    file: File,
    studioId: string,
    professorId: string
  ): Promise<MaterialFile> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    try {
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${studioId}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      // Save file metadata to database
      const materialData = {
        name: file.name,
        type: file.type,
        size: file.size,
        url: urlData.publicUrl,
        storage_path: filePath,
        studio_id: studioId,
        professor_id: professorId
      };

      const { data: savedData, error: saveError } = await supabase
        .from('materials')
        .insert(materialData)
        .select()
        .single();

      if (saveError) {
        // Clean up uploaded file if database save fails
        await supabase.storage.from(this.BUCKET_NAME).remove([filePath]);
        throw new Error(`Failed to save file metadata: ${saveError.message}`);
      }

      // Send notifications to enrolled students
      try {
        const { data: enrollments } = await supabase
          .from('student_memberships')
          .select('student_id')
          .eq('studio_id', studioId)
          .eq('status', 'active');

        if (enrollments && enrollments.length > 0) {
          const { data: studio } = await supabase
            .from('studios')
            .select('name')
            .eq('id', studioId)
            .single();

          const studioName = studio?.name || 'Studio';
          const studentIds = enrollments.map((e: any) => e.student_id);

          await NotificationManager.notifyNewMaterial(
            studentIds,
            file.name,
            studioName
          );
        }
      } catch (notificationError: any) {
        console.warn('Failed to send notifications:', notificationError);
        // Don't fail the upload if notifications fail
      }

      return savedData;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Get materials for a specific studio
   */
  static async getStudioMaterials(studioId: string): Promise<MaterialFile[]> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('studio_id', studioId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch materials: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  }

  /**
   * Get materials for a student (based on their enrolled studios)
   */
  static async getStudentMaterials(studentId: string): Promise<MaterialFile[]> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    try {
      // Get student's enrolled studios
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('student_memberships')
        .select('studio_id')
        .eq('student_id', studentId)
        .eq('status', 'active');

      if (enrollmentError) {
        throw new Error(`Failed to fetch enrollments: ${enrollmentError.message}`);
      }

      if (!enrollments || enrollments.length === 0) {
        return [];
      }

      const studioIds = enrollments.map((e: any) => e.studio_id);

      // Get materials for all enrolled studios
      const { data, error } = await supabase
        .from('materials')
        .select(`
          *,
          studios!inner(name, professor_id)
        `)
        .in('studio_id', studioIds)
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch materials: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching student materials:', error);
      throw error;
    }
  }

  /**
   * Delete a file from storage and database
   */
  static async deleteFile(materialId: string, filePath: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (storageError) {
        console.warn('Failed to delete from storage:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId);

      if (dbError) {
        throw new Error(`Failed to delete from database: ${dbError.message}`);
      }
    } catch (error: any) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Create storage bucket if it doesn't exist
   */
  static async createBucketIfNotExists(): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b: any) => b.name === this.BUCKET_NAME);

      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(
          this.BUCKET_NAME,
          {
            public: true,
            allowedMimeTypes: [
              'image/jpeg',
              'image/png',
              'image/gif',
              'application/pdf',
              'video/mp4',
              'video/quicktime',
              'audio/mpeg',
              'audio/wav',
              'text/plain',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ],
            fileSizeLimit: 50 * 1024 * 1024 // 50MB
          }
        );

        if (error) {
          console.error('Error creating bucket:', error);
        } else {
          console.log('Bucket created successfully');
        }
      }
    } catch (error: any) {
      console.error('Error checking/creating bucket:', error);
    }
  }
}
