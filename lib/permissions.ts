export const PERMISSIONS = {
  // User Management
  VIEW_USERS: "view-users",
  CREATE_USERS: "create-users",
  EDIT_USERS: "edit-users",
  DELETE_USERS: "delete-users",
  ASSIGN_ROLES: "assign-roles",

  // Role Management
  VIEW_ROLES: "view-roles",
  CREATE_ROLES: "create-roles",
  EDIT_ROLES: "edit-roles",
  DELETE_ROLES: "delete-roles",
  MANAGE_PERMISSIONS: "manage-permissions",

  // Division Management
  VIEW_DIVISIONS: "view-divisions",
  CREATE_DIVISIONS: "create-divisions",
  EDIT_DIVISIONS: "edit-divisions",
  DELETE_DIVISIONS: "delete-divisions",

  // Activity Progress
  VIEW_ACTIVITIES: "view-activities",
  CREATE_ACTIVITIES: "create-activities",
  EDIT_ACTIVITIES: "edit-activities",
  DELETE_ACTIVITIES: "delete-activities",

  // Documents & Documentation
  VIEW_DOCUMENTS: "view-documents",
  CREATE_DOCUMENTS: "create-documents",
  EDIT_DOCUMENTS: "edit-documents",
  DELETE_DOCUMENTS: "delete-documents",

  VIEW_DOCUMENTATIONS: "view-documentations",
  CREATE_DOCUMENTATIONS: "create-documentations",
  EDIT_DOCUMENTATIONS: "edit-documentations",
  DELETE_DOCUMENTATIONS: "delete-documentations",
  ARCHIVE_DOCUMENTATIONS: "archive-documentations",

  // LPJ & Progress Reports
  VIEW_LPJ: "view-lpj",
  CREATE_LPJ: "create-lpj",
  EDIT_LPJ: "edit-lpj",
  DELETE_LPJ: "delete-lpj",

  VIEW_PROGRESS_REPORTS: "view-progress-reports",
  CREATE_PROGRESS_REPORTS: "create-progress-reports",
  EDIT_PROGRESS_REPORTS: "edit-progress-reports",
  DELETE_PROGRESS_REPORTS: "delete-progress-reports",

  // Donation
  VIEW_DONATIONS: "view-donations",
  CREATE_DONATIONS: "create-donations",
  EDIT_DONATIONS: "edit-donations",
  DELETE_DONATIONS: "delete-donations",
  VERIFY_DONATIONS: "verify-donations",

  // Inventory Assets & Loans
  VIEW_ASSETS: "view-assets",
  CREATE_ASSETS: "create-assets",
  EDIT_ASSETS: "edit-assets",
  DELETE_ASSETS: "delete-assets",

  VIEW_LOANS: "view-loans",
  CREATE_LOANS: "create-loans",
  EDIT_LOANS: "edit-loans",
  DELETE_LOANS: "delete-loans",
  MANAGE_LOANS: "manage-loans",

  // Recruitment
  VIEW_RECRUITMENTS: "view-recruitments",
  CREATE_RECRUITMENTS: "create-recruitments",
  EDIT_RECRUITMENTS: "edit-recruitments",
  DELETE_RECRUITMENTS: "delete-recruitments",
  MANAGE_REGISTRANTS: "manage-registrants",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
