import { Contract, parseUnits } from "ethers";
import { BrowserProvider } from "ethers";
import { useEffect, useState } from "react";
import { USDC_ABI, USDC_MUMBAI_CONTRACT_ADDRESS } from "./constants";
import { Loader } from "./components/Loader";

function App() {
  const [isProviderInjected, setIsProviderInjected] = useState(false);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [receipt, setReceipt] = useState("");
  const [txnPending, setTxnPending] = useState(false);

  useEffect(() => {
    const onLoad = () => {
      if (window.ethereum) {
        setIsProviderInjected(true);
      }
      const pvdr = new BrowserProvider(window.ethereum);
      setProvider(pvdr);
    };

    onLoad();
  }, []);

  useEffect(() => {
    setTxnPending(false);
  }, [receipt]);

  const handleConnectClick = () => {
    if (walletAddress !== "") {
      window.location.reload();
    } else {
      provider?.send("eth_requestAccounts", []).then((res) => {
        console.log("Connected to", res);
        setWalletAddress(res[0]);
      });
    }
  };

  const handlePayment = async () => {
    setTxnPending(true);
    const signer = await provider?.getSigner();
    const usdcContract = new Contract(
      USDC_MUMBAI_CONTRACT_ADDRESS,
      USDC_ABI,
      signer
    );
    const tokenDecimals = await usdcContract.decimals();
    const amountToTransferInWei = parseUnits("5.0", tokenDecimals);

    const tx = await usdcContract.transfer(
      walletAddress,
      amountToTransferInWei
    );
    const result = await tx.wait();
    console.log(result);
    setReceipt(result.hash);
  };

  return (
    <main className="min-h-screen w-screen bg-black flex flex-col items-center p-24 gap-8">
      <section className="flex flex-col items-center">
        <div className="py-2">
          <p className="text-4xl py-2 text-center">ka-ching.io prototype</p>
          <p className="text-center">
            window.ethereum {isProviderInjected ? "" : "not"} found.
          </p>
          <p className="text-center">
            Connected to {walletAddress !== "" ? walletAddress : "null"}.
          </p>
        </div>
        <button
          disabled={!isProviderInjected}
          className="rounded-lg px-3 py-2 font-semibold bg-gray-900"
          onClick={handleConnectClick}
        >
          {walletAddress !== "" ? "Disconnect" : "Connect Wallet"}
        </button>
      </section>
      <section className="flex flex-col items-center">
        <p className="font-bold text-2xl">Transaction Details</p>
        <p className="py-2">
          You need to pay
          <strong>{" 5 USD "}</strong>
          to complete the transaction.
        </p>
        <button
          disabled={!(isProviderInjected && walletAddress !== "")}
          className="rounded-lg px-3 py-2 bg-gray-900"
          onClick={handlePayment}
        >
          {isProviderInjected && walletAddress !== ""
            ? "Send 5 USDC on Polygon_Mumbai"
            : "Wallet not connected to make payment."}
        </button>
      </section>
      <section className="flex flex-col items-center justify-center">
        <p className="font-bold text-2xl py-4">Transaction Receipt</p>
        {txnPending ? (
          <Loader />
        ) : (
          <a
            className="text-white underline"
            target="_blank"
            href={`https://mumbai.polygonscan.com/tx/${receipt}`}
          >
            {receipt}
          </a>
        )}
      </section>
    </main>
  );
}

export default App;
