import { useForm } from "../hooks/useForm";
import { submit } from "../firebase";
import { useState } from "react";
import { NETWORK } from "../utils";
interface User {
  email: string;
}

export const Submission = ({
  eventId,
  setTargetAddress,
  setEmail,
  sendChainId = NETWORK.MATIC_MUMBAI,
}: {
  eventId: string;
  sendChainId?: NETWORK;
  setTargetAddress: React.Dispatch<React.SetStateAction<string>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [loading, setLoading] = useState(false);
  const {
    handleSubmit,
    handleChange,
    data: user,
  } = useForm<User>({
    onSubmit: async () => {
      setLoading(true);
      try {
        const result = await submit({
          eventId,
          email: user.email,
        });
        const targetAddress = result.data.targetAddress;
        if (!result.data.targetAddress) {
          throw new Error();
        } else {
          setTargetAddress(targetAddress);
          setEmail(user.email);
        }
      } catch (e) {
        // TODO: error
        setLoading(false);
      }
    },
  });

  return (
    <form className="flex flex-col gap-y-2" onSubmit={handleSubmit}>
      <div className="mt-5">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">メールアドレス</span>
            {/* <span className="label-text-alt text-red-500">必須</span> */}
          </label>
          <input
            className="input input-bordered w-full"
            placeholder="you@example.com"
            type="email"
            value={user.email || ""}
            onChange={handleChange("email")}
            required
          />
          <label className="label">
            <span className="label-text-alt">
              サービス登録に利用したメールアドレスを入力してください。
            </span>
          </label>
        </div>

        <p className="text-sm">
          次の画面で表示されたアドレス宛に
          {`${
            sendChainId === NETWORK.MATIC_MUMBAI
              ? "ポリゴンのテストネット(Polygon Mumbai)で0Matic"
              : "イーサリアムのテストネット(Görli Testnet)で0Eth"
          }`}
          を送金していただくことでお申し込み完了となります。
          {/* <br />
            送金先アドレスの有効期間は10分間です。10分以上経過してしまった場合は再度この画面からやり直してください。 */}
        </p>
        <div className="mt-6 text-center">
          <button
            type="submit"
            className={`btn btn-wide btn-primary ${loading && "loading"}`}
          >
            申し込む
          </button>
        </div>
      </div>
    </form>
  );
};
