import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class SupabaseService {
    /**
     * Saves a raw report to the database.
     */
    static async saveReport(fileName: string, rawText: string, mechanicNotes: string) {
        try {
            const { data, error } = await supabase
                .from('reportes_logistica')
                .insert([
                    {
                        file_name: fileName,
                        raw_text: rawText,
                        mechanic_notes: mechanicNotes,
                        status: 'pendiente'
                    }
                ])
                .select();

            if (error) throw error;
            return data ? data[0] : null;
        } catch (error) {
            console.error('Error saving to Supabase:', error);
            throw new Error('Failed to save report to database');
        }
    }

    /**
     * Updates a report with analysis results.
     */
    static async updateAnalysis(id: string, analysis: any) {
        try {
            const { data, error } = await supabase
                .from('reportes_logistica')
                .update({ 
                    analysis_data: analysis,
                    status: 'analizado'
                })
                .eq('id', id)
                .select();

            if (error) throw error;
            return data ? data[0] : null;
        } catch (error) {
            console.error('Error updating analysis in Supabase:', error);
            throw new Error('Failed to update analysis in database');
        }
    }

    /**
     * Retrieves recent reports to avoid exceeding payload limits.
     */
    static async getRecentReports(limit: number = 20) {
        try {
            const { data, error } = await supabase
                .from('reportes_logistica')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching recent reports from Supabase:', error);
            return [];
        }
    }

    /**
     * Retrieves all reports.
     */
    static async getAllReports() {
        try {
            const { data, error } = await supabase
                .from('reportes_logistica')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching from Supabase:', error);
            return [];
        }
    }

    /**
     * Gets a single report by ID.
     */
    static async getReportById(id: string) {
        try {
            const { data, error } = await supabase
                .from('reportes_logistica')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching report by ID:', error);
            return null;
        }
    }
}
