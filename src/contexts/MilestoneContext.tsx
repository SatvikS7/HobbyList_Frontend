import React, { createContext, useContext, useEffect, useState, useRef, type ReactNode} from "react";

const API_BASE = import.meta.env.VITE_BACKEND_BASE;

// ---------- Types ----------
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

type MilestoneContextValue = {
    milestones: MilestoneDto[] | null;
    loading: boolean;
    error: string | null;
    getMilestones: () => Promise<MilestoneDto[] | null>;
    refreshMilestones: () => Promise<MilestoneDto[]>;
    invalidateMilestones: () => void;
};

const MilestoneContext = createContext<MilestoneContextValue | undefined>(undefined);

// ---------- Local storage keys & constants ----------
const LS_KEY = "hobbylist_milestone_cache_v1";

// ---------- Helpers ----------
function readCacheFromLocalStorage(): MilestoneCacheShape {
    try {
        const raw = localStorage.getItem(LS_KEY);
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
        localStorage.removeItem(LS_KEY);
        return { milestones: null, isFresh: false };
    }
}

function writeCacheToLocalStorage(cache: MilestoneCacheShape) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(cache));
    } catch (e) {
        console.warn("Failed to write milestone cache to localStorage", e);
    }
}

// ---------- Provider ----------
export const MilestoneProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const initialCache = readCacheFromLocalStorage();

    const [milestones, setMilestones] = useState<MilestoneDto[] | null>(initialCache.milestones);
    const [isFresh, setIsFresh] = useState<boolean>(
        initialCache.isFresh
    );

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const inFlightFetch = useRef<Promise<MilestoneDto[] | null> | null>(null);

    useEffect(() => {
        writeCacheToLocalStorage({
        milestones,
        isFresh,
        });
    }, [milestones, isFresh]);

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
        if (milestones && isFresh) {
            return milestones;
        }

        if (inFlightFetch.current) {
            return inFlightFetch.current;
        }

        const p = (async () => {
            setLoading(true);
            try {
                const fetchedMilestones = await fetchMilestonesFromServer();
                setMilestones(fetchedMilestones);
                setIsFresh(true);
                return fetchedMilestones;
            } catch (e: any) {
                setError(e.message || "Unknown error while fetching milestones");
                throw e;
            } finally {
                setLoading(false);
                inFlightFetch.current = null;
            }
        })();

        inFlightFetch.current = p;
        return p;
    };

    const refreshMilestones = async (): Promise<MilestoneDto[]> => {
        setError(null);
        
        if (inFlightFetch.current) {
            const res = await inFlightFetch.current;
            if (res) return res;
        }
        inFlightFetch.current = null;

        setLoading(true);
        try {
            const freshMilestones = await fetchMilestonesFromServer();
            setMilestones(freshMilestones);
            setIsFresh(true);
            return freshMilestones;
        } catch (e: any) {
            setError(e.message || "Unknown error while refreshing milestones");
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const invalidateMilestones = () => {
        setIsFresh(false);
    };

    const value: MilestoneContextValue = {
        milestones,
        loading,
        error,
        getMilestones,
        refreshMilestones,
        invalidateMilestones
    }

    return (
        <MilestoneContext.Provider value={value}>
            {children}
        </MilestoneContext.Provider>
    );
};

export const useMilestones = () => {
    const ctx = useContext(MilestoneContext);
    if (!ctx) {
        throw new Error("useMilestones must be used within a MilestoneProvider");
    }
    return ctx;
};