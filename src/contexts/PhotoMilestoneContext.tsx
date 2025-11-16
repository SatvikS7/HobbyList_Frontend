import React, { 
    createContext, 
    useContext, 
    useEffect, 
    useState, 
    useRef, 
    type ReactNode, 
    useMemo 
} from "react";

const API_BASE = import.meta.env.VITE_BACKEND_BASE;

// ---------- Types ----------

// Milestone 
export type MilestoneDto = {
    id: number;
    task: string;
    dueDate: string;
    isCompleted: boolean;
    parentId: number | null;
    subMilestones: MilestoneDto[];
    taggedPhotoIds: number[];
    hobbyTag: string | null;
}

type MilestoneCacheShape = {
    milestones: MilestoneDto[] | null;
    isFresh: boolean; // true => cache is fresh
}

// Photo
export type PhotoDto = {
  id: number;
  topic: string;
  imageUrl: string;
  description: string;
  uploadDate: string; 
  taggedMilestoneIds: number[]
};

type PhotoCacheShape = {
    photos: PhotoDto[] | null;
    isFresh: boolean; // true => cache is fresh
    lastFetchTs: number | null; // epoch milliseconds when photos were fetched
}

type PhotoMilestoneContextValue = {
    // Raw Data
    milestones: MilestoneDto[] | null;
    photos: PhotoDto[] | null;

    // Loading & Error States
    loadingMilestones: boolean;
    loadingPhotos: boolean;
    errorMilestones: string | null;
    errorPhotos: string | null;

    // Derived Lookup Maps
    photoMap: Map<number, PhotoDto>;
    milestoneMap: Map<number, MilestoneDto>;

    //Photo Caching API
    getPhotos: () => Promise<PhotoDto[] | null>;
    refreshPhotos: () => Promise<PhotoDto[]>;
    invalidatePhotos: () => void;

    //Milestone Caching API
    getMilestones: () => Promise<MilestoneDto[] | null>;
    refreshMilestones: () => Promise<MilestoneDto[]>;
    invalidateMilestones: () => void;
};

const PhotoMilestoneContext = createContext<PhotoMilestoneContextValue | undefined>(undefined);

// ---------- Local storage keys & constants ----------
const PHOTO_LS_KEY = "hobbylist_photo_cache_v1";
const PHOTO_URL_TTL_MS = 5 * 60 * 1000; 

const MILESTONE_LS_KEY = "hobbylist_milestone_cache_v1";

// ---------- Helpers ----------
function readPhotoCacheFromLocalStorage(): PhotoCacheShape {
    try {
        const raw = localStorage.getItem(PHOTO_LS_KEY);
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
        localStorage.removeItem(PHOTO_LS_KEY);
        return { photos: null, lastFetchTs: null, isFresh: false };
    }  
}

function writePhotoCacheToLocalStorage(cache: PhotoCacheShape) {
    try {
        localStorage.setItem(PHOTO_LS_KEY, JSON.stringify(cache));
    } catch (e) {
        console.warn("Failed to write photo cache to localStorage", e);
    }
}

function isPhotoUrlExpired(lastFetchTs: number | null) {
    if (!lastFetchTs) return true;
    return Date.now() - lastFetchTs > PHOTO_URL_TTL_MS;
}

function readMilestoneCacheFromLocalStorage(): MilestoneCacheShape {
    try {
        const raw = localStorage.getItem(MILESTONE_LS_KEY);
        if (!raw) {
            return { milestones: null, isFresh: false };
        }
        const parsed = JSON.parse(raw);
        return {
            milestones: parsed.milestones ?? null,
            isFresh:
                typeof parsed.isFresh === "boolean" ? parsed.isFresh : false,
        };
    } catch (e) {
        console.warn("Failed to read milestone cache from localStorage, clearing it.", e);
        localStorage.removeItem(MILESTONE_LS_KEY);
        return { milestones: null, isFresh: false };
    }
}

function writeMilestoneCacheToLocalStorage(cache: MilestoneCacheShape) {
    try {
        localStorage.setItem(MILESTONE_LS_KEY, JSON.stringify(cache));
    } catch (e) {
        console.warn("Failed to write milestone cache to localStorage", e);
    }   
}

