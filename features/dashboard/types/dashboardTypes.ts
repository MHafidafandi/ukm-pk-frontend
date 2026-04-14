export interface DashboardUserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  alumni_users: number;
}

export interface DashboardActivityStats {
  total_activities: number;
  active_activities: number;
}

export interface DashboardInventoryStats {
  total_assets: number;
  available_assets: number;
  active_loans: number;
}

export interface DonationMonthlyBreakdown {
  month: string;
  year: number;
  amount: number;
  count: number;
}

export interface DashboardDonationStats {
  total_donations: number;
  total_amount: number;
  verified_amount: number;
  pending_amount: number;
  monthly_breakdown: DonationMonthlyBreakdown[] | null;
}

export interface DashboardRecruitmentStats {
  total_open_recruitments: number;
}

export interface RecentActivity {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal: string;
  lokasi: string;
  status: string;
  thumbnail: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecentRegistration {
  id: string;
  nama: string;
  username: string;
  email: string;
  nomor_telepon?: string;
  alamat?: string;
  angkatan: number;
  status: string;
  avatar_url?: string;
  division: {
    id: string;
    nama_divisi: string;
  };
  roles: {
    id: string;
    name: string;
  }[];
  created_at: string;
  updated_at: string;
}

export interface DashboardResponseData {
  users: DashboardUserStats;
  activities: DashboardActivityStats;
  inventory: DashboardInventoryStats;
  donations: DashboardDonationStats;
  recruitment: DashboardRecruitmentStats;
  recent_activities: RecentActivity[];
  recent_registrations: RecentRegistration[];
}

export interface DashboardResponse {
  data: DashboardResponseData;
}
