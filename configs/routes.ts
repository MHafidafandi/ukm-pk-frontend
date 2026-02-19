export const ROUTES = {
  auth: {
    login: "/login",
    adminLogin: "/admin/login",
  },
  dashboard: {
    superadmin: "/superadmin/dashboard",
    administrator: "/administrator/dashboard",
    member: "/member/dashboard",
    donation: "/donation",
    inventory: "/inventory",
    documentation: "/documentation",
  },
  public: {
    home: "/",
  },
} as const;
