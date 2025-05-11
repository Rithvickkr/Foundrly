import { atom } from 'recoil';

export const themeAtom = atom<'light' | 'dark' | 'black'>({
  key: 'themeAtom',
  default: 'light', // Default theme
});