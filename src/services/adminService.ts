import { AdminSettings, AdminAnnouncement, AdminAuditLog, AdsConfig, AdminUser, CurrentAdminSession, AdminRole } from '../types/admin';
import { Template } from '../types/editor';

const ADMIN_STORAGE_KEY = 'pixora_admin_settings_v1';
const ADMIN_SESSION_KEY = 'pixora_admin_session_payload';

// Initial default configuration for the Owner
const DEFAULT_OWNER_EMAIL = 'arshbhai064@gmail.com';
const DEFAULT_PIN = '7860'; // Default owner PIN, can be updated inside Admin Panel

export const DEFAULT_ADS_CONFIG: AdsConfig = {
  enabled: true,
  adMobAppId: 'ca-app-pub-7620404585950475~7256441313',
  adMobUnitId: 'ca-app-pub-7620404585950475/5436927338',
  bannerPlacementHome: true,
  bannerPlacementExport: true,
  bannerPlacementTemplates: true,
  testMode: false,
};

export function getAdminSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) {
      const defaultSettings: AdminSettings = {
        ownerEmail: DEFAULT_OWNER_EMAIL,
        masterPinHash: DEFAULT_PIN,
        adminUsers: [],
        announcement: {
          enabled: false,
          message: 'Welcome to Pixora! Create anything with our pro graphic design tools.',
          type: 'purple',
          actionText: 'Explore Templates',
        },
        maintenanceMode: false,
        maintenanceMessage: 'Pixora is currently undergoing scheduled maintenance. Please check back shortly.',
        hiddenTemplateIds: [],
        customTemplates: [],
        communityTemplates: [],
        adsConfig: DEFAULT_ADS_CONFIG,
        enableHighResExport: true,
        enableGuestUploads: true,
        auditLogs: [
          {
            id: 'log_init',
            timestamp: Date.now(),
            action: 'System Initialized',
            details: `Owner account configured for ${DEFAULT_OWNER_EMAIL}`,
            level: 'info',
          },
        ],
      };
      saveAdminSettings(defaultSettings);
      return defaultSettings;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.adminUsers) {
      parsed.adminUsers = [];
    }
    if (!parsed.adsConfig) {
      parsed.adsConfig = DEFAULT_ADS_CONFIG;
    }
    if (!parsed.communityTemplates) {
      parsed.communityTemplates = [];
    }
    return parsed;
  } catch {
    return {
      ownerEmail: DEFAULT_OWNER_EMAIL,
      masterPinHash: DEFAULT_PIN,
      adminUsers: [],
      announcement: { enabled: false, message: '', type: 'purple' },
      maintenanceMode: false,
      maintenanceMessage: '',
      hiddenTemplateIds: [],
      customTemplates: [],
      communityTemplates: [],
      adsConfig: DEFAULT_ADS_CONFIG,
      enableHighResExport: true,
      enableGuestUploads: true,
      auditLogs: [],
    };
  }
}

export function saveAdminSettings(settings: AdminSettings): void {
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save admin settings', err);
  }
}

