
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/context/ProfileContext';
import { toast } from 'sonner';
import { publishLocations } from '@/services/api';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileForm from '@/components/profile/ProfileForm';
import PublishActions from '@/components/profile/PublishActions';

const Profile = () => {
  const { profile, updateProfile, saveProfile, isLoading } = useProfile();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishingLocations, setIsPublishingLocations] = useState(false);

  useEffect(() => {
    if (!profile.isConnected) {
      navigate('/');
    }
  }, [profile.isConnected, navigate]);

  useEffect(() => {
    console.log('Profile data in component:', profile);
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const success = await saveProfile();
      if (success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('An error occurred while saving your profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateProfile({ [name]: value });
  };

  const handlePublishLocations = async () => {
    setIsPublishingLocations(true);
    
    try {
      const result = await publishLocations();
      console.log('Location publish result:', result);
      
      if (result && result.success) {
        toast.success('Locations published successfully!');
      } else {
        // Safely access the error message with optional chaining and fallback
        const errorMessage = result.data?.message || 'Failed to publish locations.';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error publishing locations:', error);
      toast.error('An error occurred while publishing locations.');
    } finally {
      setIsPublishingLocations(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-xl">Loading profile data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-xl rounded-3xl border-2 border-synvya-dark p-8">
        <ProfileHeader isConnected={profile.isConnected} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <ProfileForm 
            profile={profile} 
            handleInputChange={handleInputChange} 
            updateProfile={updateProfile}
          />

          <div className="flex justify-center gap-4 w-full">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="rounded-full border-2 border-synvya-dark bg-white text-synvya-dark hover:bg-gray-50 text-lg py-6 px-16"
              variant="outline"
            >
              {isSubmitting ? 'Updating...' : 'Update'}
            </Button>
            
            <Button
              type="button"
              onClick={() => navigate('/visualization')}
              className="rounded-full border-2 border-synvya-dark bg-white text-synvya-dark hover:bg-gray-50 text-lg py-6 px-16"
              variant="outline"
            >
              View
            </Button>
          </div>
          
          <PublishActions 
            handlePublishLocations={handlePublishLocations}
            isPublishingLocations={isPublishingLocations}
          />
        </form>
      </div>
    </div>
  );
};

export default Profile;
