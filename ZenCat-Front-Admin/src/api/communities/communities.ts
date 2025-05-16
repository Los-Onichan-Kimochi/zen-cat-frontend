import { Community } from '@/types/community';
import { dummyCommunities } from '@/data/dummy-communities'; // :v dummy data

// TODO: Add a real API call XD
export const communitiesApi = {
  getComunityCounts: (): Promise<number> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dummyCommunities.length); // Resolve with calculated counts
      }, 500);
    });
  },
  
  getCommunities: (): Promise<Community[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dummyCommunities);
      }, 700); // XDXDXD
    });
  },
}; 