import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
  useMemo,
} from "react";

import { useAuth } from "./AuthContext";
import { type ProfileDto } from "../../../backend/src/types";
import { profileService } from "../../../backend/src/services/profileService";

type ProfileCacheShape = {
  profile: ProfileDto | null;
  lastProfileFetchTs: number | null; // epoch milliseconds when profile was fetched
  isHobbyCacheFresh: boolean; // true => hobbies in cached profile are fresh
};

type ProfileContextValue = {
  profile: ProfileDto | null;
  loading: boolean;
  error: string | null;

  /**
   * Ensures a valid profile is present and returns it.
   * Will fetch from server if cache is missing, expired, or hobby flag is stale.
   */
  getProfile: () => Promise<ProfileDto | null>;

  /** Force a server refresh and update cache (returns updated profile) */
  refreshProfile: () => Promise<ProfileDto>;

  /** Mark the hobby portion of the cache as stale without making network calls */
  invalidateHobbies: () => void;

  /**
   * Add a hobby on the server. On success, mark the hobby cache stale.
   * Exposes errors to caller. Adjust endpoint path if your backend differs.
   */
  addHobby: (hobby: string) => Promise<void>;
  /** Manually update the profile state (e.g. after an edit) */
  updateProfileState: (newProfile: ProfileDto) => void;
};

// ---------- Helpers ----------
function readCacheFromLocalStorage(key: string): ProfileCacheShape {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return { profile: null, lastProfileFetchTs: null, isHobbyCacheFresh: false };
    }
    const parsed = JSON.parse(raw);
    return {
      profile: parsed.profile ?? null,
      lastProfileFetchTs: parsed.lastProfileFetchTs ?? null,
      isHobbyCacheFresh:
        typeof parsed.isHobbyCacheFresh === "boolean" ? parsed.isHobbyCacheFresh : false,
    };
  } catch (e) {
    console.warn("Failed to read profile cache from localStorage, clearing it.", e);
    localStorage.removeItem(key);
    return { profile: null, lastProfileFetchTs: null, isHobbyCacheFresh: false };
  }
}

function writeCacheToLocalStorage(key:string, cache: ProfileCacheShape) {
  try {
    localStorage.setItem(key, JSON.stringify(cache));
  } catch (e) {
    console.warn("Failed to write profile cache to localStorage", e);
  }
}

function isProfileUrlExpired(lastFetchTs: number | null, ttl: number) {
  if (!lastFetchTs) return true;
  return Date.now() - lastFetchTs > ttl;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

// ---------- Provider ----------
export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ---------- Local storage keys & constants ----------
  const { userId } = useAuth();
  const PROFILE_URL_TTL_MS = 5 * 60 * 1000; // 5 minutes in ms

  const LS_KEY = useMemo(() => {
    return `hobbylist_profile_cache_v1_${userId || "guest"}`;
  }, [userId]);

  const initialCache = useMemo(() => readCacheFromLocalStorage(LS_KEY), [LS_KEY]);

  const [profile, setProfile] = useState<ProfileDto | null>(initialCache.profile);
  const [lastProfileFetchTs, setLastProfileFetchTs] = useState<number | null>(
    initialCache.lastProfileFetchTs
  );
  const [isHobbyCacheFresh, setIsHobbyCacheFresh] = useState<boolean>(
    initialCache.isHobbyCacheFresh
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // in-flight fetch promise to deduplicate concurrent fetches
  const inFlightRef = useRef<Promise<ProfileDto | null> | null>(null);

  // reset cache if userId changes (logout/login)
  useEffect(() => {
    const newCache = readCacheFromLocalStorage(LS_KEY);

    setProfile(newCache.profile);
    setLastProfileFetchTs(newCache.lastProfileFetchTs);
    setIsHobbyCacheFresh(newCache.isHobbyCacheFresh);

    // clear in-flight fetch
    inFlightRef.current = null;
  }, [LS_KEY]);

  // persist changes to localStorage whenever cache changes
  useEffect(() => {
    writeCacheToLocalStorage(LS_KEY, {
      profile,
      lastProfileFetchTs,
      isHobbyCacheFresh,
    });
  }, [LS_KEY, profile, lastProfileFetchTs, isHobbyCacheFresh]);

  // ---------- exposed functions ----------
  const getProfile = async (): Promise<ProfileDto | null> => {
    setError(null);

    // If cache present and both conditions satisfied, return it.
    const hasProfile = profile !== null;
    const hobbyFresh = isHobbyCacheFresh === true;
    const urlNotExpired = !isProfileUrlExpired(lastProfileFetchTs, PROFILE_URL_TTL_MS);

    if (hasProfile && hobbyFresh && urlNotExpired) {
      return profile;
    }

    // If a fetch is already in flight, return that promise.
    if (inFlightRef.current) {
      return inFlightRef.current;
    }

    // Otherwise, fetch and update cache.
    const p = (async () => {
      setLoading(true);
      try {
        const fresh = await profileService.getProfile();
        setProfile(fresh);
        setLastProfileFetchTs(Date.now());
        // When we fetch from server, server data represents the ground truth so set hobbies fresh.
        setIsHobbyCacheFresh(true);
        return fresh;
      } catch (err: any) {
        const msg = err?.message || "Unknown error fetching profile";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
        inFlightRef.current = null;
      }
    })();

    inFlightRef.current = p;
    return p;
  };

  const refreshProfile = async (): Promise<ProfileDto> => {
    setError(null);
    // Force a fresh fetch (bypass cache)
    if (inFlightRef.current) {
      // Wait for existing in-flight fetch
      const result = await inFlightRef.current;
      if (result) return result;
    }

    setLoading(true);
    try {
      const fresh = await profileService.getProfile();
      setProfile(fresh);
      setLastProfileFetchTs(Date.now());
      setIsHobbyCacheFresh(true);
      return fresh;
    } catch (err: any) {
      const msg = err?.message || "Unknown error refreshing profile";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const invalidateHobbies = () => {
    setIsHobbyCacheFresh(false);
    // persist change will occur due to effect
  };

  const addHobby = async (hobby: string): Promise<void> => {
    setError(null);
    const trimmed = hobby?.trim();
    if (!trimmed) {
      throw new Error("Invalid hobby value");
    }

    setLoading(true);
    try {
      await profileService.addHobby(trimmed);
      // Server accepted the addition. We mark hobby cache stale per your chosen strategy (B).
      setIsHobbyCacheFresh(false);
    } catch (err: any) {
      const msg = err?.message || "Unknown error during addHobby";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfileState = (newProfile: ProfileDto) => {
    setProfile(newProfile);
    // Optionally update timestamp or leave as is. 
    // Since we have fresh data, we can update timestamp to now to prevent immediate refetch.
    setLastProfileFetchTs(Date.now());
    setIsHobbyCacheFresh(true); 
  };

  const value: ProfileContextValue = {
    profile,
    loading,
    error,
    getProfile,
    refreshProfile,
    invalidateHobbies,
    addHobby,
    updateProfileState,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used inside ProfileProvider");
  }
  return ctx;
}
