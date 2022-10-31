import { useForm } from "../hooks/useForm";
import toast from "react-hot-toast";
import { faucet } from "../firebase";
import { useState } from "react";
import { ethers } from "ethers";
import { NETWORK, providerUrls } from "../utils";

const FAUCET_USED_KEY = "faucet_used_key";
// Goerli専用
export const Faucet = ({ closeFaucet }: { closeFaucet: () => void }) => {
  const [loading, setLoading] = useState(false);
  const providerUrl = providerUrls[NETWORK.ETH_GOERLI];
  const { handleChange, handleSubmit, data, errors } = useForm<{
    address: string;
  }>({
    validations: {
      address: {
        custom: {
          isValid: (value) => {
            return (
              value.endsWith(".eth") ||
              (value.startsWith("0x") &&
                value.length === 42 &&
                /^[a-f0-9x]{42}$/gi.test(value))
            );
          },
          message: "アドレスのフォーマットが正しくありません",
        },
      },
    },
    onError: () => {
      errors.address && toast.error(errors.address);
    },
    onSubmit: async () => {
      setLoading(true);

      let address = data.address;
      if (address.endsWith(".eth")) {
        const provider = ethers.getDefaultProvider("homestead");
        const _address = await provider.resolveName(address);
        if (!_address) {
          toast.error("無効なアドレスです。");
          setLoading(false);
          return;
        }
        address = _address;
      }

      try {
        const result = await faucet({ address: address });
        if (!result.data.ok) {
          if (result.data.error) {
            toast.error(result.data.error);
            setLoading(false);
            return;
          } else {
            throw new Error();
          }
        }
        if (!result.data.txHash) {
          return new Error();
        }

        const toastId = toast.loading(
          "送金が完了するまでもうしばらくお待ちください。"
        );

        const provider = new ethers.providers.WebSocketProvider(providerUrl);
        provider.once(result.data.txHash, (transaction) => {
          console.log(transaction);
          setLoading(false);
          toast.success("送金が完了しました！", {
            id: toastId,
          });
          localStorage.setItem(FAUCET_USED_KEY, "使ったよ");
          closeFaucet();
        });
      } catch (e) {
        console.log(e);
        toast.error("エラーが発生しました。");
        setLoading(false);
      }
    },
  });

  return (
    <form className="flex flex-col gap-y-2" onSubmit={handleSubmit}>
      <h3 className="font-bold text-xl">ガス代支払い用</h3>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">
            受け取り先のイーサリアムのアドレスを入力してください。
          </span>
        </label>
        <input
          className="input input-bordered w-full"
          placeholder="0x0123456789..."
          value={data.address || ""}
          onChange={handleChange("address")}
          required
        />
        <button
          type="submit"
          className={`btn w-full btn-primary mt-4 ${loading && "loading"}`}
        >
          Goelri ETHを受け取る
        </button>
      </div>
    </form>
  );
};
