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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      contractor_rules: {
        Row: {
          contact_email: string
          contact_phone: string | null
          contractor_name: string
          created_at: string
          id: string
          node_key: string
          pm_id: string
        }
        Insert: {
          contact_email: string
          contact_phone?: string | null
          contractor_name: string
          created_at?: string
          id?: string
          node_key: string
          pm_id: string
        }
        Update: {
          contact_email?: string
          contact_phone?: string | null
          contractor_name?: string
          created_at?: string
          id?: string
          node_key?: string
          pm_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contractor_rules_pm_id_fkey"
            columns: ["pm_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          building_key: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          building_key?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          building_key?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      simple_tickets: {
        Row: {
          complex: string
          created_at: string
          date: string
          id: string
          problem_headline: string
          status: string
        }
        Insert: {
          complex: string
          created_at?: string
          date?: string
          id?: string
          problem_headline: string
          status: string
        }
        Update: {
          complex?: string
          created_at?: string
          date?: string
          id?: string
          problem_headline?: string
          status?: string
        }
        Relationships: []
      }
      ticket_attachments: {
        Row: {
          added_by: string | null
          created_at: string
          id: number
          kind: string
          storage_path: string
          ticket_id: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          id?: number
          kind?: string
          storage_path: string
          ticket_id: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          id?: number
          kind?: string
          storage_path?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_events: {
        Row: {
          actor_id: string | null
          actor_role: string
          created_at: string
          details: Json
          event_type: string
          id: number
          ticket_id: string
        }
        Insert: {
          actor_id?: string | null
          actor_role: string
          created_at?: string
          details?: Json
          event_type: string
          id?: number
          ticket_id: string
        }
        Update: {
          actor_id?: string | null
          actor_role?: string
          created_at?: string
          details?: Json
          event_type?: string
          id?: number
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_events_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_events_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          attachments: Json
          body: string
          channel: string
          created_at: string
          direction: string
          id: number
          sender_email: string | null
          sender_name: string | null
          sender_phone: string | null
          ticket_id: string
        }
        Insert: {
          attachments?: Json
          body: string
          channel: string
          created_at?: string
          direction: string
          id?: number
          sender_email?: string | null
          sender_name?: string | null
          sender_phone?: string | null
          ticket_id: string
        }
        Update: {
          attachments?: Json
          body?: string
          channel?: string
          created_at?: string
          direction?: string
          id?: number
          sender_email?: string | null
          sender_name?: string | null
          sender_phone?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_public"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          access_method: string | null
          access_permission: string | null
          alarm_details: string | null
          auto_send: boolean | null
          availability_slots: Json | null
          building_key: string | null
          city: string
          client_nonce: string | null
          consent_personal_data: boolean | null
          consent_terms: boolean | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          contractor_id: string | null
          cost_acknowledgment: boolean | null
          created_at: string
          decision_path: Json
          description: string | null
          duplicate_of: string | null
          extra_instructions: string | null
          has_alarm: boolean | null
          has_pets: boolean | null
          id: string
          intercom_details: string | null
          key_box_details: string | null
          leaf_type: string
          neighbor_details: string | null
          notes_for_contractor: string | null
          occupant_email: string | null
          occupant_name: string | null
          occupant_phone: string | null
          pet_details: string | null
          photo_paths: Json | null
          postal_code: string
          ref_code: string | null
          source_channel: string | null
          special_notes: string | null
          status: string
          street_address: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          access_method?: string | null
          access_permission?: string | null
          alarm_details?: string | null
          auto_send?: boolean | null
          availability_slots?: Json | null
          building_key?: string | null
          city: string
          client_nonce?: string | null
          consent_personal_data?: boolean | null
          consent_terms?: boolean | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          contractor_id?: string | null
          cost_acknowledgment?: boolean | null
          created_at?: string
          decision_path?: Json
          description?: string | null
          duplicate_of?: string | null
          extra_instructions?: string | null
          has_alarm?: boolean | null
          has_pets?: boolean | null
          id?: string
          intercom_details?: string | null
          key_box_details?: string | null
          leaf_type: string
          neighbor_details?: string | null
          notes_for_contractor?: string | null
          occupant_email?: string | null
          occupant_name?: string | null
          occupant_phone?: string | null
          pet_details?: string | null
          photo_paths?: Json | null
          postal_code: string
          ref_code?: string | null
          source_channel?: string | null
          special_notes?: string | null
          status?: string
          street_address: string
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          access_method?: string | null
          access_permission?: string | null
          alarm_details?: string | null
          auto_send?: boolean | null
          availability_slots?: Json | null
          building_key?: string | null
          city?: string
          client_nonce?: string | null
          consent_personal_data?: boolean | null
          consent_terms?: boolean | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          contractor_id?: string | null
          cost_acknowledgment?: boolean | null
          created_at?: string
          decision_path?: Json
          description?: string | null
          duplicate_of?: string | null
          extra_instructions?: string | null
          has_alarm?: boolean | null
          has_pets?: boolean | null
          id?: string
          intercom_details?: string | null
          key_box_details?: string | null
          leaf_type?: string
          neighbor_details?: string | null
          notes_for_contractor?: string | null
          occupant_email?: string | null
          occupant_name?: string | null
          occupant_phone?: string | null
          pet_details?: string | null
          photo_paths?: Json | null
          postal_code?: string
          ref_code?: string | null
          source_channel?: string | null
          special_notes?: string | null
          status?: string
          street_address?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tickets_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "tickets_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vendor_assignments: {
        Row: {
          created_at: string
          id: string
          outcome_reason: string | null
          outcome_started: boolean | null
          selected_slot: Json | null
          status: string
          ticket_id: string
          token_expires_at: string
          updated_at: string
          vendor_email: string | null
          vendor_name: string
          vendor_phone: string | null
          vendor_token: string
        }
        Insert: {
          created_at?: string
          id?: string
          outcome_reason?: string | null
          outcome_started?: boolean | null
          selected_slot?: Json | null
          status?: string
          ticket_id: string
          token_expires_at?: string
          updated_at?: string
          vendor_email?: string | null
          vendor_name: string
          vendor_phone?: string | null
          vendor_token?: string
        }
        Update: {
          created_at?: string
          id?: string
          outcome_reason?: string | null
          outcome_started?: boolean | null
          selected_slot?: Json | null
          status?: string
          ticket_id?: string
          token_expires_at?: string
          updated_at?: string
          vendor_email?: string | null
          vendor_name?: string
          vendor_phone?: string | null
          vendor_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_assignments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_assignments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_public"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_tokens: {
        Row: {
          created_at: string
          expires_at: string
          ticket_id: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          ticket_id: string
          token?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          ticket_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_tokens_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_tokens_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      tickets_public: {
        Row: {
          assigned_to: string | null
          id: string | null
          priority: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_tokens: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_vendor_token: {
        Args: { target_ticket_id: string }
        Returns: string
      }
      get_ticket_by_token: {
        Args: { token_uuid: string }
        Returns: {
          city: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          decision_path: Json
          description: string
          id: string
          leaf_type: string
          photo_paths: Json
          postal_code: string
          status: string
          street_address: string
        }[]
      }
      get_ticket_by_vendor_token: {
        Args: { p_token: string }
        Returns: {
          assignment_id: string
          assignment_status: string
          auto_send: boolean
          availability_slots: Json
          city: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          decision_path: Json
          notes_for_contractor: string
          photo_paths: Json
          postal_code: string
          ref_code: string
          selected_slot: Json
          status: string
          street_address: string
          ticket_id: string
          token_expires_at: string
          vendor_email: string
          vendor_name: string
          vendor_phone: string
        }[]
      }
      normalize_building_key: {
        Args: { city: string; postal: string; street: string }
        Returns: string
      }
      pm_create_vendor_assignment: {
        Args: {
          p_days_valid?: number
          p_ticket_id: string
          p_vendor_email: string
          p_vendor_name: string
          p_vendor_phone: string
        }
        Returns: string
      }
      pm_list_tickets: {
        Args: {
          p_building_key?: string
          p_date_from?: string
          p_date_to?: string
          p_limit?: number
          p_offset?: number
          p_q?: string
          p_status?: string[]
        }
        Returns: {
          building_key: string
          city: string
          created_at: string
          duplicate_of: string
          last_label: string
          postal_code: string
          ref_code: string
          status: string
          street_address: string
          ticket_id: string
        }[]
      }
      pm_mark_duplicate: {
        Args: { p_primary_ticket_id: string; p_ticket_id: string }
        Returns: boolean
      }
      pm_set_ticket_status: {
        Args: { p_status: string; p_ticket_id: string }
        Returns: boolean
      }
      validate_vendor_token: {
        Args: { token_uuid: string }
        Returns: {
          is_valid: boolean
          ticket_id: string
        }[]
      }
      vendor_accept: {
        Args: { p_token: string }
        Returns: boolean
      }
      vendor_decline_times: {
        Args: { p_reason: string; p_token: string }
        Returns: boolean
      }
      vendor_report_outcome: {
        Args: {
          p_completed: boolean
          p_reason: string
          p_started: boolean
          p_token: string
        }
        Returns: boolean
      }
      vendor_schedule: {
        Args: { p_slot: Json; p_token: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
