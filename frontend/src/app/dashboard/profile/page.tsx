'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { userService } from '@/features/auth';
import { User, Mail, Phone, MapPin, Lock, Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface ProfileForm {
  ten: string;
  avatar: string;
  sdt: string;
  diachi: string;
}

interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Profile Page - User profile management
 */
export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    ten: '',
    avatar: '',
    sdt: '',
    diachi: '',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  /**
   * Load profile data on mount
   */
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  /**
   * Load profile từ server
   */
  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const profile = await userService.getProfile();
      setProfileForm({
        ten: profile.ten || '',
        avatar: profile.avatar || '',
        sdt: profile.sdt || '',
        diachi: profile.diachi || '',
      });
    } catch (error: any) {
      setErrorMessage('Lỗi tải thông tin profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  /**
   * Handle profile update
   */
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      setIsLoadingProfile(true);
      await userService.updateProfile(profileForm);
      setSuccessMessage('Thông tin profile đã được cập nhật thành công');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Lỗi cập nhật profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  /**
   * Handle password change
   */
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('Mật khẩu mới không khớp');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setErrorMessage('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setIsLoadingPassword(true);
      await userService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setSuccessMessage('Mật khẩu đã được thay đổi thành công');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Lỗi thay đổi mật khẩu');
    } finally {
      setIsLoadingPassword(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Hồ Sơ Cá Nhân</h1>
        <p className="text-slate-600 mt-2">Quản lý thông tin tài khoản và bảo mật</p>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 mb-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'password'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Bảo mật
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Current User Info */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600">
                <strong>Email:</strong> {user?.email}
              </p>
              <p className="text-sm text-slate-600 mt-2">
                <strong>Vai trò:</strong> <span className="capitalize">{user?.vaitro}</span>
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <User className="inline w-4 h-4 mr-2" />
                Tên đầy đủ
              </label>
              <input
                type="text"
                value={profileForm.ten}
                onChange={(e) => setProfileForm({ ...profileForm, ten: e.target.value })}
                placeholder="Nhập tên của bạn"
                className="w-full px-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoadingProfile}
              />
            </div>

            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Upload className="inline w-4 h-4 mr-2" />
                URL Ảnh đại diện
              </label>
              <input
                type="url"
                value={profileForm.avatar}
                onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoadingProfile}
              />
              {profileForm.avatar && (
                <div className="mt-3">
                  <p className="text-xs text-slate-600 mb-2">Xem trước:</p>
                  <img
                    src={profileForm.avatar}
                    alt="Avatar preview"
                    className="w-20 h-20 rounded-lg object-cover border border-slate-200"
                  />
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Phone className="inline w-4 h-4 mr-2" />
                Số điện thoại
              </label>
              <input
                type="tel"
                value={profileForm.sdt}
                onChange={(e) => setProfileForm({ ...profileForm, sdt: e.target.value })}
                placeholder="0123456789"
                className="w-full px-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoadingProfile}
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-2" />
                Địa chỉ
              </label>
              <textarea
                value={profileForm.diachi}
                onChange={(e) => setProfileForm({ ...profileForm, diachi: e.target.value })}
                placeholder="Nhập địa chỉ của bạn"
                rows={3}
                className="w-full px-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoadingProfile}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoadingProfile}
              className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoadingProfile ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                'Cập nhật thông tin'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
            {/* Old Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                placeholder="Nhập mật khẩu hiện tại"
                className="w-full px-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoadingPassword}
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                className="w-full px-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoadingPassword}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoadingPassword}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoadingPassword}
              className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoadingPassword ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Đang thay đổi...
                </>
              ) : (
                'Thay đổi mật khẩu'
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
