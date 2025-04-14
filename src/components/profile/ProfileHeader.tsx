
import React from 'react';
import Logo from '@/components/Logo';

interface ProfileHeaderProps {
  isConnected: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ isConnected }) => {
  return (
    <div className="w-full flex justify-between items-center mb-8">
      <Logo />
      <div className="text-md font-semibold text-green-600">
        Status: Connected
      </div>
    </div>
  );
};

export default ProfileHeader;
