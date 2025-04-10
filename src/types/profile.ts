
export interface MerchantProfile {
  name: string;
  display_name: string;
  about: string;
  picture: string | null;
  banner: string | null;
  website: string;
  hashtags: string[];
  profile_type: string;
  namespace: string;
  nip05: string;
  locations: string[];
}

export interface Profile {
  name: string;
  displayName: string;
  about: string;
  profilePicture: File | null;
  profilePictureUrl: string | null;
  bannerPicture: File | null;
  bannerPictureUrl: string | null;
  website: string;
  categories: string;
  isConnected: boolean;
  publicKey: string;
  profilePublished: boolean;
}

export interface ProfileContextType {
  profile: Profile;
  updateProfile: (updatedProfile: Partial<Profile>) => void;
  connectWithSquare: () => Promise<boolean>;
  saveProfile: () => Promise<boolean>;
  resetProfile: () => void;
  isLoading: boolean;
  republishProfile: () => Promise<boolean>;
}

export const defaultProfile: Profile = {
  name: '',
  displayName: '',
  about: '',
  profilePicture: null,
  profilePictureUrl: null,
  bannerPicture: null,
  bannerPictureUrl: null,
  website: '',
  categories: '',
  isConnected: false,
  publicKey: '',
  profilePublished: false,
};
