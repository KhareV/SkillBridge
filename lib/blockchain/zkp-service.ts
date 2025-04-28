import { sha256 } from "crypto-hash";
import { ethers } from "ethers";
import { getProvider, getContracts } from "./provider";

/**
 * Interface for a ZKP verification result
 */
export interface ZkpVerificationResult {
  success: boolean;
  message: string;
  proof?: string;
  verifiedAt?: string;
}

/**
 * Client-side function to create a SHA-256 hash from an image
 */
export async function createImageHash(imageData: string): Promise<string> {
  try {
    const rawData = imageData.includes("base64,")
      ? imageData.split("base64,")[1]
      : imageData;
    return await sha256(rawData);
  } catch (error) {
    console.error("Error creating image hash:", error);
    let hash = 0;
    const str = imageData.substring(0, 10000);

    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }

    return Math.abs(hash).toString(16).padStart(64, "0");
  }
}

/**
 * Submit identity verification to blockchain (client-side)
 */
export async function submitIdentityProofToBlockchain(
  proof: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const { zkpContract } = getContracts(provider);
    const zkpWithSigner = zkpContract.connect(signer);
    const proofBytes = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(proof));
    const tx = await zkpWithSigner.submitProof(proofBytes);
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.transactionHash,
    };
  } catch (error: any) {
    console.error("Error submitting proof to blockchain:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
}

/**
 * Verify if a user's identity is already verified on the blockchain
 */
export async function checkIdentityVerification(
  address: string
): Promise<boolean> {
  try {
    const provider = getProvider("infura");
    const { zkpContract } = getContracts(provider);

    return await zkpContract.isVerified(address);
  } catch (error) {
    console.error("Error checking verification status:", error);
    return false;
  }
}
