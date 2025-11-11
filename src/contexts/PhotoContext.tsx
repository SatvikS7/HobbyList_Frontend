import React, { createContext, useContext, useEffect, useState, useRef, type ReactNode} from "react";

const API_BASE = import.meta.env.VITE_BACKEND_BASE;

// ---------- Types ----------
export type PhotoDto = {
  id: string;
  topic: string;
  imageUrl: string;
  description: string;
  uploadDate: string; 
};

type PhotoCacheShape = {
    photos: PhotoDto[] | null;
    isFresh: boolean; // true => cache is fresh
    lastFetchTs: number | null; // epoch milliseconds when photos were fetched
}

type PhotoContextValue = {
    photos: PhotoDto[] | null;
    loading: boolean;
    error: string | null;
    getPhotos: () => Promise<PhotoDto[] | null>;
    refreshPhotos: () => Promise<PhotoDto[]>;
    invalidatePhotos: () => void;
};

const PhotoContext = createContext<PhotoContextValue | undefined>(undefined);

// ---------- Local storage keys & constants ----------
const LS_KEY = "hobbylist_photo_cache_v1";
const PHOTO_URL_TTL_MS = 5 * 60 * 1000; // 5 minutes in ms

// ---------- Helpers ----------
function readCacheFromLocalStorage(): PhotoCacheShape {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      return { photos: null, lastFetchTs: null, isFresh: false };
    }
    const parsed = JSON.parse(raw);
    return {
      photos: parsed.photos ?? null,
      lastFetchTs: parsed.lastFetchTs ?? null,
      isFresh:
        typeof parsed.isFresh === "boolean" ? parsed.isFresh : false,
    };
  } catch (e) {
    console.warn("Failed to read photo cache from localStorage, clearing it.", e);
    localStorage.removeItem(LS_KEY);
    return { photos: null, lastFetchTs: null, isFresh: false };
  }
}

function writeCacheToLocalStorage(cache: PhotoCacheShape) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("Failed to write photo cache to localStorage", e);
  }
}

function isPhotoUrlExpired(lastFetchTs: number | null) {
  if (!lastFetchTs) return true;
  return Date.now() - lastFetchTs > PHOTO_URL_TTL_MS;
}

// ---------- Provider ----------
export const PhotoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const initialCache = readCacheFromLocalStorage();

    const [photos, setPhotos] = useState<PhotoDto[] | null>(initialCache.photos);
    const [lastFetchTs, setLastFetchTs] = useState<number | null>(initialCache.lastFetchTs);
    const [isFresh, setIsFresh] = useState<boolean>(initialCache.isFresh);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const inFlightFetch = useRef<Promise<PhotoDto[] | null> | null>(null);

    useEffect(() => {
        writeCacheToLocalStorage({
        photos,
        lastFetchTs,
        isFresh,
      });
    }, [photos, lastFetchTs, isFresh]);

    const fetchPhotosFromServer = async (): Promise<PhotoDto[]> => {
        const token = sessionStorage.getItem("jwt");
        if (!token) throw new Error("Unauthenticated: missing jwt");   

        const res = await fetch(`${API_BASE}/photos`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const errorMsg = `Failed to fetch photos: ${res.status} ${res.statusText}`;
            throw new Error(errorMsg);
        }

        const data: PhotoDto[] = await res.json();
        return data;
    };

    const getPhotos = async (): Promise<PhotoDto[] | null> => {
        setError(null);

        if (photos && isFresh && !isPhotoUrlExpired(lastFetchTs)) {
            return photos;
        }

        if (inFlightFetch.current) {
            return inFlightFetch.current;
        }

        const p = (async () => {
            setLoading(true);
            try {
                const fetchedPhotos = await fetchPhotosFromServer();
                setPhotos(fetchedPhotos);
                setLastFetchTs(Date.now());
                setIsFresh(true);
                return fetchedPhotos;
            } catch (err: any) {
                setError(err.message || "Unknown error");
                throw err;
            } finally {
                setLoading(false);
                inFlightFetch.current = null;
            }
        })();

        inFlightFetch.current = p;
        return p;
    };

    const refreshPhotos = async (): Promise<PhotoDto[]> => {
        setError(null);

        if (inFlightFetch.current) {
            const res = await inFlightFetch.current;
            if (res) return res;
        }
        inFlightFetch.current = null;

        setLoading(true);
        try {
            const freshPhotos = await fetchPhotosFromServer();
            setPhotos(freshPhotos);
            setLastFetchTs(Date.now());
            setIsFresh(true);
            return freshPhotos;
        } catch (err: any) {
            setError(err.message || "Unknown error");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const invalidatePhotos = () => {
        setIsFresh(false);
    };

    const value: PhotoContextValue = {
        photos,
        loading,
        error,
        getPhotos,
        refreshPhotos,
        invalidatePhotos,
    };

    return <PhotoContext.Provider value={value}>{children}</PhotoContext.Provider>;
};

export function usePhotos() {
    const ctx = useContext(PhotoContext);
    if (!ctx) {
        throw new Error("usePhotos must be used within a PhotoProvider");
    }
    return ctx;
}