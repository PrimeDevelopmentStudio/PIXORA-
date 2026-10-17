import { Template, TemplateCategory } from './editor';

export interface AdminAnnouncement {
  enabled: boolean;
  message: string;
  type: 'info' | 'success' | 'warning' | 'purple';
  actionText?: string;
  actionUrl?: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: number;
  action: string;
  details: string;
  level: 'info' | 'warn' | 'success';
}

export interface AdsConfig {
  enabled: boolean;
  adMobAppId: string;
  adMobUnitId: string;
  bannerPlacementHome: boolean;
  bannerPlacementExport: boolean;
  bannerPlacementTemplates: boolean;
  testMode: boolean;
  customBannerTitle?: string;
  customBannerDesc?: string;
  customBannerUrl?: string;
  customBannerCta?: string;
}

export type AdminRole = 'owner' | 'admin' | 'moderator';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  pin: string; // login access code
  role: AdminRole;
  addedAt: number;
  addedBy: string;
  isActive: boolean;
  lastLoginAt?: number;
}

export interface CurrentAdminSession {
  email: string;
  name: string;
  role: AdminRole;
  isOwner: boolean;
}

export interface AdminSettings {
  ownerEmail: string;
  masterPinHash: string; // stored master PIN for owner
  adminUsers: AdminUser[]; // authorized team members
  announcement: AdminAnnouncement;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  hiddenTemplateIds: string[];
  customTemplates: Template[];
  communityTemplates: Template[];
  adsConfig: AdsConfig;
  enableHighResExport: boolean;
  enableGuestUploads: boolean;
  auditLogs: AdminAuditLog[];
}
