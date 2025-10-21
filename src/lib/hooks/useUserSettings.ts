import { useState, useEffect, useCallback } from 'react';
import { UserSettings, UserProfile, userSettingsService } from '@/lib/services/userSettingsService';

export function useUserSettings(userId?: string) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await userSettingsService.getUserSettings(userId);
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user settings');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(async (updates: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!userId) return;

    try {
      setError(null);
      const updatedSettings = await userSettingsService.updateUserSettings(userId, updates);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  }, [userId]);

  const createDefaults = useCallback(async () => {
    if (!userId) return;

    try {
      setError(null);
      const defaultSettings = await userSettingsService.createDefaultSettings(userId);
      setSettings(defaultSettings);
      return defaultSettings;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create default settings');
      throw err;
    }
  }, [userId]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    createDefaults,
    refetch: fetchSettings
  };
}

export function useUserProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await userSettingsService.getUserProfile(userId);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!userId) return;

    try {
      setError(null);
      const updatedProfile = await userSettingsService.updateUserProfile(userId, updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  }, [userId]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile
  };
}

export function usePasswordChange() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      await userSettingsService.changePassword(currentPassword, newPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    changePassword
  };
}

export function useTwoFactor(userId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTwoFactor = useCallback(async (enabled: boolean) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      await userSettingsService.toggleTwoFactor(userId, enabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle two-factor authentication');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    loading,
    error,
    toggleTwoFactor
  };
}

// Combined hook for complete user data
export function useUserData(userId?: string) {
  const [data, setData] = useState<{ profile: UserProfile | null; settings: UserSettings | null }>({
    profile: null,
    settings: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userData = await userSettingsService.getUserData(userId);
      setData(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    profile: data.profile,
    settings: data.settings,
    loading,
    error,
    refetch: fetchUserData
  };
}