export type UserRole = 'participant' | 'commission' | 'admin';

export type Profile = {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Team = {
  id: string;
  name: string;
  boat_name: string | null;
  captain_profile_id: string | null;
  created_at: string;
  updated_at: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  profile_id: string;
  member_role: 'captain' | 'angler' | 'guest';
  created_at: string;
};

export type Species = {
  id: string;
  name: string;
  category: string;
  multiplier: number;
  fishing_method: string;
  minimum_weight_kg: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Catch = {
  id: string;
  team_id: string;
  species_id: string;
  weight_kg: number;
  is_coin_fish: boolean;
  caught_at: string | null;
  returned_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ScoreSubmission = {
  id: string;
  team_id: string;
  base_score: number;
  coin_bonus: number;
  school_bonus: number;
  time_bonus: number;
  penalty: number;
  total_score: number;
  submitted_by: string | null;
  created_at: string;
};

export type RankingRow = {
  team_id: string;
  team_name: string;
  boat_name: string | null;
  total_score: number;
  base_score: number;
  coin_bonus: number;
  school_bonus: number;
  time_bonus: number;
  penalty: number;
  biggest_fish_weight: number | null;
  biggest_fish_species: string | null;
  valid_catches_count: number;
  returned_at: string | null;
  position: number;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, 'user_id'>;
        Update: Partial<Profile>;
        Relationships: [];
      };
      teams: {
        Row: Team;
        Insert: Partial<Team> & Pick<Team, 'name'>;
        Update: Partial<Team>;
        Relationships: [];
      };
      team_members: {
        Row: TeamMember;
        Insert: Partial<TeamMember> & Pick<TeamMember, 'team_id' | 'profile_id'>;
        Update: Partial<TeamMember>;
        Relationships: [];
      };
      species: {
        Row: Species;
        Insert: Partial<Species> & Pick<Species, 'name' | 'category' | 'multiplier' | 'fishing_method' | 'minimum_weight_kg'>;
        Update: Partial<Species>;
        Relationships: [];
      };
      catches: {
        Row: Catch;
        Insert: Partial<Catch> & Pick<Catch, 'team_id' | 'species_id' | 'weight_kg'>;
        Update: Partial<Catch>;
        Relationships: [];
      };
      score_submissions: {
        Row: ScoreSubmission;
        Insert: Partial<ScoreSubmission> & Pick<ScoreSubmission, 'team_id' | 'total_score'>;
        Update: Partial<ScoreSubmission>;
        Relationships: [];
      };
    };
    Views: {
      ranking_view: {
        Row: RankingRow;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
