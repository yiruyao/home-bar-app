import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { uploadProfileImage, getProfileImageUrl } from '@/lib/storage';

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  picture_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Test user ID that exists in the database
const testUserId = '12345678-1234-1234-1234-123456789012';

const fetchProfile = async (): Promise<Profile> => {
  try {
    // Get current session - do NOT auto-sign in if no session exists
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No authenticated session - user must sign in');
    }

    // Fetch profile from database using the authenticated user ID
    const userId = session.user?.id;
    
    if (!userId) {
      throw new Error('No user ID found in session');
    }
    
    // Try fetching by email first (since that's our unique constraint)
    const userEmail = session.user?.email;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', userEmail);

    if (error) {
      console.error('❌ Error fetching profile by email:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error(`No profile found for email: ${userEmail}`);
    }

    if (data.length > 1) {
      console.warn('⚠️ Multiple profiles found for email:', userEmail, 'using first one');
    }

    const profile = data[0];
    return profile;
    
  } catch (error) {
    console.error('❌ Failed to fetch profile:', error);
    throw error;
  }
};

const updateProfile = async (profileData: Partial<Profile>): Promise<Profile> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error('No authenticated user found');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
};

export const useProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Use the authenticated user's ID only (no fallback)
  const userId = user?.id;

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isStale
  } = useQuery({
    queryKey: ['profile', userId],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes - reasonable cache time
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 2,
    // Only fetch if we have a user (authenticated or test)
    enabled: !!userId,
  });

  // Minimal error logging only
  if (error && !profile) {
    console.error('Profile fetch error:', error.message);
  }

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Update the cache with the new data
      queryClient.setQueryData(['profile', userId], data);
    },
    onError: (error) => {
      console.error('Profile update error:', error);
    },
  });

  // Profile image upload mutation
  const uploadProfileImageMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!userId) throw new Error('No authenticated user');
      
      // Upload the image to Supabase storage
      const uploadResult = await uploadProfileImage(file, userId);
      
      // Get the new signed URL for the uploaded image
      const imageUrl = await getProfileImageUrl(userId);
      
      // Update the profile in the database with the new image URL
      const { data, error } = await supabase
        .from('profiles')
        .update({ picture_url: imageUrl })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: (data) => {
      // Update the cache with the new profile data
      queryClient.setQueryData(['profile', userId], data);
    },
    onError: (error) => {
      console.error('Profile image upload error:', error);
    },
  });

  // Helper to update profile image temporarily (for demo)
  const updateProfileImageTemp = (imageUrl: string) => {
    const currentProfile = queryClient.getQueryData(['profile', userId]) as Profile;
    if (currentProfile) {
      queryClient.setQueryData(['profile', userId], {
        ...currentProfile,
        picture_url: imageUrl
      });
    }
  };

  return {
    profile,
    isLoading,
    isError,
    error,
    refetch,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error,
    uploadProfileImage: uploadProfileImageMutation.mutate,
    isUploadingImage: uploadProfileImageMutation.isPending,
    uploadImageError: uploadProfileImageMutation.error,
    updateProfileImageTemp,
  };
};