import {
  Users,
  Briefcase,
  FileText,
  HeartHandshake,
  Package,
  Home,
  Shield,
  UserPlus,
  CreditCard,
  BookOpen,
  Info,
} from "lucide-react";
import { PERMISSIONS } from "@/lib/permissions";

export const MENU_ITEMS = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    permission: PERMISSIONS.VIEW_ACTIVITIES, // Everyone with basic view access should see dashboard
  },
  {
    title: "Users Management",
    url: "/dashboard/users",
    icon: Users,
    permission: PERMISSIONS.VIEW_USERS,
  },
  {
    title: "Role Management",
    url: "/dashboard/roles",
    icon: Shield,
    permission: PERMISSIONS.VIEW_ROLES,
  },
  {
    title: "Division Management",
    url: "/dashboard/divisions",
    icon: Briefcase,
    permission: PERMISSIONS.VIEW_DIVISIONS,
  },
  {
    title: "Activity Management",
    url: "/dashboard/activities",
    icon: FileText,
    permission: PERMISSIONS.VIEW_ACTIVITIES,
  },
  {
    title: "Assets Management",
    url: "/dashboard/inventory",
    icon: Package,
    permission: PERMISSIONS.VIEW_ASSETS,
  },
  {
    title: "Documentation Management",
    url: "/dashboard/documentation",
    icon: BookOpen,
    permission: PERMISSIONS.VIEW_DOCUMENTATIONS,
  },
  {
    title: "Company Profile Content",
    url: "/dashboard/company-profile",
    icon: Info,
    // Leaving permission undefined so anyone with dashboard access can theoretically access it if they have UI, or adjust if you have a specific permission.
  },
  {
    title: "Donation Management",
    url: "/dashboard/donations",
    icon: HeartHandshake,
    permission: PERMISSIONS.VIEW_DONATIONS,
  },
  {
    title: "Recruitment Management",
    url: "/dashboard/recruitment",
    icon: UserPlus,
    permission: PERMISSIONS.VIEW_RECRUITMENTS,
  },
];
