import { BigNumber } from "ethers";
import { initializeApp } from "firebase/app";
import {
  connectFirestoreEmulator,
  Firestore,
  getFirestore,
} from "firebase/firestore";
import {
  connectFunctionsEmulator,
  Functions,
  getFunctions,
  httpsCallable,
} from "firebase/functions";
import { NETWORK } from "./utils";

const firebaseConfig = {
  apiKey: "AIzaSyARCvNaBWvK-oLYgTRqEQkgdgPBUtwxk4Q",
  authDomain: "nft-ownership-verification.firebaseapp.com",
  projectId: "nft-ownership-verification",
  storageBucket: "nft-ownership-verification.appspot.com",
  messagingSenderId: "754896055347",
  appId: "1:754896055347:web:f2a9595f9265a1d4b3c746",
  measurementId: "G-G86EH8K673",
};

const isEmulating = window.location.hostname === "localhost";

let db: Firestore;
let functions: Functions;
const app = initializeApp(firebaseConfig);

if (isEmulating && false) {
  db = getFirestore();
  connectFirestoreEmulator(db, "localhost", 8080);

  functions = getFunctions();
  connectFunctionsEmulator(functions, "localhost", 5001);
} else {
  db = getFirestore(app);
  functions = getFunctions(app);
}

export const submit = httpsCallable<
  { eventId: string; email: string },
  { targetAddress: string }
>(functions, "submit");

export const verify = httpsCallable<
  { txHash: string; sendChainId: NETWORK },
  { ok?: boolean; error?: string }
>(functions, "verify");

export const faucetAvailability = httpsCallable<{}, boolean>(
  functions,
  "faucetAvailability"
);

export const faucet = httpsCallable<
  { address: string },
  { ok?: boolean; txHash?: string; faucetAmount: BigNumber; error?: string }
>(functions, "faucet");

export { db };
