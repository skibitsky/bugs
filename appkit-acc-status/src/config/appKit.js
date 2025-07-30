import { createAppKit } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { SolanaAdapter } from "@reown/appkit-adapter-solana";
import * as chains from "@reown/appkit/networks";

const projectId = import.meta.env.VITE_PROJECT_ID; // this is a public projectId only to use on localhost
if (!projectId) {
  throw new Error("VITE_PROJECT_ID is not set");
}
const networks = Object.values(chains).filter(
  (chain) => chain.chainNamespace !== "bip122" && chain.id
);

console.log("[App] Networks:", networks);

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

export const solanaAdapter = new SolanaAdapter();

export const appKit = createAppKit({
  adapters: [wagmiAdapter, solanaAdapter],
  networks,
  projectId,
  themeMode: "light",
  themeVariables: {
    "--w3m-accent": "#000000",
  },
  features: {
    analytics: true,
  },
});
