export const Introduction = () => {
  return (
    <div className="w-96 container mx-auto my-8 px-4 prose">
      <h1>Safe NFT Ownership Verification(SNOV)</h1>
      <h2>NFTにオフチェーンでのユーティリティを付与したい</h2>
      <p>
        今後、マスアダプションに向けて、特定のNFT保有者に対してオフチェーンでのユーティリティを付与したいというケースが増えてくるかと思います。
      </p>
      <h2>保有確認の方法は？</h2>
      <p>その際に、NFTの保有確認をどのように行うかという問題があります。</p>
      <h2>Metamaskに接続して署名</h2>
      <p>
        現状では、MetaMaskやWalletConnectを通して署名することでAddressの保有を確認することが一般的です。
      </p>
      <h2>ハッキング!</h2>
      <p>
        この方法の問題点として、MetaMaskで表示される要求に対して内容を理解せずに承認してしまい、資産を盗まれてしまう被害が頻発しています。
      </p>
      <h2>Wallet接続を求められることに慣れすぎてしまっていない？</h2>
      <p>
        Wallet接続という行為は、秘密鍵を使った特定の操作権限をワンクリックで与えることができるようになるというとても危険な行為です。
        本来カジュアルに受け入れて良いものではありません。
      </p>
      <h2>Bad UX</h2>
      <p>
        セキュリティも含めてなのですが、UXの悪さも重要な問題です。
        現状のWallet接続の仕組みはモバイル環境を考慮できていないので、スマホのみで完結させようとした場合のUXが厳しいです。
      </p>
      <h2>Wallet接続なしのAddress認証</h2>
      <p>
        そこで、Wallet接続なしでのAddress認証の方法を考えました。
        ランダム生成した送金先Addressをそのユーザーしか知らない秘密の情報として利用し、送金先Addressを渡したユーザーをそこに送金したAddressの保有者として認証します。
      </p>
      <div className="pt-4">
        詳細については
        <a
          href="https://github.com/enu-kuro/safe-nft-ownership-verification"
          target="_blank"
          rel="noopener noreferrer"
        >
          Githubのリポジトリ
        </a>
        をご参照ください。
      </div>
      <hr />
      <h2>デモサイトについて</h2>
      <p>
        自社の会員データベースを持っているサービスが、特定のNFT保有者に対して特典を提供する場合を想定してデモを作成しました。
        <br />
        利用企業にとってはNFT保有確認SaaSのようなイメージです。
        <br />
        利用企業はユーザーに申し込みページへのリンクを共有します。
        <br />
        ユーザーはそのページからNFT保有特典の申し込みをします。
      </p>
      <ul className="list-disc">
        <li className="">
          <div>
            ENS保有者に対して空港VIPラウンジの利用特典を提供するケースを想定した申し込みフォームです。
            <br />
            <div className="text-sm">
              指定されたAddress宛にイーサリアムのテストネット(Görli
              Testnet)で0Ethを送金することで保有確認が完了します。
            </div>
          </div>
          <a
            href="https://nft-ownership-verification.web.app/?eventId=kcqmHHpbnr7L9oZCxfEm"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://nft-ownership-verification.web.app/?eventId=kcqmHHpbnr7L9oZCxfEm
          </a>
        </li>

        <li className="">
          <div>
            テスト用にNFTの保有は確認せずに送金元が確認できれば完了する申し込みフォームです。
            <div className="text-sm">
              指定されたAddress宛にポリゴンのテストネット(Polygon
              Mumbai)で0Maticを送金することで確認が完了します。
            </div>
          </div>
          <a
            href="https://nft-ownership-verification.web.app/?eventId=aNCc9Gml1IibIp5olxHj"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://nft-ownership-verification.web.app/?eventId=aNCc9Gml1IibIp5olxHj
          </a>
        </li>
      </ul>
    </div>
  );
};
