import { ethers } from "ethers";
const RATES = {
  ETH_USD: 3150.42,
  USD_INR: 83.12,
};
export function ethToUsd(ethAmount: number): number {
  return ethAmount * RATES.ETH_USD;
}
export function usdToEth(usdAmount: number): number {
  return usdAmount / RATES.ETH_USD;
}
export function ethToInr(ethAmount: number): number {
  return ethToUsd(ethAmount) * RATES.USD_INR;
}
export function inrToEth(inrAmount: number): number {
  return usdToEth(inrAmount / RATES.USD_INR);
}
export function formatEth(ethAmount: number): string {
  return `${ethAmount.toFixed(6)} ETH`;
}
export function formatUsd(usdAmount: number): string {
  return `$${usdAmount.toFixed(2)}`;
}
export function formatInr(inrAmount: number): string {
  return `₹${inrAmount.toFixed(2)}`;
}
export function ethToWei(ethAmount: number | string): string {
  return ethers.utils.parseEther(ethAmount.toString())._hex;
}
export async function getCurrentRates(): Promise<{
  ETH_USD: number;
  USD_INR: number;
}> {
  try {
    const ethResponse = await fetch("/api/blockchain/eth-price");
    const ethData = await ethResponse.json();
    return {
      ETH_USD: ethData.price || RATES.ETH_USD,
      USD_INR: RATES.USD_INR,
    };
  } catch (error) {
    console.error("Error fetching current rates:", error);
    return RATES;
  }
}
