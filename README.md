# Safe NFT Ownership Verification (SNOV)


 長くて読めないよという方は
        <a
          href="https://nft-ownership-verification.web.app/introduction"
          target="_blank"
          rel="noopener noreferrer"
        >
          こちら
        </a>
からどうぞ。 

## Problem

現状のweb3ではWallet接続した後に意図しない挙動の許可をしてしまうことによるハッキング被害が多発しています。
Wallet側での表示方法等の改善も進んでいますが被害がなくなる様子はありません。

web3の外の世界で、もしワンクリックで銀行の資産が全て抜かれてしまうような設計があったとしたら、ユーザー側に落ち度があったとしてもサービス側の責任が問われることになるでしょう。

今後、マスアダプションを目指していく中で、web2サービス経由でNFTを保有するだけで、dappsを触ることはほとんどないというようなユーザーも増えてくるはずです。

そのようなユーザーに対してweb3の学習コストを負担してもらいながら自己責任を求めることはマスアダプションの妨げになります。
Wallet接続&操作の許可という仕様は意図しない承認をしてしまった場合の被害が大き過ぎるため、本来カジュアルに要求すべきものではありません。

そこで、Wallet接続なしにNFTの保有を確認する方法を考えてみました。

## Solution

NFTの保有証明に、Wallet接続による署名ではなく、送金Transactionを使う方法を提案します。
送金という概念はWallet接続&署名と異なり、ほとんどの人がすでに理解しているため、web3のWalletを利用した場合でも意図しない操作をしづらいというメリットがあります。
Wallet接続後の署名やContractとのやりとり内容は無数にあり、都度理解を求められますが、送金であれば宛先と金額のみの問題になるので容易に理解できます。

