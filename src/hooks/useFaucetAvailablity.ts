import { useEffect, useState } from "react";
import { faucetAvailability } from "../firebase";
const FAUCET_USED_KEY = "faucet_used_key";

export const useFaucetAvailablity = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  useEffect(() => {
    const checkAvailability = async () => {
      const response = await faucetAvailability({});
      setIsAvailable(response.data);
    };

    if (localStorage.getItem(FAUCET_USED_KEY)) {
      setIsAvailable(false);
    } else {
      checkAvailability();
    }
  }, []);

  return isAvailable;
};
