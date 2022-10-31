import { useForm } from "../hooks/useForm";
import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ethers } from "ethers";
import { verify } from "../firebase";
import toast from "react-hot-toast";
import { isTablet, isMobile } from "react-device-detect";
import { useFaucetAvailablity } from "../hooks/useFaucetAvailablity";
import { Faucet } from "./faucet";
import { NETWORK, providerUrls } from "../utils";

export const Verification = ({
  targetAddress,
  setVerified,
  email,
  sendChainId = NETWORK.MATIC_MUMBAI,
}: {
  targetAddress: string;
  setVerified: React.Dispatch<React.SetStateAction<boolean>>;
  email: string;
  sendChainId?: NETWORK;
}) => {
  const metamaskDeeplink = `https://metamask.app.link/send/${targetAddress}@${sendChainId}?value=0`;

  const providerUrl = providerUrls[sendChainId];
  const [showFaucet, setShowFaucet] = useState(false);
  const [provider] = useState<ethers.providers.WebSocketProvider>(
    new ethers.providers.WebSocketProvider(providerUrl)
  );
  const [isTimeout, setIsTimeout] = useState(false);
  const [loading, setLoading] = useState(false);
  const faucetIsAvailable = useFaucetAvailablity();

  const verifyTxHash = useCallback(
    async (txHash: string) => {
      try {
        setLoading(true);
        const result = await verify({
          txHash,
          sendChainId,
        });
        console.log(result);
        if (result.data.ok) {
          setVerified(true);
          toast.success("対象NFTの保有が確認できました！");
        } else {
          if (result.data.error) {
            toast.error(result.data.error, { duration: 5000 });
          } else {
            throw new Error();
          }
        }
        setLoading(false);
      } catch (e) {
        console.log(e);
        setLoading(false);
        toast.error("システムエラーが発生しました。", { duration: 5000 });
      }
    },
    [sendChainId, setVerified]
  );

  const checkSendTx = useCallback(() => {
    if (!targetAddress || isTimeout) {
      return;
    }
    provider.off("pending");
    console.log("provider.on");
    provider.on("pending", (tx) => {
      // TODO: この方法だと無駄なrequest多過ぎる...
      console.log(tx);
      provider
        .getTransaction(tx)
        .then((transaction) => {
          if (transaction != null && transaction["to"] === targetAddress) {
            provider.off("pending");
            console.log(transaction);
            verifyTxHash(transaction.hash);
          }
        })
        .catch((e) => {
          console.log(e);
          provider.off("pending");
        });
    });
  }, [isTimeout, provider, targetAddress, verifyTxHash]);

  useEffect(() => {
    if (!targetAddress) {
      return;
    }

    checkSendTx();

    const timeoutId = setTimeout(() => {
      setIsTimeout(true);
      provider.off("pending");
    }, 1000 * 60 * 5);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [checkSendTx, provider, targetAddress, verifyTxHash]);

  const { handleChange, handleSubmit, data, errors } = useForm<{
    txHash: string;
  }>({
    validations: {
      txHash: {
        custom: {
          isValid: (value) => {
            return (
              value.startsWith("0x") &&
              value.length === 66 &&
              /^[a-f0-9x]{66}$/gi.test(value)
            );
          },
          message: "Transaction IDのフォーマットが正しくありません",
        },
      },
    },
    onError: () => {
      errors.txHash &&
        toast.error(errors.txHash, { position: "bottom-center" });
    },
    onSubmit: async () => {
      await verifyTxHash(data.txHash);
    },
  });

  return (
    <>
      {showFaucet && (
        <div className="modal  modal-open">
          <div className="modal-box">
            <label
              className="btn btn-circle absolute right-2 top-2 z-50"
              onClick={() => {
                setShowFaucet(false);
                checkSendTx();
              }}
            >
              ✕
            </label>
            <Faucet
              closeFaucet={() => {
                setShowFaucet(false);
                checkSendTx();
              }}
            />
          </div>
        </div>
      )}
      <form className="flex flex-col gap-y-2 mt-5" onSubmit={handleSubmit}>
        <div>{email}</div>
        <div className="text-sm my-5">
          {`以下のアドレス宛に${
            sendChainId === NETWORK.ETH_GOERLI
              ? "イーサリアムのテストネット(Görli Testnet)で0Eth"
              : "ポリゴンのテストネット(Mumbai Testnet)で0Matic"
          }を送金してください。`}
          {faucetIsAvailable && sendChainId === NETWORK.ETH_GOERLI && (
            <div
              className="link text-xs"
              onClick={() => {
                provider.off("pending");
                setShowFaucet(true);
              }}
            >
              テストネット(Görli
              Testnet)のETHを持っていない方はこちらから受け取ることができます。
            </div>
          )}
          {sendChainId === NETWORK.MATIC_MUMBAI && (
            <div className="link text-xs">
              <a
                href="https://mumbaifaucet.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                テストネット(Mumbai
                Testnet)のMaticを持っていない方はこちらから受け取ることができます。
              </a>
            </div>
          )}
        </div>

        <div
          className="flex flex-col gap-y-2"
          onClick={() => {
            navigator.clipboard.writeText(targetAddress || "");
            toast("コピーしました！", {
              icon: "📋",
              duration: 1000,
            });
            console.log("Copy!");
          }}
        >
          <input
            className="input input-bordered input-sm text-sm cursor-pointer"
            value={targetAddress}
            readOnly
          />
          <button className="btn btn-outline btn-xs" type="button">
            アドレスをコピー
          </button>
          <div className="text-xs">
            送金先アドレスの有効期間は5分間です。5分以上経過してしまった場合は画面をリロードして申し込み画面からやり直してください。
          </div>
        </div>

        <div className="mt-4">
          {isTablet || isMobile ? (
            <a
              href={metamaskDeeplink}
              target="_blank"
              rel="noopener noreferrer"
            >
              MetaMaskアプリを開く
            </a>
          ) : (
            <>
              <p className="text-sm">
                MetaMaskアプリをダウンロード済みの場合はスマホのカメラでQRコードを読み取ってください。
              </p>
              <div className="flex justify-center">
                <div>
                  <QRCodeSVG
                    value={metamaskDeeplink}
                    height={200}
                    width={200}
                  />
                  <div className="text-xs pt-2">MetaMaskアプリが開きます。</div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="mt-10 form-control w-full">
          <label className="label">
            <span className="label-text">
              送金したTransactionのId(Hash)を入力してください。
            </span>
          </label>
          <input
            className="input input-bordered w-full"
            placeholder="0x0000000000000000000000000000000000000000000000000000000000000000"
            value={data.txHash || ""}
            onChange={handleChange("txHash")}
            required
          />
          <button
            type="submit"
            className={`btn w-full btn-primary mt-4 ${loading && "loading"}`}
          >
            確認する
          </button>
        </div>
      </form>
    </>
  );
};
