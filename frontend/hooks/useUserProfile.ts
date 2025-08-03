import { useState, useCallback, useMemo } from 'react';
import { Contract } from 'ethers';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePrivyEthers } from './usePrivyEthers';
import {
  CONTRACT_ADDRESSES,
  ETHERLINK_TESTNET_CHAIN_ID,
} from '../contracts/addresses';
import UserProfileABI from '../abi/UserProfile.json';
import { toast } from 'react-toastify';

export interface UserProfile {
  username: string;
  bio: string;
  avatarURI: string;
  skills: string[];
  reputation: bigint;
  totalEarnings: bigint;
  isActive: boolean;
  createdAt: bigint;
}

export interface CreateProfileParams {
  username: string;
  bio: string;
  avatarURI: string;
  skills: string[];
}

export const useUserProfile = (userAddress?: string) => {
  const { provider, signer, address, chainId } = usePrivyEthers();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const targetAddress = userAddress || address;

  // Create contract instance
  const contract = useMemo(() => {
    if (!provider) return null;
    return new Contract(
      CONTRACT_ADDRESSES.UserProfile,
      UserProfileABI.abi,
      signer || provider
    );
  }, [provider, signer]);

  // Query keys for caching
  const profileQueryKey = useMemo(
    () => ['userProfile', targetAddress],
    [targetAddress]
  );
  const hasProfileQueryKey = useMemo(
    () => ['hasProfile', targetAddress],
    [targetAddress]
  );

  // Check if user has a profile (cached)
  const {
    data: hasProfile,
    isLoading: isCheckingProfile,
    refetch: refetchHasProfile,
  } = useQuery({
    queryKey: hasProfileQueryKey,
    queryFn: async () => {
      if (!contract || !targetAddress) return false;
      try {
        const hasUserProfile = await contract.hasProfile(targetAddress);
        return hasUserProfile;
      } catch (error) {
        console.error('Error checking user profile:', error);
        return false;
      }
    },
    enabled: !!(contract && targetAddress),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Get user profile (cached)
  const {
    data: profile,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: profileQueryKey,
    queryFn: async (): Promise<UserProfile | null> => {
      if (!contract || !targetAddress) return null;
      try {
        const profileData = await contract.getProfile(targetAddress);

        const userProfile: UserProfile = {
          username: profileData.username,
          bio: profileData.bio,
          avatarURI: profileData.avatarURI,
          skills: profileData.skills,
          reputation: profileData.reputation,
          totalEarnings: profileData.totalEarnings,
          isActive: profileData.isActive,
          createdAt: profileData.createdAt,
        };

        return userProfile;
      } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
      }
    },
    enabled: !!(contract && targetAddress && hasProfile),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Manual functions for backwards compatibility
  const checkUserProfile = useCallback(
    async (checkAddress?: string) => {
      if (checkAddress && checkAddress !== targetAddress) {
        // If checking different address, make direct call
        if (!contract) return false;
        try {
          return await contract.hasProfile(checkAddress);
        } catch (error) {
          console.error('Error checking user profile:', error);
          return false;
        }
      }
      // Use cached data or refetch
      if (hasProfile !== undefined) return hasProfile;
      const result = await refetchHasProfile();
      return result.data || false;
    },
    [contract, hasProfile, refetchHasProfile, targetAddress]
  );

  const getUserProfile = useCallback(
    async (getAddress?: string) => {
      if (getAddress && getAddress !== targetAddress) {
        // If getting different address, make direct call
        if (!contract) return null;
        try {
          const profileData = await contract.getProfile(getAddress);
          return {
            username: profileData.username,
            bio: profileData.bio,
            avatarURI: profileData.avatarURI,
            skills: profileData.skills,
            reputation: profileData.reputation,
            totalEarnings: profileData.totalEarnings,
            isActive: profileData.isActive,
            createdAt: profileData.createdAt,
          };
        } catch (error) {
          console.error('Error getting user profile:', error);
          return null;
        }
      }
      // Use cached data or refetch
      if (profile) return profile;
      const result = await refetchProfile();
      return result.data || null;
    },
    [contract, profile, refetchProfile, targetAddress]
  );

  // Create user profile
  const createProfile = useCallback(
    async (params: CreateProfileParams) => {
      if (!contract || !signer) {
        throw new Error('Contract or signer not available');
      }

      if (chainId !== ETHERLINK_TESTNET_CHAIN_ID) {
        throw new Error('Please switch to Etherlink Testnet');
      }

      try {
        setLoading(true);

        const tx = await contract.createProfile(
          params.username,
          params.bio,
          params.avatarURI,
          params.skills
        );

        toast.success('Creating profile...', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          style: {
            background: '#0a0a0a',
            border: '1px solid #00ff88',
            color: '#fff',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          },
        });

        await tx.wait();

        toast.success('Profile created successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          style: {
            background: '#0a0a0a',
            border: '1px solid #00ff88',
            color: '#fff',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          },
        });

        // Invalidate and refetch cache
        queryClient.invalidateQueries({ queryKey: hasProfileQueryKey });
        queryClient.invalidateQueries({ queryKey: profileQueryKey });

        return tx;
      } catch (error: unknown) {
        console.error('Error creating profile:', error);

        let errorMessage = 'Failed to create profile';
        if (error && typeof error === 'object') {
          const err = error as { reason?: string; message?: string };
          if (err.reason) {
            errorMessage = err.reason;
          } else if (err.message && err.message.includes('user rejected')) {
            errorMessage = 'Transaction cancelled by user';
          }
        }

        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          style: {
            background: '#0a0a0a',
            border: '1px solid #ff0088',
            color: '#fff',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          },
        });

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [
      contract,
      signer,
      chainId,
      queryClient,
      hasProfileQueryKey,
      profileQueryKey,
    ]
  );

  return {
    hasProfile,
    profile,
    loading: loading || isCheckingProfile || isLoadingProfile,
    isCheckingProfile,
    isLoadingProfile,
    checkUserProfile,
    getUserProfile,
    createProfile,
    contract,
    // Additional cache-related methods
    refetchProfile,
    refetchHasProfile,
  };
};
