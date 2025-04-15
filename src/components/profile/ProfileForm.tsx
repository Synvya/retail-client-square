
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FileUploader from '@/components/FileUploader';
import { Profile } from '@/types/profile';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface ProfileFormProps {
  profile: Profile;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  updateProfile: (updatedProfile: Partial<Profile>) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ 
  profile, 
  handleInputChange, 
  updateProfile 
}) => {
  return (
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

      <div className="flex items-center gap-4">
        <label htmlFor="businessType" className="text-lg font-medium w-32">Business Type:</label>
        <Select 
          value={profile.businessType} 
          onValueChange={(value) => updateProfile({ businessType: value })}
        >
          <SelectTrigger className="border-2 border-synvya-dark rounded-md">
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="retail">Retail</SelectItem>
            <SelectItem value="restaurant">Restaurant</SelectItem>
            <SelectItem value="service">Services</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="entertainment">Entertainment</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProfileForm;