技術的な概要は[こちら](#web3idのwallet接続しない認証という部分はそのままにより安全でシンプルなuxのサービスに落とし込んだのが今回のsafe-nft-ownership-verificationsnovです)に記載してあります。


## Use Case

自社の会員データベースを持っているサービスが、特定のNFT保有者に対して特典を提供する場合を想定してデモを作成しました。
利用企業にとってはNFT保有確認SaaSのようなイメージです。

利用企業はSNOVに特典の内容(どのNFTを対象とするかなど)を共有します。  
利用企業はユーザーに申し込みページへのリンクを共有します。  
ユーザーはそのページからNFT保有特典の申し込みをします。  
SNOVは該当NFTの保有が確認できたユーザーリストを定期的に利用企業に共有します。(リアルタイムではなくスナップショットでの確認になります)  
*データの共有方法、保有状況の定期確認は現状のデモでは未実装です。

::: mermaid
flowchart LR
    id1(利用企業) -- 特典情報 --> id2(SNOV)
    id2 -- 認証済みユーザーIDリスト --> id1
    id1 -- 申し込みページURL --> id3
    id3(ユーザー) -- 申し込み --> id2
:::



## Wallet接続方式との比較

メリット
- 自分が何をしているのか理解しやすい
- MetaMaskやWalletConnect以外でも対応可能(送金さえできれば良いので)
- フィッシング詐欺等の被害が限定的(最悪のケースでも他人に自分のNFTを使って保有特典を利用されてしまうだけ)

デメリット
- gas代がかかる(testnetを使えばgas代は無料だが入手が面倒という問題がある...)
- チート行為がやりやすい(送金作業を自分以外のNFT保有者に依頼することは署名を求めるよりは簡単, 厳密さより簡単さ安全さを優先)
- Transaction記録が残るのでプライバシーに気を付ける必要がある(pending状態でも確認できるのでガス代をわざと低くしてTransacitonが通らないようにすれば記録を残さないことも可能)


## Web3IDとの比較

### Web3IDとは
送金によるNFT保有確認というアイディアの元ネタがWeb3IDです。  
最近話題になったBAYC NFT保有者への空港VIPラウンジ利用でも使われています。

> このパートナーシップは、ブロックチェーンアクセラレーター「MouseBelt」のリアルビジネス仲介プロジェクト「BoredJobs.com」の調整により実現した。BoredJobs.comが取り組む、NFTを活用した認証技術「Web3ID」のユースケースの一つとなる。

https://coinpost.jp/?p=399233


現状のセキュリティモデルではマスアダプションは難しいので、Wallet接続を求めない方法が必要だと主張しています。

> Web3 projects have lost over 2 Billion Dollars because of hacks in the past year. Understanding that the threat of attack vectors increases daily, we knew the current security model paradigm was too risky for open markets to efficiently and securely scale to the thousands of licensing deals needed for mass adoption. As we designed BoredJobs, we felt it necessary to require no wallet connection. Web3ID continues our commitment to solving problems with innovative new technology solutions.

https://medium.com/@boredjobs/web3id-the-worlds-most-secure-nft-access-ip-deals-events-and-vip-twitter-d9963422647a

どのようにしてWallet接続なしでのAddress認証を実現しているのでしょうか。

> How do you require no wallet connection ever?  
> As we thought about building Web3ID, we thought about security, first and foremost. We didn’t want people to “trust” our or any brand’s site. Instead, we wanted a passive experience of on-chain transactions with an embedded “secret” memo code to confirm they had control of their wallet. You can use the most popular wallets to verify ownership. All you have to do is send the smallest amount of ETH possible to our specified wallet and put a unique code we generate for you in the HEX/DATA line when sending the ETH transaction. In this security design, you don’t have to trust us; you must know how to send an ETH transaction with a HEX memo.


送金Transactionのinput dataにsecret memo codeを入れることでユーザーとTransactionの紐付けを行うという方法のようです。  
この方法であれば確かにWallet接続不要で簡単にAddress認証が実現できるのですが、これはこれでハッキングリスクがあります。  
送金先に悪意のあるContract Address、input dataに悪意のある関数実行を指示したデータを入れることで任意のContractの関数が実行できてしまいます。  
これだとフィッシングに引っかかった時の被害がWallet接続させた時と変わりません。   
Web3IDを実際に試したわけではないので、この問題に対してどのような対策をしているのか、何もしていないのか、気になります...  



もう一つ気になった点として、申し込みページでの入力項目の多さがあります。  
Web3IDは、BAYCのようなNFTのホルダーとIP利用したい企業との契約をスムーズに進めることや、ブルーチップNFTホルダーのコミュニティ作りのためのツールを志向しており、空港ラウンジ利用のようなケースに対しては最適化されていません。

Web3IDの申し込みページ  
https://id.boredjobs.com/


### Web3IDのWallet接続しない認証という部分はそのままに、より安全でシンプルなUXのサービスに落とし込んだのが今回のSafe NFT Ownership Verification(SNOV)です

Web3IDではinput dataにSecretを入力させる方法でしたが、SNOVではランダム発行したAddressを送金先に指定することでWallet接続なしの認証を実現しています。送金先のAddress自体をSecretとして扱うという発想です。  
ユーザーからの申し込みがあったときに、ユーザーが申請したIDとServer側でランダム生成したAddressを紐付け、それをユーザーに返します。適切な方法で生成されたAddressはそのユーザーしか知らない秘密の情報として認証に利用できます。そのAddress宛に送金をすることで、送金元のAddressをそのユーザーが保有していると証明することができます。

ちなみに送金作業自体を他人に依頼することは可能なので、申請者がそのアドレスを保有しているという厳密な意味での証明ではありません。
これはWeb3IDやWallet接続による署名確認でも同じです。

これを防ぐには、IDを紐付けたい先のサービスにログインしている状態でWallet接続による署名検証をする必要があり、利用企業のサービスにWalletによる署名機能を組み込む必要があります。

SNOVの確認方法は厳密さには欠けますが、利用企業は申請があった該当NFT保有者のIDリストを受け取るだけで、自社システムの改修がいらないというメリットがあります。


## デモサイト

ENS保有者に対して空港VIPラウンジの利用特典を提供するケースを想定した申し込みフォームです。  
指定されたAddress宛にイーサリアムのテストネット(Görli Testnet)で0Ethを送金することで保有確認が完了します。  
https://nft-ownership-verification.web.app/?eventId=kcqmHHpbnr7L9oZCxfEm

テスト用にNFTの保有は確認せずに送金元が確認できれば完了する申し込みフォームです。  
指定されたAddress宛にポリゴンのテストネット(Polygon Mumbai)で0Maticを送金することで確認が完了します。  
https://nft-ownership-verification.web.app/?eventId=aNCc9Gml1IibIp5olxHj


## 使用したtech stacks
React
Ethers.js
Tailwind CSS / daisyUI
Alchemy SDK
Firebase(Cloud functions, Firestore, Hosting)

## 使用したBlockchain
Ethereum, Polygon

