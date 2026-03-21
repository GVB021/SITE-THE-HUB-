import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { PDFReportService } from '../services/pdfReportService';
import { getSupabaseClient } from '../lib/supabaseClient';

interface AttendancePDFGeneratorProps {
  studioId: string;
  professorId: string;
}

export const AttendancePDFGenerator: React.FC<AttendancePDFGeneratorProps> = ({
  studioId
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseClient();

  React.useEffect(() => {
    loadSessions();
  }, [studioId]);

  const loadSessions = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recording_sessions')
        .select('id, data_sessao, horario_inicio, horario_fim, studios!inner(name)')
        .eq('studio_id', studioId)
        .order('data_sessao', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!selectedSession) {
      alert('Please select a session');
      return;
    }

    setIsGenerating(true);
    try {
      const attendanceData = await PDFReportService.fetchAttendanceData(selectedSession);
      const pdfBlob = await PDFReportService.generateAttendanceList(attendanceData);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.download = `attendance-list-${date}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate attendance list');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card className="space-y-4 border-white/15 bg-black/30">
      <div className="flex items-center gap-3 text-white/70">
        <FileDown className="h-5 w-5 text-hub-gold" />
        <p className="text-sm uppercase tracking-[0.3rem]">Gerar Lista de Presença</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Select Session
          </label>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-white/50" />
            </div>
          ) : (
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white text-sm focus:border-hub-gold focus:outline-none"
            >
              <option value="">Choose a session...</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {formatDate(session.data_sessao)} - {session.horario_inicio} ({session.studios?.name})
                </option>
              ))}
            </select>
          )}
        </div>

        <Button
          onClick={handleGeneratePDF}
          disabled={!selectedSession || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Generate Attendance List
            </>
          )}
        </Button>
      </div>

      <div className="text-xs text-white/50">
        <p>• Generates a printable attendance list</p>
        <p>• Includes all enrolled students</p>
        <p>• Space for signatures and notes</p>
      </div>
    </Card>
  );
};
