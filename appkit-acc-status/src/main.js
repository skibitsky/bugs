import { appKit, wagmiAdapter } from "./config/appKit";
import { store } from "./store/appkitStore";
import { updateTheme, updateButtonVisibility } from "./utils/dom";
import { signMessage, sendTx, getBalance } from "./services/wallet";
import { initializeSubscribers } from "./utils/suscribers";

// Initialize subscribers
initializeSubscribers(appKit);

// Initial check
updateButtonVisibility(appKit.getIsConnectedState());

// Button event listeners
document
  .getElementById("log-get-account")
  ?.addEventListener("click", async () => {
    const account = appKit.getAccount("eip155");
    console.log("Response from appKit.getAccount()", account);
  });

document
  .getElementById("open-connect-modal")
  ?.addEventListener("click", () => appKit.open());

document.getElementById("disconnect")?.addEventListener("click", async () => {
  console.log("Disconnecting...");
  await appKit.disconnect();
  console.log("Disconnected");
});

document.getElementById("switch-network")?.addEventListener("click", () => {
  const currentChainId = store.networkState?.chainId;
  appKit.switchNetwork(currentChainId === polygon.id ? mainnet : polygon);
});

document.getElementById("sign-message")?.addEventListener("click", async () => {
  const signature = await signMessage(
    store.eip155Provider,
    store.accountState.address
  );

  document.getElementById("signatureState").innerHTML = signature;
  document.getElementById("signatureSection").style.display = "";
});

document.getElementById("send-tx")?.addEventListener("click", async () => {
  const tx = await sendTx(
    store.eip155Provider,
    store.accountState.address,
    wagmiAdapter.wagmiConfig
  );

  document.getElementById("txState").innerHTML = JSON.stringify(tx, null, 2);
  document.getElementById("txSection").style.display = "";
});

document.getElementById("get-balance")?.addEventListener("click", async () => {
  const balance = await getBalance(
    store.eip155Provider,
    store.accountState.address,
    wagmiAdapter.wagmiConfig
  );

  document.getElementById("balanceState").innerHTML = balance + " ETH";
  document.getElementById("balanceSection").style.display = "";
});

// Set initial theme
updateTheme(store.themeState.themeMode);
