export interface MilestoneDto {
  id: number;
  task: string;
  dueDate: string;
  completed: boolean;
  parentId: number | null;
  subMilestones: MilestoneDto[];
  taggedPhotoIds: number[];
  hobbyTag: string | null;
  completionRate: number;
}

export interface CreateMilestoneRequest {
  task: string;
  dueDate: string;
  completed: boolean;
  parentId?: number | null;
  taggedPhotoIds?: number[];
}

export interface PhotoDto {
  id: number;
  topic: string;
  imageUrl: string;
  description: string;
  uploadDate: string;
  taggedMilestoneIds: number[];
}

export interface ProfileDto {
  id: number;
  profileURL: string | null;
  description: string;
  displayName: string;
  isPrivate: boolean;
  hobbies: string[];
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollowRequested: boolean;
  Milestones: MilestoneDto[];
  Photos: PhotoDto[];
}

export interface AuthResponse {
  token: string;
  newAccount: boolean;
}
