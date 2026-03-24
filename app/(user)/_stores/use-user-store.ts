import { create } from "zustand";
import { User } from "../types";

interface UserState {
  users: User[];
  loading: boolean;
  fetching: boolean;
  selectedDeleteData: string[];
  setUsers: (users: User[]) => void;
  updateUser: (id: string, updatedData: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setFetching: (fetching: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: true,
  fetching: false,
  selectedDeleteData: [],
  setUsers: (users) => set({ users }),
  updateUser: (id, updatedData) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...updatedData } : user
      ),
    })),
  setLoading: (loading) => set({ loading }),
  setFetching: (fetching) => set({ fetching }),
}));
