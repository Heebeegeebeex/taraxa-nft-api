import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { QRCode } from "react-qrcode-logo"; // ✅ Corrected QR Code Import

// ✅ Define NFT Type for TypeScript
interface NFT {
  metadata: string;
  qrCodeUrl: string;
}

export default function Home() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [minting, setMinting] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  // ✅ Connect Wallet
  const connectWallet = async () => {
    if ((window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      setWallet(await signer.getAddress());
    } else {
      alert("MetaMask is required to use this feature");
    }
  };

  // ✅ Fetch User NFTs (Now Uses Deployed API)
  useEffect(() => {
    if (wallet) {
      fetch(`https://taraxa-nft-api-git-main-heebees-projects.vercel.app/api/get-taraxa-nfts?wallet=${wallet}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`API returned status ${res.status}`);
          }
          return res.json();
        })
        .then((data) => setNfts(data.nfts || []))
        .catch((err) => console.error("Error fetching NFTs:", err));
    }
  }, [wallet]);

  // ✅ Mint NFT Function (Calls Your Deployed API)
  const mintNFT = async () => {
    setMinting(true);
    const metadata = "https://ipfs.io/ipfs/example-metadata"; // Replace with actual metadata
    const qrCodeUrl = `https://taraxa-nft-api-git-main-heebees-projects.vercel.app/verify/${wallet}`;
    const value = "100";

    fetch("https://taraxa-nft-api-git-main-heebees-projects.vercel.app/api/mint-taraxa-nft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metadata, qrCodeUrl, value }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("NFT Minted Successfully!");
        setQrCode(qrCodeUrl);
      })
      .catch((err) => console.error("Error minting NFT:", err))
      .finally(() => setMinting(false));
  };

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">Taraxa NFT Platform</h1>
      {!wallet ? (
        <button onClick={connectWallet} className="mt-4 p-2 bg-blue-500 text-white rounded">
          Connect Wallet
        </button>
      ) : (
        <div>
          <p>Connected: {wallet}</p>

          {/* ✅ Mint NFT Button (Now Calls the Deployed API) */}
          <button 
            onClick={mintNFT} 
            className="mt-4 p-2 bg-green-500 text-white rounded"
            disabled={minting}
          >
            {minting ? "Minting..." : "Mint NFT"}
          </button>

          {/* ✅ Show QR Code if NFT is Minted */}
          {qrCode && (
            <div className="mt-4">
              <p>Scan QR Code to Verify NFT:</p>
              <QRCode value={qrCode} size={128} />
            </div>
          )}

          <h2 className="mt-6 text-xl font-semibold">Your NFTs</h2>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {nfts.length > 0 ? (
              nfts.map((nft, index) => (
                <div key={index} className="border p-2">
                  <img src={nft.metadata} alt="NFT" className="w-full h-auto" />
                  <p>{nft.qrCodeUrl}</p>
                </div>
              ))
            ) : (
              <p className="mt-4 text-gray-500">No NFTs found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
