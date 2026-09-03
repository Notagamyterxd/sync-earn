export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bans: {
        Row: {
          created_at: string
          id: string
          ip: string | null
          reason: string | null
          username_lower: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip?: string | null
          reason?: string | null
          username_lower?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string | null
          reason?: string | null
          username_lower?: string | null
        }
        Relationships: []
      }
      box_openings: {
        Row: {
          created_at: string
          id: string
          reward: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reward: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reward?: number
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
          username: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
          username: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      offerwall_postbacks: {
        Row: {
          amount: number
          created_at: string
          id: string
          provider: string
          raw: Json
          status: string
          transaction_id: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          provider: string
          raw?: Json
          status?: string
          transaction_id: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          provider?: string
          raw?: Json
          status?: string
          transaction_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          diamonds: number
          id: string
          milestone_progress: number
          milestone_window_start: string
          referral_code: string
          referral_count: number
          referred_by: string | null
          robux: number
          signup_ip: string | null
          status: Database["public"]["Enums"]["account_status"]
          total_earned: number
          username: string
          username_lower: string
        }
        Insert: {
          created_at?: string
          diamonds?: number
          id: string
          milestone_progress?: number
          milestone_window_start?: string
          referral_code: string
          referral_count?: number
          referred_by?: string | null
          robux?: number
          signup_ip?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          total_earned?: number
          username: string
          username_lower: string
        }
        Update: {
          created_at?: string
          diamonds?: number
          id?: string
          milestone_progress?: number
          milestone_window_start?: string
          referral_code?: string
          referral_count?: number
          referred_by?: string | null
          robux?: number
          signup_ip?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          total_earned?: number
          username?: string
          username_lower?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          active: boolean
          amount: number
          code: string
          created_at: string
          expires_at: string | null
          id: string
          max_uses: number
          reward_type: string
          uses: number
        }
        Insert: {
          active?: boolean
          amount: number
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          max_uses?: number
          reward_type?: string
          uses?: number
        }
        Update: {
          active?: boolean
          amount?: number
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          max_uses?: number
          reward_type?: string
          uses?: number
        }
        Relationships: []
      }
      promo_redemptions: {
        Row: {
          code_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          code_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          code_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_redemptions_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          status: string
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          subject: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          is_admin: boolean
          ticket_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_admin?: boolean
          ticket_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_admin?: boolean
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          kind: string
          meta: Json
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          kind: string
          meta?: Json
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          kind?: string
          meta?: Json
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          admin_note: string | null
          created_at: string
          id: string
          paid_views: number
          platform: string
          status: Database["public"]["Enums"]["video_status"]
          title: string
          url: string
          user_id: string
          views: number
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          id?: string
          paid_views?: number
          platform?: string
          status?: Database["public"]["Enums"]["video_status"]
          title: string
          url: string
          user_id: string
          views?: number
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          id?: string
          paid_views?: number
          platform?: string
          status?: Database["public"]["Enums"]["video_status"]
          title?: string
          url?: string
          user_id?: string
          views?: number
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          destination: string
          id: string
          method: string
          processed_at: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          destination: string
          id?: string
          method: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          destination?: string
          id?: string
          method?: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_balance: {
        Args: {
          _amount: number
          _currency: string
          _desc: string
          _kind: string
          _meta?: Json
          _user: string
        }
        Returns: undefined
      }
      credit_earning: {
        Args: {
          _amount: number
          _desc: string
          _kind: string
          _meta?: Json
          _user: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_status: "active" | "banned"
      app_role: "admin" | "user"
      video_status: "pending" | "approved" | "rejected"
      withdrawal_status: "pending" | "approved" | "denied"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: ["active", "banned"],
      app_role: ["admin", "user"],
      video_status: ["pending", "approved", "rejected"],
      withdrawal_status: ["pending", "approved", "denied"],
    },
  },
} as const
