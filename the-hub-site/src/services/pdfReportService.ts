import jsPDF from 'jspdf';
import { getSupabaseClient } from '../lib/supabaseClient';

export interface FinancialData {
  totalRevenue: number;
  pendingRevenue: number;
  commissions: {
    professorName: string;
    commissionAmount: number;
    totalRevenue: number;
  }[];
  delinquentStudents: {
    studentName: string;
    amount: number;
    monthsOverdue: number;
  }[];
  month: string;
  year: number;
}

export interface AttendanceData {
  studioName: string;
  professorName: string;
  date: string;
  students: {
    name: string;
    present: boolean;
    notes?: string;
  }[];
}

export class PDFReportService {
  private static addHeader(doc: jsPDF, title: string, date: string) {
    // Add header with title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${date}`, 20, 30);
    
    // Add line separator
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
  }

  private static addFooter(doc: jsPDF, pageNumber: number) {
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${pageNumber} of ${pageCount}`, 105, 285, { align: 'center' });
  }

  /**
   * Generate financial report PDF
   */
  static async generateFinancialReport(data: FinancialData): Promise<Blob> {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Add header
    this.addHeader(doc, `Financial Report - ${data.month} ${data.year}`, date);

    let yPosition = 50;

    // Revenue Summary
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Revenue Summary', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Revenue: $${data.totalRevenue.toFixed(2)}`, 30, yPosition);
    yPosition += 10;
    doc.text(`Pending Revenue: $${data.pendingRevenue.toFixed(2)}`, 30, yPosition);
    yPosition += 10;
    doc.text(`Confirmed Revenue: $${(data.totalRevenue - data.pendingRevenue).toFixed(2)}`, 30, yPosition);
    yPosition += 20;

    // Professor Commissions
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Professor Commissions', 20, yPosition);
    yPosition += 15;

    // Table headers
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Professor', 30, yPosition);
    doc.text('Total Revenue', 100, yPosition);
    doc.text('Commission', 160, yPosition);
    yPosition += 10;

    // Commission data
    doc.setFont('helvetica', 'normal');
    data.commissions.forEach(commission => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 50;
      }
      
