import {
  Users,
  Briefcase,
  FileText,
  HeartHandshake,
  Package,
  Home,
  Settings,
  Shield,
  UserPlus,
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
    title: "User Management",
    url: "#", // Group header
    icon: Users,
    permission: PERMISSIONS.VIEW_USERS,
    items: [
      {
        title: "Users",
        url: "/dashboard/users",
        permission: PERMISSIONS.VIEW_USERS,
      },
      {
        title: "Roles",
        url: "/dashboard/roles",
        permission: PERMISSIONS.VIEW_ROLES,
      },
      {
        title: "Divisions",
        url: "/dashboard/divisions",
        permission: PERMISSIONS.VIEW_DIVISIONS,
      },
    ],
  },
  {
    title: "Activities",
    url: "/dashboard/activities",
    icon: FileText,
    permission: PERMISSIONS.VIEW_ACTIVITIES,
  },
  {
    title: "Donations",
    url: "/dashboard/donations",
    icon: HeartHandshake,
    permission: PERMISSIONS.VIEW_DONATIONS,
  },
  {
    title: "Inventory",
    url: "/dashboard/inventory",
    icon: Package,
    permission: PERMISSIONS.VIEW_ASSETS,
  },
  {
    title: "Recruitment",
    url: "/dashboard/recruitment",
    icon: UserPlus,
    permission: PERMISSIONS.VIEW_RECRUITMENTS,
  },
];
