import React, { 
    createContext, 
    useContext, 
    useEffect, 
    useState, 
    useRef, 
    type ReactNode, 
    useMemo 
} from "react";

import { useAuth } from "../contexts/AuthContext";
import { type MilestoneDto, type PhotoDto } from "../types";
import { photoService } from "../services/photoService";
import { milestoneService } from "../services/milestoneService";

type MilestoneCacheShape = {
    milestones: MilestoneDto[] | null;
    isFresh: boolean; // true => cache is fresh
}

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

// ---------- Helpers ----------
function readPhotoCacheFromLocalStorage(photo_key: string): PhotoCacheShape {
    try {
        const raw = localStorage.getItem(photo_key);
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
        localStorage.removeItem(photo_key);
        return { photos: null, lastFetchTs: null, isFresh: false };
    }  
}

function writePhotoCacheToLocalStorage(photo_key: string, cache: PhotoCacheShape) {
    try {
        localStorage.setItem(photo_key, JSON.stringify(cache));
    } catch (e) {
        console.warn("Failed to write photo cache to localStorage", e);
    }
}

function isPhotoUrlExpired(lastFetchTs: number | null, photo_ttl: number) {
    if (!lastFetchTs) return true;
    return Date.now() - lastFetchTs > photo_ttl;
}

function readMilestoneCacheFromLocalStorage(milestone_key: string): MilestoneCacheShape {
    try {
        const raw = localStorage.getItem(milestone_key);
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
        localStorage.removeItem(milestone_key);
        return { milestones: null, isFresh: false };
    }
}

function writeMilestoneCacheToLocalStorage(milestone_key: string, cache: MilestoneCacheShape) {
    try {
        localStorage.setItem(milestone_key, JSON.stringify(cache));
    } catch (e) {
        console.warn("Failed to write milestone cache to localStorage", e);
    }   
}

const PhotoMilestoneContext = createContext<PhotoMilestoneContextValue | undefined>(undefined);

// ---------- Provider ----------
export const PhotoMilestoneProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // ---------- Local storage keys & constants ----------
    const { userId } = useAuth();

    const PHOTO_URL_TTL_MS = 5 * 60 * 1000; 

    const PHOTO_LS_KEY = useMemo(() => {
        return `hobbylist_photo_cache_v1_${userId ?? "guest"}`;
    }, [userId]);

    const MILESTONE_LS_KEY = useMemo(() => {
        return `hobbylist_milestone_cache_v1_${userId ?? "guest"}`;
    }, [userId]);

    const initialPhotoCache = useMemo(() => readPhotoCacheFromLocalStorage(PHOTO_LS_KEY), [PHOTO_LS_KEY]);
    const initialMilestoneCache = useMemo(() => readMilestoneCacheFromLocalStorage(MILESTONE_LS_KEY), [MILESTONE_LS_KEY]);
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

    useEffect(() => {
        // reset local state when user changes
        const newPhotoCache = readPhotoCacheFromLocalStorage(PHOTO_LS_KEY);
        const newMilestoneCache = readMilestoneCacheFromLocalStorage(MILESTONE_LS_KEY);

        setPhotos(newPhotoCache.photos);
        setLastFetchTs(newPhotoCache.lastFetchTs);
        setIsPhotoCacheFresh(newPhotoCache.isFresh);

        setMilestones(newMilestoneCache.milestones);
        setIsMilestoneCacheFresh(newMilestoneCache.isFresh);

        // clear in-flight operations
        inFlightPhotoFetch.current = null;
        inFlightMilestoneFetch.current = null;

    }, [PHOTO_LS_KEY, MILESTONE_LS_KEY]);

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
        writePhotoCacheToLocalStorage(PHOTO_LS_KEY, {
            photos,
            lastFetchTs,
            isFresh: isPhotoCacheFresh,
        });
        writeMilestoneCacheToLocalStorage(MILESTONE_LS_KEY, {
            milestones,
            isFresh: isMilestoneCacheFresh,
        });
    }, [PHOTO_LS_KEY, MILESTONE_LS_KEY, photos, lastFetchTs, isPhotoCacheFresh, milestones, isMilestoneCacheFresh]);

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
                    const fetchedMilestones = await milestoneService.getMilestones();
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
                const freshMilestones = await milestoneService.getMilestones();
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
    
        const getPhotos = async (): Promise<PhotoDto[] | null> => {
            setErrorPhotos(null);
    
            if (photos && isPhotoCacheFresh && !isPhotoUrlExpired(lastFetchTs, PHOTO_URL_TTL_MS)) {
                return photos;
            }
    
            if (inFlightPhotoFetch.current) {
                return inFlightPhotoFetch.current;
            }
    
            const p = (async () => {
                setLoadingPhotos(true);
                try {
                    const fetchedPhotos = await photoService.getPhotos();
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
                const freshPhotos = await photoService.getPhotos();
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