export function getCurrentAdminSession(): CurrentAdminSession | null {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAdminLoggedIn(): boolean {
  return getCurrentAdminSession() !== null;
}

export function loginAdmin(email: string, pin: string): { success: boolean; message: string; session?: CurrentAdminSession } {
  const settings = getAdminSettings();
  const cleanEmail = email.trim().toLowerCase();
  const allowedOwner = settings.ownerEmail.trim().toLowerCase();

  // 1. Check if login is by the Owner
  if (cleanEmail === allowedOwner || cleanEmail === DEFAULT_OWNER_EMAIL) {
    if (pin === settings.masterPinHash || pin === DEFAULT_PIN) {
      const session: CurrentAdminSession = {
        email: settings.ownerEmail,
        name: 'Master Owner',
        role: 'owner',
        isOwner: true,
      };
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      logAdminAction('Owner Logged In', `Owner successfully accessed Admin Panel`, 'success');
      return { success: true, message: 'Welcome Master Owner! Access Granted.', session };
    } else {
      logAdminAction('Failed Login Attempt', `Invalid PIN entered for owner ${email}`, 'warn');
      return { success: false, message: 'Incorrect Owner PIN. Please enter your valid passcode.' };
    }
  }

  // 2. Check if login is by an Authorized Sub-Admin / Team Member
  const user = (settings.adminUsers || []).find((u) => u.email.trim().toLowerCase() === cleanEmail);
  if (!user) {
    logAdminAction('Failed Login Attempt', `Unauthorized email attempted admin login: ${email}`, 'warn');
    return {
      success: false,
      message: 'Access Denied: This email is not registered as an authorized Admin or Moderator.',
    };
  }

  if (!user.isActive) {
    logAdminAction('Blocked Login Attempt', `Deactivated admin user tried to login: ${email}`, 'warn');
    return {
      success: false,
      message: 'Account Suspended: Your admin privileges have been temporarily deactivated by the owner.',
    };
  }

  if (user.pin !== pin.trim()) {
    logAdminAction('Failed Login Attempt', `Incorrect access code for admin member: ${email}`, 'warn');
    return {
      success: false,
      message: 'Incorrect Access Code / PIN for this admin account.',
    };
  }

  // Record last login
  user.lastLoginAt = Date.now();
  saveAdminSettings(settings);

  const session: CurrentAdminSession = {
    email: user.email,
    name: user.name,
    role: user.role,
    isOwner: false,
  };
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  logAdminAction('Admin User Logged In', `${user.name} (${user.email}) signed into Admin Portal as ${user.role.toUpperCase()}`, 'success');

  return {
    success: true,
    message: `Welcome, ${user.name}! Access Granted (${user.role.toUpperCase()}).`,
    session,
  };
}

export function logoutAdmin(): void {
  try {
    const session = getCurrentAdminSession();
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    if (session) {
      logAdminAction('Admin Logged Out', `${session.name} (${session.email}) ended admin session`, 'info');
    }
  } catch {
    // ignore
  }
}

// Multi-Admin Management functions (Used by Owner)
export function addAdminUser(
  email: string,
  name: string,
  pin: string,
  role: AdminRole = 'admin'
): { success: boolean; message: string } {
  const settings = getAdminSettings();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'Please provide a valid Gmail/Email address.' };
  }
  if (!pin || pin.length < 4) {
    return { success: false, message: 'Access Code / PIN must be at least 4 characters.' };
  }
  if (cleanEmail === settings.ownerEmail.toLowerCase() || cleanEmail === DEFAULT_OWNER_EMAIL) {
    return { success: false, message: 'This email is already the Master Owner account.' };
  }

  // Check if already in list
  const existing = (settings.adminUsers || []).find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, message: `An admin with email "${email}" is already registered.` };
  }

  const newUser: AdminUser = {
    id: `admin_user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim() || cleanEmail.split('@')[0],
    email: cleanEmail,
    pin: pin.trim(),
    role,
    addedAt: Date.now(),
    addedBy: settings.ownerEmail,
    isActive: true,
  };

  settings.adminUsers.unshift(newUser);
  saveAdminSettings(settings);
  logAdminAction('Admin Member Added', `Owner added "${newUser.name}" (${newUser.email}) as ${role.toUpperCase()}`, 'success');

  return { success: true, message: `Admin member ${newUser.name} added successfully!` };
}

export function removeAdminUser(userId: string): { success: boolean; message: string } {
  const settings = getAdminSettings();
  const user = (settings.adminUsers || []).find((u) => u.id === userId);
  if (!user) return { success: false, message: 'User not found.' };

  settings.adminUsers = settings.adminUsers.filter((u) => u.id !== userId);
  saveAdminSettings(settings);
  logAdminAction('Admin Member Removed', `Owner removed admin "${user.name}" (${user.email})`, 'warn');

  return { success: true, message: `Removed ${user.name} from admin team.` };
}

export function toggleAdminUserStatus(userId: string): { success: boolean; isActive: boolean } {
  const settings = getAdminSettings();
  const user = (settings.adminUsers || []).find((u) => u.id === userId);
  if (!user) return { success: false, isActive: false };

  user.isActive = !user.isActive;
  saveAdminSettings(settings);
  logAdminAction(
    'Admin Member Status Toggled',
    `"${user.name}" (${user.email}) is now ${user.isActive ? 'ACTIVE' : 'DEACTIVATED'}`,
    'info'
  );

  return { success: true, isActive: user.isActive };
}

export function updateAdminUserPin(userId: string, newPin: string): { success: boolean; message: string } {
  const settings = getAdminSettings();
  const user = (settings.adminUsers || []).find((u) => u.id === userId);
  if (!user) return { success: false, message: 'User not found.' };
  if (!newPin || newPin.length < 4) return { success: false, message: 'PIN must be at least 4 digits.' };

  user.pin = newPin.trim();
  saveAdminSettings(settings);
  logAdminAction('Admin Member Code Updated', `Owner updated login code for "${user.name}" (${user.email})`, 'info');

  return { success: true, message: `Login code updated for ${user.name}!` };
}

export function updateOwnerPin(currentPin: string, newPin: string): { success: boolean; message: string } {
  const settings = getAdminSettings();
  if (currentPin !== settings.masterPinHash && currentPin !== DEFAULT_PIN) {
    return { success: false, message: 'Current master PIN is incorrect.' };
  }
  if (!newPin || newPin.length < 4) {
    return { success: false, message: 'New PIN must be at least 4 digits.' };
  }

  settings.masterPinHash = newPin;
  saveAdminSettings(settings);
  logAdminAction('Owner PIN Changed', `Master security PIN was successfully changed`, 'success');
  return { success: true, message: 'Owner PIN updated successfully!' };
}

export function updateAdsConfig(config: AdsConfig): void {
  const settings = getAdminSettings();
  settings.adsConfig = config;
  saveAdminSettings(settings);
  logAdminAction(
    'Ads Config Updated',
    `AdMob Ads ${config.enabled ? 'ENABLED' : 'DISABLED'} (Unit: ${config.adMobUnitId})`,
    'info'
  );
}

export function updateAnnouncement(announcement: AdminAnnouncement): void {
  const settings = getAdminSettings();
  settings.announcement = announcement;
  saveAdminSettings(settings);
  logAdminAction(
    'Announcement Updated',
    announcement.enabled ? `Enabled: "${announcement.message.substring(0, 30)}..."` : 'Disabled announcement',
    'info'
  );
}

export function toggleTemplateVisibility(templateId: string): boolean {
  const settings = getAdminSettings();
  const isHidden = settings.hiddenTemplateIds.includes(templateId);

  if (isHidden) {
    settings.hiddenTemplateIds = settings.hiddenTemplateIds.filter((id) => id !== templateId);
  } else {
    settings.hiddenTemplateIds.push(templateId);
  }

  saveAdminSettings(settings);
  logAdminAction(
    'Template Visibility Toggled',
    `Template ${templateId} is now ${isHidden ? 'Visible' : 'Hidden'} to regular users`,
    'info'
  );
  return !isHidden;
}

export function addCustomSystemTemplate(template: Template): void {
  const settings = getAdminSettings();
  settings.customTemplates.unshift(template);
  saveAdminSettings(settings);
  logAdminAction('Official Template Added', `Added official template "${template.title}" (${template.width}x${template.height})`, 'success');
}

export function deleteCustomSystemTemplate(templateId: string): void {
  const settings = getAdminSettings();
  settings.customTemplates = settings.customTemplates.filter((t) => t.id !== templateId);
  saveAdminSettings(settings);
  logAdminAction('Official Template Deleted', `Deleted template ${templateId}`, 'info');
}

export function getCommunityTemplates(): Template[] {
  const settings = getAdminSettings();
  return settings.communityTemplates || [];
}

export function addCommunityTemplate(template: Template): void {
  const settings = getAdminSettings();
  if (!settings.communityTemplates) settings.communityTemplates = [];
  settings.communityTemplates.unshift({
    ...template,
    isCommunity: true,
    createdAt: Date.now(),
  });
  saveAdminSettings(settings);
  logAdminAction('Community Template Submitted', `Player "${template.authorName || 'Guest'}" published "${template.title}"`, 'success');
}

export function deleteCommunityTemplate(templateId: string): void {
  const settings = getAdminSettings();
  settings.communityTemplates = (settings.communityTemplates || []).filter((t) => t.id !== templateId);
  saveAdminSettings(settings);
  logAdminAction('Community Template Deleted', `Removed community template ${templateId}`, 'info');
}

export function promoteCommunityTemplate(templateId: string): void {
  const settings = getAdminSettings();
  const found = (settings.communityTemplates || []).find((t) => t.id === templateId);
  if (!found) return;

  // Move to custom official templates
  settings.customTemplates.unshift({
    ...found,
    isCommunity: false,
  });
  settings.communityTemplates = settings.communityTemplates.filter((t) => t.id !== templateId);
  saveAdminSettings(settings);
  logAdminAction('Template Promoted', `Promoted "${found.title}" to Official System Templates!`, 'success');
}

export function toggleMaintenanceMode(enabled: boolean, message?: string): void {
  const settings = getAdminSettings();
  settings.maintenanceMode = enabled;
  if (message) settings.maintenanceMessage = message;
  saveAdminSettings(settings);
  logAdminAction('Maintenance Mode Toggled', `Maintenance mode is now ${enabled ? 'ENABLED' : 'DISABLED'}`, 'warn');
}

export function logAdminAction(action: string, details: string, level: 'info' | 'warn' | 'success' = 'info'): void {
  try {
    const settings = getAdminSettings();
    const newLog: AdminAuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      action,
      details,
      level,
    };
    settings.auditLogs.unshift(newLog);
    if (settings.auditLogs.length > 50) {
      settings.auditLogs = settings.auditLogs.slice(0, 50);
    }
    saveAdminSettings(settings);
  } catch (err) {
    console.error('Failed to log admin action', err);
  }
}
