import { getCookie } from "cookies-next";
import { type Session } from "next-auth";
import { useEffect, useState } from "react";
import type { UserPokemon } from "./types";
import { useGuestStore } from "~/store/GuestStore";
import { useSession } from "next-auth/react";

type StorageData = {
  time: string;
  ticks: number;
};

// Custom hook that manages a local storage item that determines if the user has gone above their limit for the hour of a certain action.
const useLimit = (
  userName: string,
  valueName: string,
  limit: number
): [boolean, () => void] => {
  const itemName = userName + valueName;
  const [valid, setValid] = useState(true);

  const getFromLocalStorage = (key: string) => {
    if (!key || typeof window === "undefined") {
      return "";
    }
    return localStorage.getItem(key);
  };

  const checkValid = () => {
    const data = JSON.parse(
      getFromLocalStorage(itemName) || "{}"
    ) as StorageData;

    const checkDate = new Date();
    const checkTime = `${checkDate.getMonth()}${checkDate.getDate()}${checkDate.getHours()}`;

    if (data.time === checkTime) {
      setValid(data.ticks < limit);
    } else {
      setValid(true);
      data.time = checkTime;
      data.ticks = 0;
    }

    return data;
  };

  useEffect(() => {
    if (getFromLocalStorage(itemName) == null) {
      localStorage.setItem(
        itemName,
        JSON.stringify({
          time: "",
          ticks: 0,
        })
      );
    } else {
      void checkValid();
    }
  }, []);

  const ticked = () => {
    const data = checkValid();

    data.ticks += 1;

    localStorage.setItem(itemName, JSON.stringify(data));
  };

  return [valid, ticked];
};

const defaultUserPokemon = { id: 0, name: "", profileImage: "" };

const useUserPokemon = (): UserPokemon => {
  const session = useSession();
  const [userPokemon, setUserPokemon] =
    useState<UserPokemon>(defaultUserPokemon);
  const { guestPokemon } = useGuestStore();

  if (guestPokemon != null && userPokemon.id != guestPokemon.id) {
    console.log("fucking fuck");

    setUserPokemon(guestPokemon);
  }

  if (session.data != null && userPokemon.id != session.data.user.pokemonId) {
    setUserPokemon({
      id: session.data.user.pokemonId,
      name: session.data.user.pokemonName,
      profileImage: session.data.user.profileImage,
    });
  }

  return userPokemon;
};

async function getServerSideUserPokemon(
  sessionData: Session | null
): Promise<UserPokemon> {
  if (sessionData != null) {
    return {
      id: sessionData.user.pokemonId,
      name: sessionData.user.pokemonName,
      profileImage: sessionData.user.profileImage,
    };
  }

  const guestCookie = getCookie("guest-pokemon");
  if (guestCookie != null) {
    const guestPokemon = await JSON.parse(guestCookie);

    return guestPokemon;
  }

  return { id: 0, name: "", profileImage: "" };
}

export { useLimit, useUserPokemon, getServerSideUserPokemon };
