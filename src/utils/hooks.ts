import { useEffect, useState } from "react";

// Custom hook that manages a local storage item that determines if the user has gone above their limit for the hour of a certain action.
type StorageData = {
  time: string;
  ticks: number;
};

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
      setValid(data.ticks >= limit);
    } else {
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
    console.log(itemName, data);
    localStorage.setItem(
      itemName,
      JSON.stringify({
        ...data,
        ticks: data.ticks + 1,
      })
    );
  };

  return [valid, ticked];
};

export { useLimit };
