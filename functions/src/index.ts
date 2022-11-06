import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { Alchemy, Network } from "alchemy-sdk";
import { ethers } from "ethers";
admin.initializeApp();
const db = admin.firestore();
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const SUBMISSIONS = "submissions";
const EVENTS = "events";
const FAUCETS = "faucets";
const VERIFIED_USERS = "verifiedUsers";
const PROVIDER_URL = process.env.ALCHEMY_PROVIDER_URL;

const networks = {
  1: Network.ETH_MAINNET,
  5: Network.ETH_GOERLI,
  137: Network.MATIC_MAINNET,
  80001: Network.MATIC_MUMBAI,
};
type ChainId = keyof typeof networks;
type Submission = {
  eventId: string;
  email: string;
  userId: string;
  createdAt: Timestamp;
};
type Event = {
  name: string;
  description: string;
  sendChainId: ChainId;
  nftAddress: string;
  nftChainId: ChainId;
  isTest: boolean;
};

export const submit = functions.https.onCall(
  async (data: { eventId: string; email: string }) => {
    const wallet = ethers.Wallet.createRandom();
    const createdAt = Timestamp.fromDate(new Date());

    await db.collection(SUBMISSIONS).doc(wallet.address).set({
      eventId: data.eventId,
      email: data.email,
      createdAt,
    });
    return { targetAddress: wallet.address };
  }
);

export const verify = functions.https.onCall(
  async (data: { txHash: string; sendChainId: ChainId }) => {
    const alchemyGoerli = new Alchemy({
      apiKey: ALCHEMY_API_KEY,
      network: networks[data.sendChainId],
    });

    // TODO: pending状態のtxの場合は自分でsignatureの確認必要になる？
    const tx = await alchemyGoerli.core.getTransaction(data.txHash);
    if (!tx || !tx.to) {
      return { error: "データが見つかりませんでした。" };
    }

    const submissionDoc = await db.collection(SUBMISSIONS).doc(tx.to).get();
    const submission = submissionDoc.data() as Submission | undefined;

    if (!submission) {
      return { error: "データが見つかりませんでした。" };
    }
    const timeoutDuration = 5 * 60 * 1000; // 5 minutes
    if (
      new Date().getTime() - submission.createdAt.toMillis() >
      timeoutDuration
    ) {
      return {
        error: "再度申し込みページからやり直してください。(有効期限エラー)",
      };
    }

    const eventDoc = await db.collection(EVENTS).doc(submission.eventId).get();
    const event = eventDoc.data() as Event | undefined;
    if (!event) {
      return { error: "データが見つかりませんでした。" };
    }

    if (event.sendChainId !== data.sendChainId) {
      // client側で書き換えることはできるので。
      return { error: "システムエラーが発生しました。" };
    }

    if (event.isTest) {
      // 保有確認をskip
      await db
        .collection(VERIFIED_USERS)
        .doc(`${submission.eventId}-${tx.from}`)
        .set(submission);
      // verified
      return { ok: true };
    }

    const alchemy = new Alchemy({
      apiKey: ALCHEMY_API_KEY,
      network: networks[event.nftChainId],
    });

    const resNFTs = await alchemy.nft.getNftsForOwner(tx.from, {
      contractAddresses: [event.nftAddress],
      omitMetadata: true,
    });

    const totalCount = resNFTs.totalCount;
    console.log(totalCount);

    if (totalCount > 0) {
      await db
        .collection(VERIFIED_USERS)
        .doc(`${submission.eventId}-${tx.from}`)
        .set(submission);
      // verified
      return { ok: true };
    } else {
      return { error: "対象NFTの保有を確認できませんでした。" };
    }
  }
);

export const faucetAvailability = functions.https.onCall(() => {
  const isAvailable = process.env.FAUCET_AVAILABILITY === "true";
  return isAvailable;
});

// const MAX_FAUCET_AMOUNT = "0.005";
// const getGasPrice = async () => {
//   const alchemyGoerli = new Alchemy({
//     apiKey: ALCHEMY_API_KEY,
//     network: Network.ETH_GOERLI,
//   });
//   const gasPrice = await alchemyGoerli.core.getGasPrice();
//   return gasPrice;
// };

export const faucet = functions.https.onCall(
  async (data: { address: string }, context) => {
    // emulatorだとundefinedになる。
    const ipAddress = context.rawRequest.ip || "localhost";
    const faucetIpDoc = await db.collection(FAUCETS).doc("ipAddress").get();
    if (faucetIpDoc.exists) {
      return { error: "利用制限中です。" };
    }

    const faucetAddressDoc = await db
      .collection(FAUCETS)
      .doc(data.address)
      .get();
    if (faucetAddressDoc.exists) {
      return { error: "利用制限中です。" };
    }

    // 適切なガス代取れてない気がする...
    // const faucetAmount = (await getGasPrice()).mul(
    //   ethers.BigNumber.from(21000 * 2)
    // );
    // if (faucetAmount.gt(ethers.utils.parseEther(MAX_FAUCET_AMOUNT))) {
    //   return { error: "ガス代高騰中のため利用を制限しています。" };
    // }
    // とりあえず固定で
    const faucetAmount = ethers.utils.parseEther("0.002");

    const walletSigner = new ethers.Wallet(
      process.env.PRIVATE_KEY as string,
      ethers.getDefaultProvider(PROVIDER_URL)
    );

    const tx = {
      to: data.address,
      value: faucetAmount,
    };

    const txReceipt = await walletSigner.sendTransaction(tx);

    const faucetAddressPromise = db
      .collection(FAUCETS)
      .doc(data.address)
      .set({
        updatedAt: Timestamp.fromDate(new Date()),
      });

    const faucetIpPromise = db
      .collection(FAUCETS)
      .doc(ipAddress)
      .set({
        updatedAt: Timestamp.fromDate(new Date()),
      });

    await Promise.all([faucetAddressPromise, faucetIpPromise]);

    return { ok: true, txHash: txReceipt.hash, faucetAmount };
  }
);
