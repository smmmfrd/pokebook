import { getCookie } from "cookies-next";
import { type Session } from "next-auth";
import { useEffect, useState } from "react";

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

const useUserPokemon = (sessionData: Session | null): UserPokemon => {
  const [guestPokemon, setGuestPokemon] = useState<UserPokemon | null>(null);

  useEffect(() => {
    async function getGuest() {
      const guestCookie = getCookie("guest-pokemon");
      if (guestCookie != null) {
        const guestData = await JSON.parse(guestCookie);
        setGuestPokemon(guestData);
      }
    }

    getGuest();
  }, []);

  if (sessionData != null) {
    return {
      id: sessionData.user.pokemonId,
      name: sessionData.user.pokemonName,
      profileImage: sessionData.user.profileImage,
    };
  }

  if (guestPokemon != null) {
    return guestPokemon;
  }

  return { id: 0, name: "", profileImage: "" };
};

type UserPokemon = {
  id: number;
  name: string;
  profileImage: string;
};

export { useLimit, useUserPokemon };
