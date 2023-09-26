import { deleteCookie } from "cookies-next";
import { create } from "zustand";

type GuestPokemon = {
  id: number;
  name: string;
  profileImage: string;
};

interface GuestState {
  guestPokemon: GuestPokemon | null;
}

interface GuestActions {
  setGuestPokemon: (poke: GuestPokemon) => void;
  removeGuestPokemon: () => void;
}

export const useGuestStore = create<GuestState & GuestActions>((set) => ({
  guestPokemon: null,
  setGuestPokemon(poke) {
    set(() => ({
      guestPokemon: poke,
    }));
  },
  removeGuestPokemon() {
    set(() => {
      deleteCookie("guest-pokemon");
      return {
        guestPokemon: null,
      };
    });
  },
}));
