import express from "express";
import bodyParser from "body-parser";
import { ethers } from "ethers";
import axios from "axios";

const app = express();
app.use(bodyParser.json());

// Taraxa contract details
const TARAXA_RPC_URL = "https://rpc.testnet.taraxa.io/";
const PRIVATE_KEY = "your-private-key";
const CONTRACT_ADDRESS = "your-contract-address";
const ABI = [
    "function wrapNFT(address nftContract, uint256 tokenId, string memory metadata, string memory qrCodeUrl, string memory chain, uint256 value) public payable",
    "function mintNFT(string memory metadata, string memory qrCodeUrl, uint256 value) public payable"
];

const provider = new ethers.JsonRpcProvider(TARAXA_RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// Fetch Taraxa NFTs for a user
app.get("/get-taraxa-nfts", async (req, res) => {
    try {
        const userWallet = req.query.wallet;
        if (!userWallet) return res.status(400).json({ error: "Wallet address is required" });

        const response = await axios.get(`https://taraxa-api.io/nfts/${userWallet}`);
        res.json({ nfts: response.data.nfts });
    } catch (error) {
        console.error("Error fetching Taraxa NFTs:", error);
        res.status(500).json({ error: "Failed to fetch NFTs" });
    }
});

// Wrap a Taraxa NFT
app.post("/wrap-taraxa-nft", async (req, res) => {
    try {
        const { nftId, metadata, qrCodeUrl, chain, value } = req.body;
        if (!nftId || !metadata || !qrCodeUrl || !chain || !value) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        console.log(`Wrapping Taraxa NFT ID ${nftId}...`);
        const tx = await contract.wrapNFT(CONTRACT_ADDRESS, nftId, metadata, qrCodeUrl, chain, ethers.utils.parseEther(value.toString()), { value: ethers.utils.parseEther("0.01") });
        await tx.wait();

        console.log(`Taraxa NFT ID ${nftId} successfully wrapped!`);
        res.json({ message: "Taraxa NFT successfully wrapped!" });
    } catch (error) {
        console.error("Error wrapping Taraxa NFT:", error);
        res.status(500).json({ error: "Failed to wrap Taraxa NFT" });
    }
});

// Mint a new Taraxa NFT
app.post("/mint-taraxa-nft", async (req, res) => {
    try {
        const { metadata, qrCodeUrl, value } = req.body;
        if (!metadata || !qrCodeUrl || !value) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        console.log("Minting new Taraxa NFT...");
        const tx = await contract.mintNFT(metadata, qrCodeUrl, ethers.utils.parseEther(value.toString()), { value: ethers.utils.parseEther("0.02") });
        await tx.wait();

        console.log("Taraxa NFT successfully minted and wrapped!");
        res.json({ message: "Taraxa NFT successfully minted and wrapped!" });
    } catch (error) {
        console.error("Error minting Taraxa NFT:", error);
        res.status(500).json({ error: "Failed to mint Taraxa NFT" });
    }
});

app.listen(3000, () => console.log("Taraxa NFT API running on port 3000"));
