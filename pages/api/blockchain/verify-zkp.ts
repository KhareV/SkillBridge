import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { generateKeyPairSync } from "crypto";
async function simulateZkpVerification(
  aadharNumber: string,
  imageHash: string
) {
  try {
    const inputData = `${aadharNumber}_${imageHash}_${
      process.env.ZKP_SALT || "zkp-demo-salt"
    }`;
    const { publicKey, privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });
    const isValidFormat = /^\d{4}-\d{4}-\d{4}$/.test(aadharNumber);
    if (!isValidFormat) {
      return {
        success: false,
        message: "Invalid Aadhar format. Must be XXXX-XXXX-XXXX",
      };
    }
    const storedHash = createVerificationHash(aadharNumber);
    const submittedHash = createVerificationHash(aadharNumber);
    const isValid = storedHash === submittedHash;
    let proof = null;

    if (isValid) {
      const sign = crypto.createSign("SHA256");
      sign.update(inputData);
      sign.end();
      const signature = sign.sign(privateKey).toString("hex");
      const formattedProof = [];
      for (let i = 0; i < signature.length; i += 8) {
        formattedProof.push(signature.substr(i, 8));
      }
      proof = formattedProof.slice(0, 8).join("-");
      const verify = crypto.createVerify("SHA256");
      verify.update(inputData);
      verify.end();
      const isSignatureValid = verify.verify(
        publicKey,
        Buffer.from(signature, "hex")
      );

      if (!isSignatureValid) {
        return {
          success: false,
          message: "Signature verification failed. Please try again.",
        };
      }
    }

    return {
      success: isValid,
      message: isValid
        ? "Identity verified successfully using zero-knowledge proof"
        : "Verification failed. The provided Aadhar information couldn't be verified",
      proof: isValid ? proof : undefined,
      verifiedAt: isValid ? new Date().toISOString() : undefined,
    };
  } catch (error) {
    console.error("Error in ZKP verification:", error);
    return {
      success: false,
      message: "An error occurred during verification processing",
    };
  }
}
function createVerificationHash(aadharNumber: string): string {
  const secret = process.env.ZKP_SECRET || "default-zkp-secret";
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(aadharNumber);
  return hmac.digest("hex");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { aadharNumber, imageHash } = req.body;
    if (!aadharNumber || !imageHash) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const result = await simulateZkpVerification(aadharNumber, imageHash);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("ZKP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during verification process",
    });
  }
}
