import React, { useState, useEffect } from 'react';
import { 
  AdminSettings, 
  AdminAnnouncement, 
  AdminAuditLog, 
  AdsConfig, 
  AdminUser, 
  AdminRole, 
  CurrentAdminSession 
} from '../../types/admin';
import { 
  getAdminSettings, 
  saveAdminSettings, 
  logoutAdmin, 
  updateOwnerPin, 
  updateAnnouncement, 
  updateAdsConfig, 
  toggleTemplateVisibility, 
  toggleMaintenanceMode, 
  addCustomSystemTemplate, 
  deleteCustomSystemTemplate, 
  deleteCommunityTemplate, 
  promoteCommunityTemplate, 
  logAdminAction, 
  addAdminUser, 
  removeAdminUser, 
  toggleAdminUserStatus, 
  updateAdminUserPin, 
  getCurrentAdminSession 
} from '../../services/adminService';
import { TEMPLATES } from '../../constants/templates';
import { Template, Project, TemplateCategory } from '../../types/editor';
import { getProjects } from '../../services/storage';
import { AdMobBanner } from '../ads/AdMobBanner';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  LayoutTemplate, 
  Megaphone, 
  Sliders, 
  Key, 
  LogOut, 
  X, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Download, 
  Plus, 
  Trash2, 
  Database, 
  Activity, 
  Layers, 
  Tv, 
  Users, 
  Award, 
  UserPlus, 
  Mail, 
  UserCheck, 
  Lock, 
  Edit2 
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshAppState: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onRefreshAppState,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'templates' | 'ads' | 'announcement' | 'system' | 'security' | 'audit'>('overview');
  const [settings, setSettings] = useState<AdminSettings>(getAdminSettings());
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentSession, setCurrentSession] = useState<CurrentAdminSession | null>(getCurrentAdminSession());

  // Ads state
  const [adsForm, setAdsForm] = useState<AdsConfig>(settings.adsConfig);

  // Announcement edit state
  const [announcementMsg, setAnnouncementMsg] = useState(settings.announcement.message);
  const [announcementType, setAnnouncementType] = useState<AdminAnnouncement['type']>(settings.announcement.type);
  const [announcementEnabled, setAnnouncementEnabled] = useState(settings.announcement.enabled);
  const [announcementAction, setAnnouncementAction] = useState(settings.announcement.actionText || '');

  // Master PIN change state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinFeedback, setPinFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Admin User state
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPin, setNewAdminPin] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('admin');
  const [adminUserFeedback, setAdminUserFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingUserPinId, setEditingUserPinId] = useState<string | null>(null);
  const [editedUserPin, setEditedUserPin] = useState('');

  // Maintenance state
  const [maintenanceMsg, setMaintenanceMsg] = useState(settings.maintenanceMessage);

  // Create Template Modal state
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [newTplTitle, setNewTplTitle] = useState('');
  const [newTplCategory, setNewTplCategory] = useState<TemplateCategory>('social');
  const [newTplWidth, setNewTplWidth] = useState(1080);
  const [newTplHeight, setNewTplHeight] = useState(1080);
  const [newTplBg, setNewTplBg] = useState('#0f172a');
  const [newTplHeadText, setNewTplHeadText] = useState('PROMOTION TITLE');
  const [selectedProjectToConvert, setSelectedProjectToConvert] = useState<string>('');

  // Status notification
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const s = getAdminSettings();
      setSettings(s);
      setAdsForm(s.adsConfig);
      setAnnouncementMsg(s.announcement.message);
      setAnnouncementType(s.announcement.type);
      setAnnouncementEnabled(s.announcement.enabled);
      setAnnouncementAction(s.announcement.actionText || '');
      setMaintenanceMsg(s.maintenanceMessage);
      setCurrentSession(getCurrentAdminSession());
      const prjs = getProjects();
      setProjects(prjs);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminUserFeedback(null);
    const res = addAdminUser(newAdminEmail, newAdminName, newAdminPin, newAdminRole);
    if (res.success) {
      setAdminUserFeedback({ type: 'success', text: res.message });
      setNewAdminEmail('');
      setNewAdminName('');
      setNewAdminPin('');
      setSettings(getAdminSettings());
      showNotice(res.message);
    } else {
      setAdminUserFeedback({ type: 'error', text: res.message });
    }
  };

  const handleRemoveAdmin = (userId: string) => {
    const res = removeAdminUser(userId);
    setSettings(getAdminSettings());
    showNotice(res.message);
  };

  const handleToggleAdminStatus = (userId: string) => {
    const res = toggleAdminUserStatus(userId);
    setSettings(getAdminSettings());
    showNotice(`Admin account is now ${res.isActive ? 'ACTIVE' : 'DEACTIVATED'}`);
  };

  const handleUpdateAdminPin = (userId: string) => {
    if (!editedUserPin || editedUserPin.length < 4) {
      alert('PIN must be at least 4 digits');
      return;
    }
    const res = updateAdminUserPin(userId, editedUserPin);
    if (res.success) {
      setEditingUserPinId(null);
      setEditedUserPin('');
      setSettings(getAdminSettings());
      showNotice(res.message);
    } else {
      alert(res.message);
    }
  };

  const handleSaveAds = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdsConfig(adsForm);
    setSettings(getAdminSettings());
    onRefreshAppState();
    showNotice('AdMob Ads configuration saved successfully!');
  };

  const handleSaveAnnouncement = () => {
    const updated: AdminAnnouncement = {
      enabled: announcementEnabled,
      message: announcementMsg,
      type: announcementType,
      actionText: announcementAction.trim() || undefined,
    };
    updateAnnouncement(updated);
    setSettings(getAdminSettings());
    onRefreshAppState();
    showNotice('Announcement configuration saved & broadcasted!');
  };

  const handleToggleTemplate = (templateId: string) => {
    toggleTemplateVisibility(templateId);
    setSettings(getAdminSettings());
    onRefreshAppState();
  };

  const handlePromoteTemplate = (templateId: string) => {
    promoteCommunityTemplate(templateId);
    setSettings(getAdminSettings());
    onRefreshAppState();
    showNotice('Community template promoted to Official System Templates!');
  };

  const handleDeleteCommunityTpl = (templateId: string) => {
    deleteCommunityTemplate(templateId);
    setSettings(getAdminSettings());
    onRefreshAppState();
    showNotice('Community template removed.');
  };

  const handleCreateNewOfficialTemplate = (e: React.FormEvent) => {
    e.preventDefault();

    let elements = [];
    if (selectedProjectToConvert) {
      const prj = projects.find((p) => p.id === selectedProjectToConvert);
      if (prj) {
        elements = JSON.parse(JSON.stringify(prj.elements));
      }
    } else {
      elements = [
        {
          id: `el_bg_${Date.now()}`,
          type: 'rect' as const,
          x: Math.round(newTplWidth * 0.05),
          y: Math.round(newTplHeight * 0.05),
          width: Math.round(newTplWidth * 0.9),
          height: Math.round(newTplHeight * 0.9),
          fill: '#1a233d',
          cornerRadius: 24,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 0.8,
        },
        {
          id: `el_txt_${Date.now()}`,
          type: 'text' as const,
          x: Math.round(newTplWidth * 0.1),
          y: Math.round(newTplHeight * 0.35),
          width: Math.round(newTplWidth * 0.8),
          height: 120,
          text: newTplHeadText || 'PROMOTION TITLE',
          fontSize: Math.round(newTplWidth * 0.08),
          fontFamily: 'Outfit',
          fontWeight: '800' as const,
          fill: '#ffffff',
          align: 'center' as const,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
        },
      ];
    }

    const tpl: Template = {
      id: `tpl_admin_${Date.now()}`,
      title: newTplTitle.trim() || 'New Official Template',
      category: newTplCategory,
      categoryLabel: newTplCategory.toUpperCase(),
      width: newTplWidth,
      height: newTplHeight,
      backgroundColor: newTplBg,
      elements,
      tags: ['official', 'new', newTplCategory],
      description: 'Official verified studio design template.',
      authorName: currentSession?.name || 'Pixora Official',
      isCommunity: false,
      createdAt: Date.now(),
    };

    addCustomSystemTemplate(tpl);
    setSettings(getAdminSettings());
    onRefreshAppState();
    setShowCreateTemplateModal(false);
    setNewTplTitle('');
    setSelectedProjectToConvert('');
    showNotice('New Official System Template published!');
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinFeedback(null);
    const res = updateOwnerPin(currentPin, newPin);
    if (res.success) {
      setPinFeedback({ type: 'success', text: res.message });
      setCurrentPin('');
      setNewPin('');
      setSettings(getAdminSettings());
      showNotice('Master Security PIN updated successfully!');
    } else {
      setPinFeedback({ type: 'error', text: res.message });
    }
  };

  const handleToggleMaintenance = () => {
    const nextState = !settings.maintenanceMode;
    toggleMaintenanceMode(nextState, maintenanceMsg);
    setSettings(getAdminSettings());
    onRefreshAppState();
    showNotice(`Maintenance Mode is now ${nextState ? 'ACTIVE' : 'DISABLED'}`);
  };

  const handleExportSystemBackup = () => {
    const backupData = {
      exportedAt: Date.now(),
      owner: settings.ownerEmail,
      adminUsers: settings.adminUsers,
      adminSettings: settings,
      userProjects: getProjects(),
    };

    const str = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const dl = document.createElement('a');
    dl.href = str;
    dl.download = `pixora-admin-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
    logAdminAction('Backup Exported', 'Full system JSON backup downloaded', 'success');
    showNotice('Full system backup downloaded!');
  };

  const officialTemplates = [...settings.customTemplates, ...TEMPLATES];
  const communityTemplates = settings.communityTemplates || [];
  const adminUsers = settings.adminUsers || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-6xl h-[92vh] bg-[#0c101d] border border-violet-500/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Admin Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#080b14] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white font-['Outfit']">
                  Pixora Admin Console
                </h2>
                <span className="px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 text-[10px] font-bold uppercase tracking-wider">
                  {currentSession?.isOwner ? 'Master Owner' : (currentSession?.role || 'Admin').toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as: <span className="text-violet-300 font-mono">{currentSession?.email || settings.ownerEmail}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logoutAdmin();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Logout from Admin session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Temporary Notification Banner */}
        {notification && (
          <div className="px-6 py-2 bg-emerald-950 border-b border-emerald-800 text-emerald-200 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-emerald-400 hover:text-white cursor-pointer">✕</button>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="px-6 bg-[#0a0e1a] border-b border-slate-800 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'team', label: `Team & Admins (${adminUsers.length})`, icon: UserPlus },
            { id: 'templates', label: `Templates (${officialTemplates.length + communityTemplates.length})`, icon: LayoutTemplate },
            { id: 'ads', label: 'AdMob Ads', icon: Tv },
            { id: 'announcement', label: 'Announcement Banner', icon: Megaphone },
            { id: 'system', label: 'System & Maintenance', icon: Sliders },
            { id: 'security', label: 'Master PIN', icon: Key },
            { id: 'audit', label: `Audit Log (${settings.auditLogs.length})`, icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'border-violet-500 text-violet-300 bg-violet-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#090d18] space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow">
                  <span className="text-xs text-slate-400 font-medium">Authorized Admin Team</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-2xl font-bold text-white font-mono">{adminUsers.length + 1}</span>
                    <span className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
                      <UserPlus className="w-5 h-5" />
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow">
                  <span className="text-xs text-slate-400 font-medium">Official Templates</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-2xl font-bold text-white font-mono">{officialTemplates.length}</span>
                    <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                      <Award className="w-5 h-5" />
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow">
                  <span className="text-xs text-slate-400 font-medium">Player Community Templates</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-2xl font-bold text-white font-mono">{communityTemplates.length}</span>
                    <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400">
                      <Users className="w-5 h-5" />
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow">
                  <span className="text-xs text-slate-400 font-medium">AdMob Ads Status</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-sm font-bold ${settings.adsConfig.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {settings.adsConfig.enabled ? 'Enabled (Active)' : 'Disabled'}
                    </span>
                    <span className="p-2 rounded-xl bg-amber-600/20 text-amber-400">
                      <Tv className="w-5 h-5" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Owner Quick Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('team')}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-violet-600/20 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add New Admin User
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('templates');
                      setShowCreateTemplateModal(true);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add System Template
                  </button>

                  <button
                    onClick={() => setActiveTab('ads')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Tv className="w-4 h-4 text-amber-400" />
                    Configure AdMob Units
                  </button>

                  <button
                    onClick={handleExportSystemBackup}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download System Backup JSON
                  </button>
                </div>
              </div>

              {/* Live AdMob Preview in Overview */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Tv className="w-4 h-4 text-amber-400" />
                  Active Ad Banner Preview (AdMob Unit: {settings.adsConfig.adMobUnitId})
                </h3>
                <AdMobBanner adsConfig={settings.adsConfig} placement="home" />
              </div>
            </div>
          )}

          {/* TAB 2: TEAM & ADMINS MANAGEMENT (User requested feature!) */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-violet-400" />
                    Admin Team & Access Management
                  </h3>
                  <p className="text-xs text-slate-400">
                    Add new administrators or moderators with their Gmail and secret login code. They can log in to help manage Pixora.
                  </p>
                </div>
              </div>

              {/* Master Owner Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/60 to-slate-900 border border-violet-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/30 text-violet-300 border border-violet-500/50 flex items-center justify-center font-bold">
                    ★
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">Master Owner Account</span>
                      <span className="px-2 py-0.5 rounded bg-violet-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                        Primary Owner
                      </span>
                    </div>
                    <span className="text-xs text-violet-300 font-mono">{settings.ownerEmail}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-emerald-400 font-semibold block">Full Super-Admin Control</span>
                  <span className="text-[11px] text-slate-400">Can add, suspend, or revoke any admin member</span>
                </div>
              </div>

              {/* Feedback Alert */}
              {adminUserFeedback && (
                <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  adminUserFeedback.type === 'success'
                    ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-200'
                    : 'bg-red-950/80 border border-red-800 text-red-200'
                }`}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{adminUserFeedback.text}</span>
                </div>
              )}

              {/* Form to Add New Admin User */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-violet-400" />
                  Provision New Admin Access
                </h4>

                <form onSubmit={handleAddAdmin} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Admin Gmail / Email
                      </label>
                      <input
                        type="email"
                        required
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="admin@gmail.com"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Member Name / Handle
                      </label>
                      <input
                        type="text"
                        required
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Secret Login Code / PIN
                      </label>
                      <input
                        type="text"
                        required
                        value={newAdminPin}
                        onChange={(e) => setNewAdminPin(e.target.value)}
                        placeholder="min 4 digits code"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Admin Role
                      </label>
                      <select
                        value={newAdminRole}
                        onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                      >
                        <option value="admin">Admin (Full Management)</option>
                        <option value="moderator">Moderator (Templates Only)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Authorize & Create Admin Account</span>
                  </button>
                </form>
              </div>

              {/* List of Registered Admin Users */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Authorized Team Members ({adminUsers.length})
                </h4>

                {adminUsers.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs">
                    No extra admin users added yet. Use the form above to invite team members with their Gmail and secret login code!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {adminUsers.map((user) => {
                      const isEditingPin = editingUserPinId === user.id;

                      return (
                        <div
                          key={user.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                            user.isActive
                              ? 'bg-slate-900 border-slate-700'
                              : 'bg-slate-950/60 border-slate-850 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-white">{user.name}</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-950 text-violet-300 border border-violet-800 uppercase">
                                  {user.role}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  user.isActive
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : 'bg-red-950 text-red-300 border border-red-800'
                                }`}>
                                  {user.isActive ? 'Active' : 'Suspended'}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                                <span>{user.email}</span>
                                <span>·</span>
                                <span>Login Code: <strong className="text-white bg-slate-800 px-1 rounded">{user.pin}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            {isEditingPin ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  autoFocus
                                  value={editedUserPin}
                                  onChange={(e) => setEditedUserPin(e.target.value)}
                                  placeholder="New PIN"
                                  className="w-24 px-2 py-1 bg-slate-950 border border-violet-500 rounded text-xs text-white font-mono"
                                />
                                <button
                                  onClick={() => handleUpdateAdminPin(user.id)}
                                  className="px-2 py-1 bg-violet-600 text-white rounded text-xs font-bold"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingUserPinId(null)}
                                  className="text-xs text-slate-400 hover:text-white px-1"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingUserPinId(user.id);
                                  setEditedUserPin(user.pin);
                                }}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1"
                                title="Change login passcode"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Change Code</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleToggleAdminStatus(user.id)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                                user.isActive
                                  ? 'bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60'
                                  : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60'
                              }`}
                            >
                              <span>{user.isActive ? 'Suspend' : 'Activate'}</span>
                            </button>

                            <button
                              onClick={() => handleRemoveAdmin(user.id)}
                              className="p-1.5 hover:bg-red-950/60 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Delete admin user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TEMPLATES MANAGEMENT (Official + Community) */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Template Management & Moderation</h3>
                  <p className="text-xs text-slate-400">
                    Add new official templates, toggle visibility, and moderate community templates submitted by players.
                  </p>
                </div>

                <button
                  onClick={() => setShowCreateTemplateModal(true)}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/20 flex items-center gap-1.5 self-start cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Official Template</span>
                </button>
              </div>

              {/* Section 1: Community Templates submitted by players */}
              {communityTemplates.length > 0 && (
                <div className="p-5 rounded-2xl bg-[#0e1628] border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-cyan-400" />
                      <h4 className="text-sm font-bold text-white">
                        Community Templates Submitted by Players ({communityTemplates.length})
                      </h4>
                    </div>
                    <span className="text-xs text-cyan-300">
                      You can promote any community template to Official System Template!
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {communityTemplates.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/70 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-cyan-400 font-semibold">{tpl.categoryLabel}</span>
                            <span className="text-slate-400 font-mono">{tpl.width}×{tpl.height}</span>
                          </div>
                          <h5 className="font-bold text-sm text-white line-clamp-1">{tpl.title}</h5>
                          <p className="text-xs text-slate-400 mt-0.5">
                            By Player: <span className="text-slate-200 font-medium">{tpl.authorName || 'Guest'}</span>
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handlePromoteTemplate(tpl.id)}
                            className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Make this an official system template"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-300" />
                            <span>Promote to Official</span>
                          </button>

                          <button
                            onClick={() => handleDeleteCommunityTpl(tpl.id)}
                            className="p-1.5 hover:bg-red-950/60 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete this submission"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 2: Official System Templates */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Official Studio Templates ({officialTemplates.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {officialTemplates.map((template) => {
                    const isHidden = settings.hiddenTemplateIds.includes(template.id);
                    return (
                      <div
                        key={template.id}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                          isHidden
                            ? 'bg-slate-950/40 border-slate-800/80 opacity-60'
                            : 'bg-slate-900 border-slate-700/80 shadow-md'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-violet-400">
                              {template.categoryLabel}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isHidden
                                ? 'bg-red-950 text-red-300 border border-red-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}>
                              {isHidden ? 'Hidden from Users' : 'Active / Visible'}
                            </span>
                          </div>

                          <h5 className="text-sm font-bold text-white line-clamp-1">{template.title}</h5>
                          <span className="text-xs font-mono text-slate-400 block mt-0.5">
                            {template.width}×{template.height} px · {template.elements.length} elements
                          </span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                          <button
                            onClick={() => handleToggleTemplate(template.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                              isHidden
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300'
                            }`}
                          >
                            {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span>{isHidden ? 'Make Visible' : 'Hide from App'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADMOB ADS MANAGEMENT */}
          {activeTab === 'ads' && (
            <form onSubmit={handleSaveAds} className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Tv className="w-4 h-4 text-amber-400" />
                  Google AdMob Monetization Controls
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage your Google AdMob App ID and Ad Unit ID directly. Toggle banner ad placements across the application.
                </p>
              </div>

              {/* Global Ad Toggle */}
              <label className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adsForm.enabled}
                  onChange={(e) => setAdsForm({ ...adsForm, enabled: e.target.checked })}
                  className="w-5 h-5 rounded text-violet-600 bg-slate-800 border-slate-700"
                />
                <div>
                  <span className="text-sm font-bold text-white block">Enable AdMob Ads Globally</span>
                  <span className="text-xs text-slate-400">
                    Master switch for all banner and native ads across Pixora.
                  </span>
                </div>
              </label>

              {/* Credentials */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  AdMob Credentials
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    AdMob App ID
                  </label>
                  <input
                    type="text"
                    required
                    value={adsForm.adMobAppId}
                    onChange={(e) => setAdsForm({ ...adsForm, adMobAppId: e.target.value })}
                    placeholder="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    AdMob Ad Unit ID
                  </label>
                  <input
                    type="text"
                    required
                    value={adsForm.adMobUnitId}
                    onChange={(e) => setAdsForm({ ...adsForm, adMobUnitId: e.target.value })}
                    placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Custom Ad Content & Campaign */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Ad Banner Copy & Click URL
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ad Headline / Title
                  </label>
                  <input
                    type="text"
                    value={adsForm.customBannerTitle || ''}
                    onChange={(e) => setAdsForm({ ...adsForm, customBannerTitle: e.target.value })}
                    placeholder="e.g. Supercharge Your Creative Workflow with Pixora Pro"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ad Description / Pitch
                  </label>
                  <input
                    type="text"
                    value={adsForm.customBannerDesc || ''}
                    onChange={(e) => setAdsForm({ ...adsForm, customBannerDesc: e.target.value })}
                    placeholder="e.g. High-resolution export, vector stickers, community templates, and zero watermark."
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Target Destination URL
                    </label>
                    <input
                      type="url"
                      value={adsForm.customBannerUrl || ''}
                      onChange={(e) => setAdsForm({ ...adsForm, customBannerUrl: e.target.value })}
                      placeholder="https://example.com/promo"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Button CTA Label
                    </label>
                    <input
                      type="text"
                      value={adsForm.customBannerCta || ''}
                      onChange={(e) => setAdsForm({ ...adsForm, customBannerCta: e.target.value })}
                      placeholder="e.g. Install / Visit or Learn More"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Placement switches */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Ad Placement Toggles
                </h4>

                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adsForm.bannerPlacementHome}
                    onChange={(e) => setAdsForm({ ...adsForm, bannerPlacementHome: e.target.checked })}
                    className="w-4 h-4 rounded text-violet-600 bg-slate-800 border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Home Screen Footer Banner</span>
                    <span className="text-[11px] text-slate-400">Displays on the main page above the footer</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adsForm.bannerPlacementExport}
                    onChange={(e) => setAdsForm({ ...adsForm, bannerPlacementExport: e.target.checked })}
                    className="w-4 h-4 rounded text-violet-600 bg-slate-800 border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Artwork Export Modal Banner</span>
                    <span className="text-[11px] text-slate-400">Displays inside the download & share modal</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adsForm.bannerPlacementTemplates}
                    onChange={(e) => setAdsForm({ ...adsForm, bannerPlacementTemplates: e.target.checked })}
                    className="w-4 h-4 rounded text-violet-600 bg-slate-800 border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Template Gallery Banner</span>
                    <span className="text-[11px] text-slate-400">Displays inside the template browsing dialog</span>
                  </div>
                </label>
              </div>

              {/* Live Preview */}
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-2">Live Ad Preview</span>
                <AdMobBanner adsConfig={adsForm} placement="home" />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
              >
                Save AdMob Configuration
              </button>
            </form>
          )}

          {/* TAB 5: ANNOUNCEMENT BANNER */}
          {activeTab === 'announcement' && (
            <div className="max-w-2xl space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white">Global Announcement Banner</h3>
                <p className="text-xs text-slate-400">
                  Broadcast promotional notifications, product updates, or alerts to all visitors across the top of Pixora.
                </p>
              </div>

              {/* Enable toggle */}
              <label className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcementEnabled}
                  onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                  className="w-5 h-5 rounded text-violet-600 bg-slate-800 border-slate-700"
                />
                <div>
                  <span className="text-sm font-bold text-white block">Enable Global Banner</span>
                  <span className="text-xs text-slate-400">
                    When checked, this message will display at the top of the header.
                  </span>
                </div>
              </label>

              {/* Message text */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Announcement Message
                </label>
                <textarea
                  rows={3}
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  placeholder="e.g. ✨ New Summer 2026 templates are live! Create your designs today."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Theme color */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Banner Color Theme
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'purple', label: 'Violet Glow', color: 'bg-violet-600' },
                    { id: 'info', label: 'Cyan Blue', color: 'bg-sky-600' },
                    { id: 'success', label: 'Emerald Green', color: 'bg-emerald-600' },
                    { id: 'warning', label: 'Amber Alert', color: 'bg-amber-600' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setAnnouncementType(theme.id as any)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        announcementType === theme.id
                          ? 'border-violet-400 bg-slate-800 text-white'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${theme.color}`} />
                      <span>{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Text */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Action Link Text (Optional)
                </label>
                <input
                  type="text"
                  value={announcementAction}
                  onChange={(e) => setAnnouncementAction(e.target.value)}
                  placeholder="e.g. Explore Now or Try It Out"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveAnnouncement}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
              >
                Save & Broadcast Announcement
              </button>
            </div>
          )}

          {/* TAB 6: SYSTEM & MAINTENANCE */}
          {activeTab === 'system' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">System Controls & Maintenance</h3>
                <p className="text-xs text-slate-400">
                  Global controls for platform availability, exports, and data backups.
                </p>
              </div>

              {/* Maintenance Mode */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Maintenance Mode</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Temporarily lock public access while you perform updates or test new features.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleMaintenance}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      settings.maintenanceMode
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {settings.maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
                  </button>
                </div>

                {settings.maintenanceMode && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Maintenance Notice Message
                    </label>
                    <input
                      type="text"
                      value={maintenanceMsg}
                      onChange={(e) => setMaintenanceMsg(e.target.value)}
                      onBlur={() => {
                        toggleMaintenanceMode(true, maintenanceMsg);
                        setSettings(getAdminSettings());
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Backup & Restore */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-violet-400" />
                  Full Database Backup & Dump
                </h4>
                <p className="text-xs text-slate-400">
                  Download a comprehensive JSON package containing all user designs, admin settings, team members, and custom templates.
                </p>
                <button
                  onClick={handleExportSystemBackup}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Backup (.json)
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: MASTER OWNER PIN */}
          {activeTab === 'security' && (
            <div className="max-w-md space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white">Master Owner Security & Passcode</h3>
                <p className="text-xs text-slate-400">
                  Change the Master PIN used by the Primary Owner (<span className="text-violet-300 font-mono">{settings.ownerEmail}</span>).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Registered Master Owner</span>
                <span className="text-sm font-bold text-violet-300 font-mono">
                  {settings.ownerEmail}
                </span>
              </div>

              {pinFeedback && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  pinFeedback.type === 'success'
                    ? 'bg-emerald-950 border border-emerald-800 text-emerald-200'
                    : 'bg-red-950 border border-red-800 text-red-200'
                }`}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{pinFeedback.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Current Master PIN
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="Enter current PIN"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    New Master PIN (min 4 digits)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Enter new secret PIN"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-violet-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Update Owner PIN
                </button>
              </form>
            </div>
          )}

          {/* TAB 8: AUDIT LOG */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">System Security & Action Logs</h3>
                <p className="text-xs text-slate-400">
                  Chronological record of all administrative logins, team provisioning, template adjustments, and system events.
                </p>
              </div>

              <div className="space-y-2">
                {settings.auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${
                          log.level === 'warn' ? 'bg-amber-400' : log.level === 'success' ? 'bg-emerald-400' : 'bg-violet-400'
                        }`} />
                        <span className="font-bold text-white">{log.action}</span>
                      </div>
                      <p className="text-slate-300">{log.details}</p>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Create New Official Template inside Admin Panel */}
      {showCreateTemplateModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#111728] border border-violet-500/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Create Official Template</h3>
              </div>
              <button
                onClick={() => setShowCreateTemplateModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewOfficialTemplate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Template Title</label>
                <input
                  type="text"
                  required
                  value={newTplTitle}
                  onChange={(e) => setNewTplTitle(e.target.value)}
                  placeholder="e.g. Neo Tokyo Cyber Concert"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              {projects.length > 0 && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Convert Existing User Design (Optional)
                  </label>
                  <select
                    value={selectedProjectToConvert}
                    onChange={(e) => setSelectedProjectToConvert(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="">-- Start from clean layout preset --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.width}×{p.height})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newTplCategory}
                    onChange={(e) => setNewTplCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="social">Social Media</option>
                    <option value="youtube">YouTube Thumbnail</option>
                    <option value="posters">Posters</option>
                    <option value="invitations">Invitations</option>
                    <option value="presentations">Presentations</option>
                    <option value="logos">Logos</option>
                    <option value="business">Business</option>
                    <option value="photo">Photo Designs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newTplBg}
                      onChange={(e) => setNewTplBg(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-slate-300">{newTplBg}</span>
                  </div>
                </div>
              </div>

              {!selectedProjectToConvert && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Width (px)</label>
                      <input
                        type="number"
                        value={newTplWidth}
                        onChange={(e) => setNewTplWidth(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Height (px)</label>
                      <input
                        type="number"
                        value={newTplHeight}
                        onChange={(e) => setNewTplHeight(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Primary Headline Text</label>
                    <input
                      type="text"
                      value={newTplHeadText}
                      onChange={(e) => setNewTplHeadText(e.target.value)}
                      placeholder="Headline text"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>
                </>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTemplateModal(false)}
                  className="px-3 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Publish Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
