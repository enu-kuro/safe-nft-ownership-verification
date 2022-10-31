export const enum NETWORK {
  ETH_GOERLI = 5,
  MATIC_MUMBAI = 80001,
}

export const providerUrls = {
  [NETWORK.ETH_GOERLI]:
    "wss://eth-goerli.g.alchemy.com/v2/aDTxzG5nGVHgnBainxTtV1Er8q48zMnz",
  [NETWORK.MATIC_MUMBAI]:
    "wss://polygon-mumbai.g.alchemy.com/v2/W3zqllW_P981aTabG_D2V9tMf4gZdhu_",
};
