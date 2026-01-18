import { create } from "zustand";

type UiState = {
    isKakaoOpen: boolean;
    setKakaoOpen: (v: boolean) => void;
};

export const uiStore = create<UiState>((set) => ({
    isKakaoOpen: false,
    setKakaoOpen: (v) => set({ isKakaoOpen: v }),
}));
