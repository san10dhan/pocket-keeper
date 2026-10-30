export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',

  ITEM_READ: 'item.read',
  ITEM_CREATE: 'item.create',
  ITEM_UPDATE: 'item.update',
  ITEM_DELETE: 'item.delete',

  DOCUMENT_READ: 'document.read',
  DOCUMENT_UPLOAD: 'document.upload',
  DOCUMENT_DELETE: 'document.delete',

  USER_MANAGE: 'user.manage',
  SETTINGS_MANAGE: 'settings.manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
