// src/contexts/ProfileContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";

const API_BASE = import.meta.env.VITE_BACKEND_BASE  ;

// ---------- Types ----------
export type ProfileDto = {
  profileURL: string | null;
  description: string;
  username: string;
  isPrivate: boolean;
  hobbies: string[]; // canonical shape returned by backend
};

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
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

// ---------- Local storage keys & constants ----------
const LS_KEY = "hobbylist_profile_cache_v1";
const PROFILE_URL_TTL_MS = 5 * 60 * 1000; // 5 minutes in ms

// ---------- Helpers ----------
function readCacheFromLocalStorage(): ProfileCacheShape {
  try {
    const raw = localStorage.getItem(LS_KEY);
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
    localStorage.removeItem(LS_KEY);
    return { profile: null, lastProfileFetchTs: null, isHobbyCacheFresh: false };
  }
}

function writeCacheToLocalStorage(cache: ProfileCacheShape) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("Failed to write profile cache to localStorage", e);
  }
}

function isProfileUrlExpired(lastFetchTs: number | null) {
  if (!lastFetchTs) return true;
  return Date.now() - lastFetchTs > PROFILE_URL_TTL_MS;
}

// ---------- Provider ----------
export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialCache = readCacheFromLocalStorage();

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

  // persist changes to localStorage whenever cache changes
  useEffect(() => {
    writeCacheToLocalStorage({
      profile,
      lastProfileFetchTs,
      isHobbyCacheFresh,
    });
  }, [profile, lastProfileFetchTs, isHobbyCacheFresh]);

  // ---------- internal fetcher ----------
  const fetchProfileFromServer = async (): Promise<ProfileDto> => {
    const token = sessionStorage.getItem("jwt");
    if (!token) throw new Error("Unauthenticated: missing jwt");

    const res = await fetch(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => null);
      throw new Error(text || `Failed to fetch profile: ${res.status}`);
    }

    const data = (await res.json()) as ProfileDto;

    // Basic sanitation: ensure hobbies array exists
    if (!Array.isArray(data.hobbies)) {
      data.hobbies = [];
    }

    return data;
  };

  // ---------- exposed functions ----------
  const getProfile = async (): Promise<ProfileDto | null> => {
    setError(null);

    // If cache present and both conditions satisfied, return it.
    const hasProfile = profile !== null;
    const hobbyFresh = isHobbyCacheFresh === true;
    const urlNotExpired = !isProfileUrlExpired(lastProfileFetchTs);

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
        const fresh = await fetchProfileFromServer();
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
      const fresh = await fetchProfileFromServer();
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

  /**
   * addHobby: performs a server-side POST to add a single hobby, then marks the hobby cache stale.
   * - If your backend path differs, change the endpoint below.
   * - Errors bubble up to caller (per your preference).
   */
  const addHobby = async (hobby: string): Promise<void> => {
    setError(null);
    const trimmed = hobby?.trim();
    if (!trimmed) {
      throw new Error("Invalid hobby value");
    }

    const token = sessionStorage.getItem("jwt");
    if (!token) {
      throw new Error("Unauthenticated: missing jwt");
    }

    // Default POST path. Adjust if your backend uses a different route.
    const endpoint = `${API_BASE}/profile/hobbies`;

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hobby: trimmed }), // matches HobbyDto { hobby: string }
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        throw new Error(txt || `Failed to add hobby: ${res.status}`);
      }

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

  const value: ProfileContextValue = {
    profile,
    loading,
    error,
    getProfile,
    refreshProfile,
    invalidateHobbies,
    addHobby,
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
