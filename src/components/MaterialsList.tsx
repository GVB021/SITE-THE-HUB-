import React, { useState, useEffect } from 'react';
import { Download, Trash2, FileText, Video, Music, Image, File, Calendar } from 'lucide-react';
import { StorageService } from '../services/storageService';
import type { MaterialFile } from '../services/storageService';

interface MaterialsListProps {
  studioId?: string;
  studentId?: string;
  canDelete?: boolean;
  onDelete?: (materialId: string) => void;
}

export const MaterialsList: React.FC<MaterialsListProps> = ({
  studioId,
  studentId,
  canDelete = false,
  onDelete
}) => {
  const [materials, setMaterials] = useState<MaterialFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMaterials();
  }, [studioId, studentId]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: MaterialFile[] = [];
      
      if (studioId) {
        data = await StorageService.getStudioMaterials(studioId);
      } else if (studentId) {
        data = await StorageService.getStudentMaterials(studentId);
      }

      setMaterials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (material: MaterialFile) => {
    if (material.url) {
      const link = document.createElement('a');
      link.href = material.url;
      link.download = material.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = async (material: MaterialFile) => {
    if (!confirm(`Are you sure you want to delete "${material.name}"?`)) {
      return;
    }

    try {
      await StorageService.deleteFile(material.id, material.storage_path || '');
      setMaterials(materials.filter(m => m.id !== material.id));
      onDelete?.(material.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete material');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={loadMaterials}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <File className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <p>No materials available yet</p>
        <p className="text-sm mt-1">Materials will appear here once uploaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {materials.map((material) => {
        const Icon = getFileIcon(material.type);
        
        return (
          <div
            key={material.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Icon className="h-5 w-5 text-gray-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {material.name}
                  </h3>
                  
                  <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                    <span>{formatFileSize(material.size)}</span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(material.uploaded_at)}
                    </span>
                    {material.studio_id && (
                      <span>Studio: {material.studio_id}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleDownload(material)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                
                {canDelete && (
                  <button
                    onClick={() => handleDelete(material)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