// ---------- Provider ----------
export const PhotoMilestoneProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const initialPhotoCache = readPhotoCacheFromLocalStorage();
    const initialMilestoneCache = readMilestoneCacheFromLocalStorage();

    const [photos, setPhotos] = useState<PhotoDto[] | null>(initialPhotoCache.photos);
    const [milestones, setMilestones] = useState<MilestoneDto[] | null>(initialMilestoneCache.milestones);

    const [lastFetchTs, setLastFetchTs] = useState<number | null>(initialPhotoCache.lastFetchTs);
    const [isPhotoCacheFresh, setIsPhotoCacheFresh] = useState<boolean>(initialPhotoCache.isFresh);
    const [isMilestoneCacheFresh, setIsMilestoneCacheFresh] = useState<boolean>(initialMilestoneCache.isFresh);

    const [loadingPhotos, setLoadingPhotos] = useState<boolean>(false);
    const [loadingMilestones, setLoadingMilestones] = useState<boolean>(false);
    const [errorPhotos, setErrorPhotos] = useState<string | null>(null);
    const [errorMilestones, setErrorMilestones] = useState<string | null>(null);

    const inFlightPhotoFetch = useRef<Promise<PhotoDto[] | null> | null>(null);
    const inFlightMilestoneFetch = useRef<Promise<MilestoneDto[] | null> | null>(null);

    const milestoneMap = useMemo(() => {
        const map = new Map<number, MilestoneDto>();
        function addMilestone(m: MilestoneDto) {
            map.set(m.id, m);

            // Recursively add children
            if (m.subMilestones && m.subMilestones.length > 0) {
                m.subMilestones.forEach(child => addMilestone(child));
            }
        }

        milestones?.forEach(m => addMilestone(m));

        return map;
    }, [milestones]);

    const photoMap = useMemo(() => {
        const map = new Map<number, PhotoDto>();
        photos?.forEach(p => map.set(p.id, p));
        return map;
    }, [photos]);

    useEffect(() => {
        writePhotoCacheToLocalStorage({
            photos,
            lastFetchTs,
            isFresh: isPhotoCacheFresh,
        });
        writeMilestoneCacheToLocalStorage({
            milestones,
            isFresh: isMilestoneCacheFresh,
        });
    }, [photos, lastFetchTs, isPhotoCacheFresh, milestones, isMilestoneCacheFresh]);

    const fetchMilestonesFromServer = async (): Promise<MilestoneDto[]> => {
            const token = sessionStorage.getItem("jwt");
            if (!token) throw new Error("Unauthenticated: missing jwt");
    
            const res = await fetch(`${API_BASE}/milestones`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            if (!res.ok) {
                throw new Error(`Failed to fetch milestones: ${res.status} ${res.statusText}`);
            }
    
            const data: MilestoneDto[] = await res.json();
            return data;
        };
    
        const getMilestones = async (): Promise<MilestoneDto[] | null> => {
            if (milestones && isMilestoneCacheFresh) {
                return milestones;
            }

            if (inFlightMilestoneFetch.current) {
                return inFlightMilestoneFetch.current;
            }
    
            const p = (async () => {
                setLoadingMilestones(true);
                try {
                    const fetchedMilestones = await fetchMilestonesFromServer();
                    setMilestones(fetchedMilestones);
                    setIsMilestoneCacheFresh(true);
                    return fetchedMilestones;
                } catch (e: any) {
                    setErrorMilestones(e.message || "Unknown error while fetching milestones");
                    throw e;
                } finally {
                    setLoadingMilestones(false);
                    inFlightMilestoneFetch.current = null;
                }
            })();
    
            inFlightMilestoneFetch.current = p;
            return p;
        };
    
        const refreshMilestones = async (): Promise<MilestoneDto[]> => {
            setErrorMilestones(null);
            
            if (inFlightMilestoneFetch.current) {
                const res = await inFlightMilestoneFetch.current;
                if (res) return res;
            }
            inFlightMilestoneFetch.current = null;

            setLoadingMilestones(true);
            try {
                const freshMilestones = await fetchMilestonesFromServer();
                setMilestones(freshMilestones);
                setIsMilestoneCacheFresh(true);
                return freshMilestones;
            } catch (e: any) {
                setErrorMilestones(e.message || "Unknown error while refreshing milestones");
                throw e;
            } finally {
                setLoadingMilestones(false);
            }
        };
    
        const invalidateMilestones = () => {
            setIsMilestoneCacheFresh(false);
        };

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
            setErrorPhotos(null);
    
            if (photos && isPhotoCacheFresh && !isPhotoUrlExpired(lastFetchTs)) {
                return photos;
            }
    
            if (inFlightPhotoFetch.current) {
                return inFlightPhotoFetch.current;
            }
    
            const p = (async () => {
                setLoadingPhotos(true);
                try {
                    const fetchedPhotos = await fetchPhotosFromServer();
                    setPhotos(fetchedPhotos);
                    setLastFetchTs(Date.now());
                    setIsPhotoCacheFresh(true);
                    return fetchedPhotos;
                } catch (err: any) {
                    setErrorPhotos(err.message || "Unknown error");
                    throw err;
                } finally {
                    setLoadingPhotos(false);
                    inFlightPhotoFetch.current = null;
                }
            })();
    
            inFlightPhotoFetch.current = p;
            return p;
        };
    
        const refreshPhotos = async (): Promise<PhotoDto[]> => {
            setErrorPhotos(null);

            if (inFlightPhotoFetch.current) {
                const res = await inFlightPhotoFetch.current;
                if (res) return res;
            }
            inFlightPhotoFetch.current = null;
    
            setLoadingPhotos(true);
            try {
                const freshPhotos = await fetchPhotosFromServer();
                setPhotos(freshPhotos);
                setLastFetchTs(Date.now());
                setIsPhotoCacheFresh(true);
                return freshPhotos;
            } catch (err: any) {
                setErrorPhotos(err.message || "Unknown error");
                throw err;
            } finally {
                setLoadingPhotos(false);
            }
        };
    
        const invalidatePhotos = () => {
            setIsPhotoCacheFresh(false);
        };

        const value: PhotoMilestoneContextValue = {
            milestones,
            photos,
            loadingMilestones,
            loadingPhotos,
            errorMilestones,
            errorPhotos,
            photoMap,
            milestoneMap,
            getPhotos,
            refreshPhotos,
            invalidatePhotos,
            getMilestones,
            refreshMilestones,
            invalidateMilestones,
        };

        return (
            <PhotoMilestoneContext.Provider value={value}>
                {children}
            </PhotoMilestoneContext.Provider>
        );
}

export function usePhotoMilestone() {
    const ctx = useContext(PhotoMilestoneContext);
    if (!ctx) {
        throw new Error("usePhotoMilestone must be used within a PhotoMilestoneProvider");
    }
    return ctx;
}