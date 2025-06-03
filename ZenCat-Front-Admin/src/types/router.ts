import { User } from './user';

export interface RouterContext {
  auth: {
    getCurrentUser: () => Promise<User | null>;
  };
} 