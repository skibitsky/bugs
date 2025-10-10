import { appKit, wagmiAdapter } from "./config/appKit";
import { store } from "./store/appkitStore";
import { updateTheme, updateButtonVisibility } from "./utils/dom";
import { signMessage, sendTx, getBalance } from "./services/wallet";
import { initializeSubscribers } from "./utils/suscribers";
import { createAppKitWalletButton } from "@reown/appkit-wallet-button";

// Initialize subscribers
initializeSubscribers(appKit);

// Initial check
updateButtonVisibility(appKit.getIsConnectedState());

const wb = createAppKitWalletButton();

// Button event listeners
document
  .getElementById("connect-google")
  ?.addEventListener("click", async () => {
    const response = await wb.connect("google");
    console.log("Response from wb.connect()", response);
  });

document
  .getElementById("reconnect-google")
  ?.addEventListener("click", async () => {
    await appKit.disconnect();
    console.log("Disconnected");

    // wait for 2 sec
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const response = await wb.connect("google");
    console.log("Response from wb.connect()", response);
  });

document
  .getElementById("open-connect-modal")
  ?.addEventListener("click", async () => {
    await wagmiAdapter.wagmiConfig._internal.revalidate();
    await appKit.open();
  });

document.getElementById("disconnect")?.addEventListener("click", async () => {
  console.log("Disconnecting...");
  await appKit.disconnect("eip155");
  await appKit.disconnect("solana");
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
