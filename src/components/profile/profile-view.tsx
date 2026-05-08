'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/store/app-store';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ProfileForm } from './profile-form';

export function ProfileView() {
  const { currentUser } = useAppStore();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [currentUser.id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${currentUser.id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await res.json();
      setUserData(data.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      toast.success('Profile updated successfully');
      // Refresh data after successful update
      await fetchUserData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !userData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="h-8 w-64 animate-pulse bg-muted"></div>
          <div className="h-4 w-48 animate-pulse bg-muted"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Update your personal information and passport details
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              // Trigger re-fetch
              fetchUserData();
            }}
            className="btn-outline"
          >
            Refresh
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initialData={userData}
            onSubmit={handleUpdate}
            isLoading={saving}
            canEdit={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}