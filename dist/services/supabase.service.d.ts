export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
export declare class SupabaseService {
    /**
     * Saves a raw report to the database.
     */
    static saveReport(fileName: string, rawText: string, mechanicNotes: string): Promise<any>;
    /**
     * Updates a report with analysis results.
     */
    static updateAnalysis(id: string, analysis: any): Promise<any>;
    /**
     * Retrieves recent reports to avoid exceeding payload limits.
     */
    static getRecentReports(limit?: number): Promise<any[]>;
    /**
     * Retrieves all reports.
     */
    static getAllReports(): Promise<any[]>;
    /**
     * Gets a single report by ID.
     */
    static getReportById(id: string): Promise<any>;
}
