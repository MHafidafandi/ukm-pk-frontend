export interface MemberData {
  id: string;
  name: string;
  email: string;
  angkatan: string;
  division: string;
  role: string;
  status: "active" | "inactive" | "alumni";
  phone: string;
}

export interface ActivityData {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "planning" | "ongoing" | "completed" | "cancelled";
  location: string;
  participants: number;
}

export interface DonationData {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  status: "pending" | "verified" | "rejected";
  activityId?: string;
  method: string;
}

export const mockMembers: MemberData[] = [
  {
    id: "1",
    name: "Ahmad Fauzi",
    email: "ahmad@mail.com",
    angkatan: "2022",
    division: "Ketua Umum",
    role: "super_admin",
    status: "active",
    phone: "08123456789",
  },
  {
    id: "2",
    name: "Siti Nurhaliza",
    email: "siti@mail.com",
    angkatan: "2023",
    division: "Divisi Sosial",
    role: "member",
    status: "active",
    phone: "08234567890",
  },
  {
    id: "3",
    name: "Budi Santoso",
    email: "budi@mail.com",
    angkatan: "2023",
    division: "Divisi Pendidikan",
    role: "member",
    status: "active",
    phone: "08345678901",
  },
  {
    id: "4",
    name: "Dewi Lestari",
    email: "dewi@mail.com",
    angkatan: "2022",
    division: "Divisi Humas",
    role: "administrator",
    status: "active",
    phone: "08456789012",
  },
  {
    id: "5",
    name: "Rizky Pratama",
    email: "rizky@mail.com",
    angkatan: "2021",
    division: "Divisi Dana",
    role: "member",
    status: "alumni",
    phone: "08567890123",
  },
  {
    id: "6",
    name: "Nur Aisyah",
    email: "nur@mail.com",
    angkatan: "2023",
    division: "Divisi Sosial",
    role: "member",
    status: "active",
    phone: "08678901234",
  },
  {
    id: "7",
    name: "Fajar Ramadhan",
    email: "fajar@mail.com",
    angkatan: "2022",
    division: "Divisi Pendidikan",
    role: "member",
    status: "inactive",
    phone: "08789012345",
  },
  {
    id: "8",
    name: "Maya Sari",
    email: "maya@mail.com",
    angkatan: "2024",
    division: "Divisi Humas",
    role: "member",
    status: "active",
    phone: "08890123456",
  },
];

export const mockActivities: ActivityData[] = [
  {
    id: "1",
    title: "Bakti Sosial Desa Sukamaju",
    description: "Kegiatan bakti sosial berupa pembagian sembako",
    date: "2024-03-15",
    status: "completed",
    location: "Desa Sukamaju",
    participants: 25,
  },
  {
    id: "2",
    title: "Penggalangan Dana Bencana Alam",
    description: "Penggalangan dana untuk korban banjir",
    date: "2024-04-01",
    status: "ongoing",
    location: "Online",
    participants: 50,
  },
  {
    id: "3",
    title: "Workshop Kewirausahaan",
    description: "Pelatihan kewirausahaan untuk masyarakat",
    date: "2024-05-10",
    status: "planning",
    location: "Aula Kampus",
    participants: 0,
  },
  {
    id: "4",
    title: "Donor Darah",
    description: "Kegiatan donor darah bersama PMI",
    date: "2024-02-20",
    status: "completed",
    location: "Kampus Utama",
    participants: 40,
  },
];

export const mockDonations: DonationData[] = [
  {
    id: "1",
    donorName: "PT Maju Bersama",
    amount: 5000000,
    date: "2024-03-01",
    status: "verified",
    activityId: "1",
    method: "Transfer Bank",
  },
  {
    id: "2",
    donorName: "Yayasan Peduli",
    amount: 10000000,
    date: "2024-03-10",
    status: "verified",
    activityId: "2",
    method: "Transfer Bank",
  },
  {
    id: "3",
    donorName: "Anonim",
    amount: 500000,
    date: "2024-03-15",
    status: "pending",
    method: "E-Wallet",
  },
  {
    id: "4",
    donorName: "CV Sejahtera",
    amount: 2000000,
    date: "2024-04-01",
    status: "pending",
    activityId: "2",
    method: "Transfer Bank",
  },
  {
    id: "5",
    donorName: "Ibu Ratna",
    amount: 1000000,
    date: "2024-04-05",
    status: "rejected",
    method: "Cash",
  },
];

export const dashboardStats = {
  totalMembers: 45,
  activeMembers: 38,
  totalActivities: 12,
  activeActivities: 3,
  totalDonations: 28500000,
  pendingDonations: 5,
  totalAssets: 32,
};
