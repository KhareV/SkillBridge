import { ethers } from "ethers";
import { DESTINATION_ADDRESS } from "@/app/blockchain/page";
import { formatCurrency } from "@/lib/utils";
const proposalMapping: Record<string, number> = {
  "student-001": 1,
  "student-002": 2,
  "student-003": 3,
};
export async function convertEthToUsd(ethAmount: number): Promise<number> {
  try {
    const response = await fetch("/api/blockchain/eth-price");
    const data = await response.json();
    return ethAmount * data.price;
  } catch (error) {
    console.error("Error converting ETH to USD:", error);
    return ethAmount * 3150.42;
  }
}
export async function convertUsdToEth(usdAmount: number): Promise<number> {
  try {
    const response = await fetch("/api/blockchain/eth-price");
    const data = await response.json();
    return usdAmount / data.price;
  } catch (error) {
    console.error("Error converting USD to ETH:", error);
    return usdAmount / 3150.42;
  }
}
export function getBlockchainProposalId(studentId: string): number | null {
  return proposalMapping[studentId] || null;
}
export async function fundStudentProposal(
  studentId: string,
  amountInr: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }
    const blockchainProposalId = getBlockchainProposalId(studentId);
    if (!blockchainProposalId) {
      throw new Error("Student proposal not connected to blockchain");
    }
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = accounts[0];
    const amountUsd = amountInr / 80;
    const amountEth = await convertUsdToEth(amountUsd);
    const amountEthFormatted = amountEth.toFixed(6);
    const transactionParameters = {
      to: DESTINATION_ADDRESS,
      from: account,
      value: ethers.utils.parseEther(amountEthFormatted)._hex,
      gas: "0x5208",
    };
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

    return { success: true, txHash };
  } catch (error: any) {
    console.error("Error funding student proposal:", error);
    return { success: false, error: error.message };
  }
}
export async function verifyAadharWithZkp(
  aadharNumber: string,
  aadharImage: string
): Promise<{ success: boolean; message: string; proof?: string }> {
  try {
    const imageHash = await createImageHash(aadharImage);
    const response = await fetch("/api/blockchain/verify-zkp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ aadharNumber, imageHash }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error verifying Aadhar with ZKP:", error);
    return {
      success: false,
      message: "Error processing verification request",
    };
  }
}
async function createImageHash(imageData: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(imageData);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
