'use client';

import { useState } from 'react';
import { UserIcon, BellIcon, ShieldIcon } from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    timezone: 'UTC'
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    weeklyReports: true
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account preferences and notification settings</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <UserIcon className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Profile</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
            <select
              value={profile.timezone}
              onChange={(e) => setProfile({...profile, timezone: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <BellIcon className="h-6 w-6 text-yellow-400" />
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Email Alerts</h3>
              <p className="text-sm text-gray-400">Receive email notifications when monitors go down</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.emailAlerts}
              onChange={(e) => setNotifications({...notifications, emailAlerts: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Push Notifications</h3>
              <p className="text-sm text-gray-400">Receive browser push notifications</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.pushNotifications}
              onChange={(e) => setNotifications({...notifications, pushNotifications: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Weekly Reports</h3>
              <p className="text-sm text-gray-400">Receive weekly summary reports</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.weeklyReports}
              onChange={(e) => setNotifications({...notifications, weeklyReports: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <ShieldIcon className="h-6 w-6 text-green-400" />
          <h2 className="text-xl font-semibold text-white">Security</h2>
        </div>
        
        <div className="space-y-4">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
            Change Password
          </button>
          
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">
            Sign Out All Devices
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}
