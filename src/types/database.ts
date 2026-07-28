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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip: string | null
          target_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip?: string | null
          target_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip?: string | null
          target_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ca_meetings: {
        Row: {
          content: string
          created_at: string | null
          id: string
          meeting_date: string
          pdf_url: string | null
          published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          meeting_date: string
          pdf_url?: string | null
          published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          meeting_date?: string
          pdf_url?: string | null
          published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string | null
          description: string | null
          ends_at: string
          event_type_id: string
          id: string
          location: string | null
          series_id: string | null
          starts_at: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ends_at: string
          event_type_id: string
          id?: string
          location?: string | null
          series_id?: string | null
          starts_at: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ends_at?: string
          event_type_id?: string
          id?: string
          location?: string | null
          series_id?: string | null
          starts_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          category: string
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          message: string
          phone: string | null
          read: boolean | null
        }
        Insert: {
          category: string
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          message: string
          phone?: string | null
          read?: boolean | null
        }
        Update: {
          category?: string
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string
          phone?: string | null
          read?: boolean | null
        }
        Relationships: []
      }
      content_blocks: {
        Row: {
          block_key: string
          content: string
          created_at: string | null
          id: string
          page: string
          updated_at: string | null
        }
        Insert: {
          block_key: string
          content: string
          created_at?: string | null
          id?: string
          page: string
          updated_at?: string | null
        }
        Update: {
          block_key?: string
          content?: string
          created_at?: string | null
          id?: string
          page?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      event_types: {
        Row: {
          color: string
          description: string | null
          id: string
          is_special: boolean
          label: string
          order_index: number
        }
        Insert: {
          color?: string
          description?: string | null
          id?: string
          is_special?: boolean
          label: string
          order_index?: number
        }
        Update: {
          color?: string
          description?: string | null
          id?: string
          is_special?: boolean
          label?: string
          order_index?: number
        }
        Relationships: []
      }
      external_event_dates: {
        Row: {
          date: string
          end_date: string | null
          event_id: string
          id: string
        }
        Insert: {
          date: string
          end_date?: string | null
          event_id: string
          id?: string
        }
        Update: {
          date?: string
          end_date?: string | null
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_event_dates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "external_events"
            referencedColumns: ["id"]
          },
        ]
      }
      external_event_files: {
        Row: {
          created_at: string | null
          event_id: string
          file_url: string
          id: string
          label: string
          order_index: number | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          file_url: string
          id?: string
          label: string
          order_index?: number | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          file_url?: string
          id?: string
          label?: string
          order_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "external_event_files_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "external_events"
            referencedColumns: ["id"]
          },
        ]
      }
      external_events: {
        Row: {
          created_at: string | null
          description: string | null
          external_url: string | null
          id: string
          image_url: string | null
          location: string | null
          order_index: number | null
          published: boolean | null
          slug: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          order_index?: number | null
          published?: boolean | null
          slug?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          order_index?: number | null
          published?: boolean | null
          slug?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gallery_albums: {
        Row: {
          album_type: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          id: string
          order_index: number | null
          performance_id: string | null
          published: boolean | null
          title: string
          updated_at: string | null
          youtube_playlist_url: string | null
        }
        Insert: {
          album_type?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number | null
          performance_id?: string | null
          published?: boolean | null
          title: string
          updated_at?: string | null
          youtube_playlist_url?: string | null
        }
        Update: {
          album_type?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number | null
          performance_id?: string | null
          published?: boolean | null
          title?: string
          updated_at?: string | null
          youtube_playlist_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_albums_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_photos: {
        Row: {
          album_id: string | null
          caption: string | null
          created_at: string | null
          id: string
          order_index: number | null
          url: string
        }
        Insert: {
          album_id?: string | null
          caption?: string | null
          created_at?: string | null
          id?: string
          order_index?: number | null
          url: string
        }
        Update: {
          album_id?: string | null
          caption?: string | null
          created_at?: string | null
          id?: string
          order_index?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "gallery_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_videos: {
        Row: {
          album_id: string
          created_at: string | null
          id: string
          order_index: number | null
          thumbnail_url: string | null
          title: string | null
          youtube_id: string
        }
        Insert: {
          album_id: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          thumbnail_url?: string | null
          title?: string | null
          youtube_id: string
        }
        Update: {
          album_id?: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          thumbnail_url?: string | null
          title?: string | null
          youtube_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_videos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "gallery_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      home_blocks: {
        Row: {
          active: boolean | null
          content: string
          created_at: string | null
          id: string
          image_ratio: string | null
          image_url: string | null
          is_join_section: boolean | null
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          content: string
          created_at?: string | null
          id?: string
          image_ratio?: string | null
          image_url?: string | null
          is_join_section?: boolean | null
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          content?: string
          created_at?: string | null
          id?: string
          image_ratio?: string | null
          image_url?: string | null
          is_join_section?: boolean | null
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      member_links: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          label: string
          order_index: number | null
          url: string
          visibility: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          label: string
          order_index?: number | null
          url: string
          visibility?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          label?: string
          order_index?: number | null
          url?: string
          visibility?: string | null
        }
        Relationships: []
      }
      member_season: {
        Row: {
          created_at: string | null
          id: string
          member_id: string | null
          season_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          member_id?: string | null
          season_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          member_id?: string | null
          season_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_season_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_season_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          address: string | null
          admin_onboarded_at: string | null
          birthday: string | null
          bureau_role: string | null
          city: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          is_test_account: boolean
          last_login_at: string | null
          last_name: string | null
          lat: number | null
          lng: number | null
          onboarded_at: string | null
          phone: string | null
          photo_url: string | null
          role: string | null
          self_updated_at: string | null
          updated_at: string | null
          visibility_address: boolean | null
          visibility_birthday: string
          visibility_email: boolean | null
          visibility_phone: boolean | null
          voice_part_id: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          admin_onboarded_at?: string | null
          birthday?: string | null
          bureau_role?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_test_account?: boolean
          last_login_at?: string | null
          last_name?: string | null
          lat?: number | null
          lng?: number | null
          onboarded_at?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: string | null
          self_updated_at?: string | null
          updated_at?: string | null
          visibility_address?: boolean | null
          visibility_birthday?: string
          visibility_email?: boolean | null
          visibility_phone?: boolean | null
          voice_part_id?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          admin_onboarded_at?: string | null
          birthday?: string | null
          bureau_role?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_test_account?: boolean
          last_login_at?: string | null
          last_name?: string | null
          lat?: number | null
          lng?: number | null
          onboarded_at?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: string | null
          self_updated_at?: string | null
          updated_at?: string | null
          visibility_address?: boolean | null
          visibility_birthday?: string
          visibility_email?: boolean | null
          visibility_phone?: boolean | null
          voice_part_id?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_voice_part_id_fkey"
            columns: ["voice_part_id"]
            isOneToOne: false
            referencedRelation: "voice_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          content: string
          created_at: string | null
          id: string
          order_index: number
          pinned: boolean | null
          published: boolean | null
          scheduled_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          order_index?: number
          pinned?: boolean | null
          published?: boolean | null
          scheduled_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          order_index?: number
          pinned?: boolean | null
          published?: boolean | null
          scheduled_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      news_files: {
        Row: {
          created_at: string | null
          file_url: string
          id: string
          label: string
          news_id: string
          order_index: number | null
        }
        Insert: {
          created_at?: string | null
          file_url: string
          id?: string
          label: string
          news_id: string
          order_index?: number | null
        }
        Update: {
          created_at?: string | null
          file_url?: string
          id?: string
          label?: string
          news_id?: string
          order_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_files_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          logo_url: string
          name: string
          order_index: number | null
          size: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          logo_url: string
          name: string
          order_index?: number | null
          size?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          logo_url?: string
          name?: string
          order_index?: number | null
          size?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      performance_dates: {
        Row: {
          created_at: string | null
          date: string
          id: string
          performance_id: string | null
          venue: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          performance_id?: string | null
          venue?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          performance_id?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_dates_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
            referencedColumns: ["id"]
          },
        ]
      }
      performances: {
        Row: {
          created_at: string | null
          external_url: string | null
          id: string
          image_url: string | null
          notes: string | null
          season_id: string | null
          slug: string | null
          ticket_url: string | null
          title: string
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          created_at?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          season_id?: string | null
          slug?: string | null
          ticket_url?: string | null
          title: string
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          created_at?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          season_id?: string | null
          slug?: string | null
          ticket_url?: string | null
          title?: string
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performances_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_answers: {
        Row: {
          id: string
          number_value: number | null
          option_id: string | null
          question_id: string
          response_id: string
          text_value: string | null
        }
        Insert: {
          id?: string
          number_value?: number | null
          option_id?: string | null
          question_id: string
          response_id: string
          text_value?: string | null
        }
        Update: {
          id?: string
          number_value?: number | null
          option_id?: string | null
          question_id?: string
          response_id?: string
          text_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_answers_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "poll_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_answers_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "poll_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          id: string
          label: string
          order_index: number
          question_id: string
        }
        Insert: {
          id?: string
          label: string
          order_index?: number
          question_id: string
        }
        Update: {
          id?: string
          label?: string
          order_index?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "poll_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_questions: {
        Row: {
          id: string
          order_index: number
          poll_id: string
          required: boolean
          text: string
          type: string
        }
        Insert: {
          id?: string
          order_index?: number
          poll_id: string
          required?: boolean
          text: string
          type: string
        }
        Update: {
          id?: string
          order_index?: number
          poll_id?: string
          required?: boolean
          text?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_questions_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_responses: {
        Row: {
          id: string
          member_id: string
          poll_id: string
          submitted_at: string
        }
        Insert: {
          id?: string
          member_id: string
          poll_id: string
          submitted_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          poll_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_responses_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_responses_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          closes_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          title: string
        }
        Insert: {
          closes_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          title: string
        }
        Update: {
          closes_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      representation_files: {
        Row: {
          created_at: string | null
          file_url: string
          id: string
          label: string
          order_index: number | null
          performance_id: string
        }
        Insert: {
          created_at?: string | null
          file_url: string
          id?: string
          label: string
          order_index?: number | null
          performance_id: string
        }
        Update: {
          created_at?: string | null
          file_url?: string
          id?: string
          label?: string
          order_index?: number | null
          performance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "representation_files_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          label: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          label: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          label?: string
        }
        Relationships: []
      }
      song_file_voice_part: {
        Row: {
          id: string
          song_file_id: string
          voice_part_id: string
        }
        Insert: {
          id?: string
          song_file_id: string
          voice_part_id: string
        }
        Update: {
          id?: string
          song_file_id?: string
          voice_part_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_file_voice_part_song_file_id_fkey"
            columns: ["song_file_id"]
            isOneToOne: false
            referencedRelation: "song_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_file_voice_part_voice_part_id_fkey"
            columns: ["voice_part_id"]
            isOneToOne: false
            referencedRelation: "voice_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      song_files: {
        Row: {
          created_at: string | null
          file_url: string
          id: string
          label: string | null
          order_index: number | null
          song_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_url: string
          id?: string
          label?: string | null
          order_index?: number | null
          song_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_url?: string
          id?: string
          label?: string | null
          order_index?: number | null
          song_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "song_files_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      song_performance: {
        Row: {
          id: string
          performance_id: string | null
          song_id: string | null
        }
        Insert: {
          id?: string
          performance_id?: string | null
          song_id?: string | null
        }
        Update: {
          id?: string
          performance_id?: string | null
          song_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "song_performance_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_performance_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          composer: string | null
          created_at: string | null
          id: string
          label: string | null
          order_index: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          composer?: string | null
          created_at?: string | null
          id?: string
          label?: string | null
          order_index?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          composer?: string | null
          created_at?: string | null
          id?: string
          label?: string | null
          order_index?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      task_assignees: {
        Row: {
          member_id: string
          task_id: string
        }
        Insert: {
          member_id: string
          task_id: string
        }
        Update: {
          member_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignees_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignees_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_categories: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
          position: number
        }
        Insert: {
          color?: string
          created_at?: string | null
          id?: string
          name: string
          position?: number
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          position?: number
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          task_id: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          task_id?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_projects: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      task_template_items: {
        Row: {
          category_id: string | null
          description: string | null
          duration_unit: string | null
          duration_value: number | null
          id: string
          position: number
          priority: string
          status: string
          template_id: string
          title: string
        }
        Insert: {
          category_id?: string | null
          description?: string | null
          duration_unit?: string | null
          duration_value?: number | null
          id?: string
          position?: number
          priority?: string
          status?: string
          template_id: string
          title: string
        }
        Update: {
          category_id?: string | null
          description?: string | null
          duration_unit?: string | null
          duration_value?: number | null
          id?: string
          position?: number
          priority?: string
          status?: string
          template_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_template_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "task_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          category_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          duration_unit: string | null
          duration_value: number | null
          id: string
          position: number
          priority: string
          project_id: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          duration_unit?: string | null
          duration_value?: number | null
          id?: string
          position?: number
          priority?: string
          project_id: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          duration_unit?: string | null
          duration_value?: number | null
          id?: string
          position?: number
          priority?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "task_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "task_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_parts: {
        Row: {
          created_at: string | null
          group_name: string | null
          id: string
          is_admin_only: boolean
          is_voice_part: boolean | null
          name: string
          order_index: number | null
        }
        Insert: {
          created_at?: string | null
          group_name?: string | null
          id?: string
          is_admin_only?: boolean
          is_voice_part?: boolean | null
          name: string
          order_index?: number | null
        }
        Update: {
          created_at?: string | null
          group_name?: string | null
          id?: string
          is_admin_only?: boolean
          is_voice_part?: boolean | null
          name?: string
          order_index?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: { Args: never; Returns: string }
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