      doc.text(commission.professorName, 30, yPosition);
      doc.text(`$${commission.totalRevenue.toFixed(2)}`, 100, yPosition);
      doc.text(`$${commission.commissionAmount.toFixed(2)}`, 160, yPosition);
      yPosition += 8;
    });

    yPosition += 15;

    // Delinquent Students
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Delinquent Students', 20, yPosition);
    yPosition += 15;

    // Table headers
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Student', 30, yPosition);
    doc.text('Amount', 100, yPosition);
    doc.text('Months Overdue', 150, yPosition);
    yPosition += 10;

    // Delinquent data
    doc.setFont('helvetica', 'normal');
    data.delinquentStudents.forEach(student => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 50;
      }
      
      doc.text(student.studentName, 30, yPosition);
      doc.text(`$${student.amount.toFixed(2)}`, 100, yPosition);
      doc.text(student.monthsOverdue.toString(), 150, yPosition);
      yPosition += 8;
    });

    // Add footer to all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      this.addFooter(doc, i);
    }

    return new Blob([doc.output('blob')], { type: 'application/pdf' });
  }

  /**
   * Generate attendance list PDF
   */
  static async generateAttendanceList(data: AttendanceData): Promise<Blob> {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Add header
    this.addHeader(doc, `Attendance List - ${data.studioName}`, date);

    let yPosition = 50;

    // Class information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Studio: ${data.studioName}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Professor: ${data.professorName}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Date: ${data.date}`, 20, yPosition);
    yPosition += 20;

    // Attendance table
    doc.setFontSize(16);
    doc.text('Attendance Record', 20, yPosition);
    yPosition += 15;

    // Table headers
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('#', 30, yPosition);
    doc.text('Student Name', 50, yPosition);
    doc.text('Status', 130, yPosition);
    doc.text('Notes', 160, yPosition);
    yPosition += 10;

    // Draw line under headers
    doc.setLineWidth(0.3);
    doc.line(30, yPosition, 180, yPosition);
    yPosition += 5;

    // Student attendance data
    doc.setFont('helvetica', 'normal');
    data.students.forEach((student, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 50;
        // Repeat headers on new page
        doc.setFont('helvetica', 'bold');
        doc.text('#', 30, yPosition);
        doc.text('Student Name', 50, yPosition);
        doc.text('Status', 130, yPosition);
        doc.text('Notes', 160, yPosition);
        yPosition += 10;
        doc.line(30, yPosition, 180, yPosition);
        yPosition += 5;
        doc.setFont('helvetica', 'normal');
      }
      
      const studentNumber = (index + 1).toString();
      const status = student.present ? 'Present' : 'Absent';
      const notes = student.notes || '-';
      
      doc.text(studentNumber, 30, yPosition);
      doc.text(student.name, 50, yPosition);
      doc.text(status, 130, yPosition);
      doc.text(notes, 160, yPosition);
      yPosition += 8;
    });

    // Summary section
    yPosition += 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 20, yPosition);
    yPosition += 15;

    const presentCount = data.students.filter(s => s.present).length;
    const absentCount = data.students.length - presentCount;
    const attendanceRate = ((presentCount / data.students.length) * 100).toFixed(1);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Students: ${data.students.length}`, 30, yPosition);
    yPosition += 10;
    doc.text(`Present: ${presentCount}`, 30, yPosition);
    yPosition += 10;
    doc.text(`Absent: ${absentCount}`, 30, yPosition);
    yPosition += 10;
    doc.text(`Attendance Rate: ${attendanceRate}%`, 30, yPosition);

    // Add signature lines
    yPosition += 30;
    doc.setFontSize(10);
    doc.text('_________________________', 30, yPosition);
    doc.text('Professor Signature', 35, yPosition + 5);
    
    doc.text('_________________________', 120, yPosition);
    doc.text('Admin Signature', 125, yPosition + 5);

    // Add footer to all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      this.addFooter(doc, i);
    }

    return new Blob([doc.output('blob')], { type: 'application/pdf' });
  }

  /**
   * Fetch financial data for a specific month
   */
  static async fetchFinancialData(month: string, year: number): Promise<FinancialData> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    try {
      // Get payments for the month
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          amount,
          status,
          student_memberships!inner(
            student_id,
            studios!inner(professor_id)
          )
        `)
        .eq('mes_referencia', `${year}-${month.padStart(2, '0')}`);

      if (paymentsError) throw paymentsError;

      // Calculate totals
      const totalRevenue = payments?.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const pendingRevenue = payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Get professor commissions (assuming 20% commission)
      const professorCommissions = await this.calculateProfessorCommissions(payments || []);

      // Get delinquent students
      const delinquentStudents = await this.getDelinquentStudents();

      return {
        totalRevenue,
        pendingRevenue,
        commissions: professorCommissions,
        delinquentStudents,
        month,
        year
      };
    } catch (error) {
      console.error('Error fetching financial data:', error);
      throw error;
    }
  }

  private static async calculateProfessorCommissions(payments: any[]): Promise<FinancialData['commissions']> {
    // This is a simplified calculation - in reality you'd have commission rates per professor
    const commissionRate = 0.2; // 20% commission
    const commissions: { [key: string]: { revenue: number; name: string } } = {};

    payments.forEach(payment => {
      const professorId = payment.student_memberships?.studios?.professor_id;
      if (professorId && payment.status === 'confirmed') {
        if (!commissions[professorId]) {
          commissions[professorId] = { revenue: 0, name: `Professor ${professorId}` };
        }
        commissions[professorId].revenue += payment.amount || 0;
      }
    });

    return Object.entries(commissions).map(([, data]) => ({
      professorName: data.name,
      totalRevenue: data.revenue,
      commissionAmount: data.revenue * commissionRate
    }));
  }

  private static async getDelinquentStudents(): Promise<FinancialData['delinquentStudents']> {
    // This would query for students with overdue payments
    // For now, returning empty array as placeholder
    return [];
  }

  /**
   * Fetch attendance data for a specific session
   */
  static async fetchAttendanceData(sessionId: string): Promise<AttendanceData> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not available');

    try {
      // Get session details
      const { data: session, error: sessionError } = await supabase
        .from('recording_sessions')
        .select(`
          data_sessao,
          studios!inner(name, professor_id, professores!inner(nome))
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Get enrolled students for this studio
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('student_memberships')
        .select(`
          student_id,
          users!inner(first_name, last_name)
        `)
        .eq('studio_id', (session.studios as any).id)
        .eq('status', 'active');

      if (enrollmentsError) throw enrollmentsError;

      const students = enrollments?.map((enrollment: any) => {
        const user = Array.isArray(enrollment.users) ? enrollment.users[0] : enrollment.users;
        return {
          name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Student',
          present: false, // This would come from attendance records
          notes: ''
        };
      }) || [];

      const studios = session.studios as any;
      const studioData = Array.isArray(studios) ? studios[0] : studios;

      return {
        studioName: studioData?.name || 'Unknown Studio',
        professorName: (() => {
          const professors = studioData?.professores;
          return Array.isArray(professors) ? professors[0]?.nome || 'Unknown Professor' : professors?.nome || 'Unknown Professor';
        })(),
        date: new Date(session.data_sessao).toLocaleDateString(),
        students
      };
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      throw error;
    }
  }
}
