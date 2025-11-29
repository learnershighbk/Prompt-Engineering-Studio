export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          student_id: string;
          user_type: "student" | "staff";
          language: "ko" | "en";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          user_type?: "student" | "staff";
          language?: "ko" | "en";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          user_type?: "student" | "staff";
          language?: "ko" | "en";
          created_at?: string;
          updated_at?: string;
        };
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_slug: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_slug: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_slug?: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type Progress = Database["public"]["Tables"]["progress"]["Row"];
export type ProgressInsert = Database["public"]["Tables"]["progress"]["Insert"];
export type ProgressUpdate = Database["public"]["Tables"]["progress"]["Update"];

export type SupabaseUserMetadata = Record<string, unknown>;

