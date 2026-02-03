'use client';

import React, { useState } from 'react';
import { MainContent } from '@/components/layout/MainContent';
import {
  User,
  Bell,
  Lock,
  CreditCard,
  Database,
  Mail,
  Globe,
  Shield,
  Key,
  Download,
  Trash2,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'billing' | 'data'>('profile');
  const [saved, setSaved] = useState(false);

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: 'My account',
    email: 'vietd@leadd.com',
    company: 'FedLeads',
    role: 'Sales Manager',
    phone: '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNewLeads: true,
    emailWeeklyReport: true,
    emailSearchAlerts: false,
    pushNewLeads: true,
    pushContractUpdates: false,
  });

  // Security settings
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'data', label: 'Data & Privacy', icon: Database },
  ] as const;

  return (
    <MainContent>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                      ${
                        activeTab === tab.id
                          ? 'border-fed-green-500 text-fed-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <Input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company
                        </label>
                        <Input
                          type="text"
                          value={profileData.company}
                          onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        <Input
                          type="text"
                          value={profileData.role}
                          onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h2>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">New Leads</p>
                          <p className="text-sm text-gray-600">Get notified when new leads match your criteria</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.emailNewLeads}
                        onChange={(e) => setNotifications({ ...notifications, emailNewLeads: e.target.checked })}
                        className="h-4 w-4 text-fed-green-600 focus:ring-fed-green-500 border-gray-300 rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Weekly Report</p>
                          <p className="text-sm text-gray-600">Receive a summary of your activity every week</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.emailWeeklyReport}
                        onChange={(e) => setNotifications({ ...notifications, emailWeeklyReport: e.target.checked })}
                        className="h-4 w-4 text-fed-green-600 focus:ring-fed-green-500 border-gray-300 rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Search Alerts</p>
                          <p className="text-sm text-gray-600">Get alerts for saved search queries</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.emailSearchAlerts}
                        onChange={(e) => setNotifications({ ...notifications, emailSearchAlerts: e.target.checked })}
                        className="h-4 w-4 text-fed-green-600 focus:ring-fed-green-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Push Notifications</h2>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">New Leads</p>
                          <p className="text-sm text-gray-600">Browser notifications for new leads</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.pushNewLeads}
                        onChange={(e) => setNotifications({ ...notifications, pushNewLeads: e.target.checked })}
                        className="h-4 w-4 text-fed-green-600 focus:ring-fed-green-500 border-gray-300 rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Contract Updates</p>
                          <p className="text-sm text-gray-600">Updates on tracked contracts</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.pushContractUpdates}
                        onChange={(e) => setNotifications({ ...notifications, pushContractUpdates: e.target.checked })}
                        className="h-4 w-4 text-fed-green-600 focus:ring-fed-green-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <Input
                        type="password"
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <Input
                        type="password"
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <Input
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <Shield className="h-6 w-6 text-green-600 mr-3 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Not Enabled</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Add an extra layer of security to your account
                        </p>
                        <Button variant="outline" size="sm" className="mt-3">
                          <Key className="h-4 w-4 mr-2" />
                          Enable 2FA
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Current Session</p>
                        <p className="text-sm text-gray-600">MacOS • Chrome • San Francisco, CA</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
                  <div className="bg-gradient-to-r from-fed-green-700 to-fed-green-900 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">Professional</h3>
                        <p className="text-white/80 mt-1">Unlimited searches and exports</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">$99</p>
                        <p className="text-white/80">per month</p>
                      </div>
                    </div>
                    <Button variant="outline" className="mt-4 bg-white text-fed-green-900 hover:bg-white/90">
                      Upgrade Plan
                    </Button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <CreditCard className="h-6 w-6 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                        <p className="text-sm text-gray-600">Expires 12/25</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h2>
                  <div className="space-y-2">
                    {[
                      { date: 'Jan 1, 2026', amount: '$99.00', status: 'Paid' },
                      { date: 'Dec 1, 2025', amount: '$99.00', status: 'Paid' },
                      { date: 'Nov 1, 2025', amount: '$99.00', status: 'Paid' },
                    ].map((invoice, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{invoice.date}</p>
                          <p className="text-sm text-gray-600">{invoice.amount}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            {invoice.status}
                          </span>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <Download className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Download Your Data</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Export all your saved leads, searches, and settings
                        </p>
                        <Button variant="outline" size="sm" className="mt-3">
                          <Download className="h-4 w-4 mr-2" />
                          Request Export
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Usage Analytics</p>
                          <p className="text-sm text-gray-600">Help us improve by sharing usage data</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-fed-green-600 focus:ring-fed-green-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 text-red-600">Danger Zone</h2>
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start">
                      <Trash2 className="h-6 w-6 text-red-600 mr-3 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Delete Account</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Permanently delete your account and all associated data
                        </p>
                        <Button variant="outline" size="sm" className="mt-3 text-red-600 border-red-300 hover:bg-red-100">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-end gap-3">
              {saved && (
                <span className="text-sm text-green-600 font-medium">Settings saved!</span>
              )}
              <Button variant="outline" size="sm">Cancel</Button>
              <Button variant="primary" size="sm" icon={Save} onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainContent>
  );
}
