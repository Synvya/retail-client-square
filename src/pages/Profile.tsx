
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProfile } from '@/context/ProfileContext';
import Logo from '@/components/Logo';
import FileUploader from '@/components/FileUploader';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { MapPin, Package } from 'lucide-react';
import { publishLocations } from '@/services/api';

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
        <div className="w-full flex justify-between items-center mb-8">
          <Logo />
          <div className="text-md font-semibold text-green-600">
            Status: Connected
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label htmlFor="name" className="text-lg font-medium w-32">Name:</label>
              <Input
                id="name"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                className="border-2 border-synvya-dark rounded-md"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="displayName" className="text-lg font-medium w-32">Display name:</label>
              <Input
                id="displayName"
                name="displayName"
                value={profile.displayName}
                onChange={handleInputChange}
                className="border-2 border-synvya-dark rounded-md"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="about" className="text-lg font-medium w-32">About:</label>
              <Textarea
                id="about"
                name="about"
                value={profile.about}
                onChange={handleInputChange}
                className="border-2 border-synvya-dark rounded-md"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="profilePicture" className="text-lg font-medium w-32">Profile picture:</label>
              <FileUploader
                id="profilePicture"
                label="Profile Picture"
                onChange={(file) => updateProfile({ profilePicture: file })}
                currentImage={profile.profilePictureUrl}
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="bannerPicture" className="text-lg font-medium w-32">Banner picture:</label>
              <FileUploader
                id="bannerPicture"
                label="Banner Picture"
                onChange={(file) => updateProfile({ bannerPicture: file })}
                currentImage={profile.bannerPictureUrl}
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="website" className="text-lg font-medium w-32">Website:</label>
              <Input
                id="website"
                name="website"
                value={profile.website}
                onChange={handleInputChange}
                className="border-2 border-synvya-dark rounded-md"
                type="url"
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="categories" className="text-lg font-medium w-32">Categories:</label>
              <Input
                id="categories"
                name="categories"
                value={profile.categories}
                onChange={handleInputChange}
                className="border-2 border-synvya-dark rounded-md"
                placeholder="comma separated list"
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 pt-4">
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
            
            <Separator className="my-4 bg-synvya-dark/20 h-[2px] w-full" />
            
            <div className="text-lg font-medium text-synvya-dark self-start mb-2">Publish:</div>
            
            <div className="flex justify-center gap-4 w-full">
              <Button
                type="button"
                onClick={handlePublishLocations}
                disabled={isPublishingLocations}
                className="rounded-full border-2 border-synvya-dark bg-white text-synvya-dark hover:bg-gray-50 text-lg py-6 px-16"
                variant="outline"
              >
                <MapPin className="mr-2" />
                {isPublishingLocations ? 'Publishing...' : 'Locations'}
              </Button>
              
              <Button
                type="button"
                className="rounded-full border-2 border-synvya-dark bg-white text-synvya-dark hover:bg-gray-50 text-lg py-6 px-16"
                variant="outline"
              >
                <Package className="mr-2" />
                Products
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
