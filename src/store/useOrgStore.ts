import { create } from "zustand";

interface OrgState {
  activeOrgId: string | null;
  activeOrgSlug: string | null;
  setActiveOrg: (id: string, slug: string) => void;
  clearActiveOrg: () => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  activeOrgId: null,
  activeOrgSlug: null,
  setActiveOrg: (id, slug) => set({ activeOrgId: id, activeOrgSlug: slug }),
  clearActiveOrg: () => set({ activeOrgId: null, activeOrgSlug: null }),
}));
