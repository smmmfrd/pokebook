import { useCallback, useEffect, useState } from "react";
import type { UserPokemon } from "./types";
import type { PreviewData, GetServerSidePropsContext } from "next";
import type { Session } from "next-auth";
import type { ParsedUrlQuery } from "querystring";

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

  const checkValid = useCallback(() => {
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
  }, [itemName, limit]);

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
  }, [checkValid, itemName]);

  const ticked = () => {
    const data = checkValid();

    data.ticks += 1;

    localStorage.setItem(itemName, JSON.stringify(data));
  };

  return [valid, ticked];
};

async function getServerSideUserPokemon(
  session: Session | null,
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
): Promise<UserPokemon> {
  if (ctx != null) {
    const guestCookie = ctx.req.cookies["guest-pokemon"];
    if (guestCookie != null) {
      const guestPokemon = (await JSON.parse(guestCookie)) as UserPokemon;

      return guestPokemon;
    }
  }

  if (session != null && session.user != null) {
    return {
      id: session.user.pokemonId,
      name: session.user.pokemonName,
      profileImage: session.user.profileImage,
    };
  }

  return { id: 0, name: "", profileImage: "" };
}

export { useLimit, getServerSideUserPokemon };
