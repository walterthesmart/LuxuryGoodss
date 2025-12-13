import { describe, expect, it, beforeEach } from "vitest";
import { Cl, serializeCV, standardPrincipalCV, uintCV, bufferCV, boolCV } from "@stacks/transactions";
import { sha256 } from "@noble/hashes/sha256";
import { getPublicKey, sign, recoverPublicKey } from "@noble/secp256k1";

// Helper to concat Uint8Arrays
function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((acc, val) => acc + val.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function hexToBytes(hex: string) {
  if (hex.length % 2 !== 0) throw new Error("Invalid hex string");
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function getChainIdBytes() {
  const buffer = new Uint8Array(4);
  new DataView(buffer.buffer).setUint32(0, 2147483648, false); // Big Endian
  return buffer;
}

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("LuxuryNFT Contract - Clarity 4", () => {
  describe("Contract Initialization", () => {
    it("should initialize with correct name and symbol", () => {
      const name = simnet.callReadOnlyFn("LuxuryNFT", "get-name", [], deployer);
      expect(name.result).toBeOk(Cl.stringAscii("LuxuryNFT"));

      const symbol = simnet.callReadOnlyFn("LuxuryNFT", "get-symbol", [], deployer);
      expect(symbol.result).toBeOk(Cl.stringAscii("LUXE"));
    });

    it("should start with zero token count", () => {
      const count = simnet.callReadOnlyFn("LuxuryNFT", "get-token-count", [], deployer);
      expect(count.result).toBeOk(Cl.uint(0));
    });

    it("should be transferrable by default", () => {
      const transferrable = simnet.callReadOnlyFn("LuxuryNFT", "is-transferrable", [], deployer);
      expect(transferrable.result).toBeOk(Cl.bool(true));
    });
  });

  describe("NFT Claiming", () => {
    it("should allow claiming an NFT with valid parameters", async () => {
      try {
        console.log("Generating key...");
        const privateKey = hexToBytes("1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef");
        const publicKey = getPublicKey(privateKey, true); // compressed
        console.log("Public Key Hex:", Buffer.from(publicKey).toString('hex'));
        const pubKeyCV = bufferCV(Buffer.from(publicKey));
        console.log("PubKey CV:", JSON.stringify(pubKeyCV));

        console.log("Setting signer key...");
        const setKeyRes = simnet.callPublicFn("LuxuryNFT", "set-signer-key", [pubKeyCV], deployer);
        console.log("Set key result:", setKeyRes.result);
        expect(setKeyRes.result).toBeOk(boolCV(true));

        // Get the exact message hash from the contract to ensure consistent signing
        const claimHashRes = simnet.callReadOnlyFn(
          "LuxuryNFT",
          "get-claim-hash",
          [uintCV(1), uintCV(100), uintCV(10), standardPrincipalCV(wallet1)],
          deployer
        );
        console.log('Claim hash read-only result: ', claimHashRes);
        // The claim hash returned by the simnet can be a Buffer or Uint8Array depending on environment
        let msgHash: Uint8Array;
  const claimVal: any = (claimHashRes.result && claimHashRes.result.value) || claimHashRes.result || claimHashRes;
        if (typeof claimVal === "string") {
          msgHash = hexToBytes(claimVal);
        } else if (claimVal && typeof claimVal === 'object' && claimVal.type === 'buffer' && typeof claimVal.value === 'string') {
          msgHash = hexToBytes(claimVal.value);
        } else if (claimVal instanceof Uint8Array || Buffer.isBuffer(claimVal)) {
          msgHash = new Uint8Array(claimVal);
        } else {
          throw new Error("Unexpected claim hash type: " + typeof claimVal);
        }

        console.log("Signing...");
        // Use the secp256k1 library explicitly to get a consistent compact signature
  const secp = await import("@noble/secp256k1");
  const privateKeyHex = Buffer.from(privateKey).toString('hex');
  console.log('Private key hex:', privateKeyHex);
  console.log('MsgHash hex:', Buffer.from(msgHash).toString('hex'));
  // Request compact signature (r||s, 64 bytes) instead of DER
  const sigBytes = await secp.sign(msgHash, privateKeyHex, { der: false });
        // Normalize signature and compute recovery index using compactSig
        let recovery = 0;

  const signatureBuffer = new Uint8Array(65);
        // Normalize signature to Uint8Array
        let rawSigBytes: Uint8Array;
        if (typeof sigBytes === 'string') {
          rawSigBytes = hexToBytes(sigBytes);
        } else if (Buffer.isBuffer(sigBytes)) {
          rawSigBytes = new Uint8Array(sigBytes);
        } else if (sigBytes instanceof Uint8Array) {
          rawSigBytes = sigBytes;
        } else {
          rawSigBytes = Uint8Array.from(Object.values(sigBytes));
        }
  console.log('rawSigBytes length:', rawSigBytes.length, 'type:', typeof rawSigBytes, 'contents:', rawSigBytes);
        let compactSig: Uint8Array;
        // If der-encoded (starts with 0x30), convert to compact (r||s 64 bytes)
        if (rawSigBytes[0] === 0x30) {
          // Simple DER parser (assumes typical format)
          let idx = 2; // skip 0x30 <len>
          if (rawSigBytes[idx] !== 0x02) throw new Error('Invalid DER: missing INTEGER marker for r');
          const rLen = rawSigBytes[idx + 1];
          let rStart = idx + 2;
          const r = rawSigBytes.slice(rStart, rStart + rLen);
          idx = rStart + rLen;
          if (rawSigBytes[idx] !== 0x02) throw new Error('Invalid DER: missing INTEGER marker for s');
          const sLen = rawSigBytes[idx + 1];
          let sStart = idx + 2;
          const s = rawSigBytes.slice(sStart, sStart + sLen);
          // pad or trim to 32 bytes
          const rPadded = new Uint8Array(32);
          const sPadded = new Uint8Array(32);
          rPadded.set(r.slice(Math.max(0, r.length - 32)));
          sPadded.set(s.slice(Math.max(0, s.length - 32)));
          compactSig = new Uint8Array(64);
          compactSig.set(rPadded, 0);
          compactSig.set(sPadded, 32);
        } else {
          compactSig = rawSigBytes.slice(0, 64);
        }
  console.log('compactSig length', compactSig.length);
        signatureBuffer.set(compactSig);
        // Recompute the recovery id after compacting signature
        recovery = 0;
        for (let rec = 0; rec < 4; rec++) {
          try {
            const recoveredPub = secp.recoverPublicKey(msgHash, compactSig, rec, true);
            if (Buffer.from(recoveredPub).toString('hex') === Buffer.from(publicKey).toString('hex')) {
              recovery = rec;
              break;
            }
          } catch (e) {
            continue;
          }
        }
        signatureBuffer[64] = recovery;

  console.log("Signature Recovery ID:", recovery);
  console.log("Final signatureBuffer:", Buffer.from(signatureBuffer).toString('hex'));

  // Verify locally using the previously imported secp
  // @ts-ignore
  const isSigValid = secp.verify(signatureBuffer.slice(0, 64), msgHash, publicKey);
        console.log("Local Signature Verification Result:", isSigValid);

        console.log("Calling claim...");
        const { result } = simnet.callPublicFn(
          "LuxuryNFT",
          "claim",
          [uintCV(1), uintCV(100), uintCV(10), standardPrincipalCV(wallet1), bufferCV(Buffer.from(signatureBuffer))],
          deployer
        );
        console.log("Claim result:", result);
        expect(result).toBeOk(uintCV(1));

        // Verify token count increased
        const count = simnet.callReadOnlyFn("LuxuryNFT", "get-token-count", [], deployer);
        expect(count.result).toBeOk(uintCV(1));
      } catch (e) {
        console.error("TEST FAILED WITH ERROR:", e);
        throw e;
      }
    });

    it("should prevent duplicate claims with same verify-id", () => {
      const dummySignature = Cl.bufferFromHex("00".repeat(65));

      // First claim
      simnet.callPublicFn(
        "LuxuryNFT",
        "claim",
        [Cl.uint(1), Cl.uint(100), Cl.uint(10), Cl.standardPrincipal(wallet1), dummySignature],
        deployer
      );

      // Second claim with same verify-id should fail
      const { result } = simnet.callPublicFn(
        "LuxuryNFT",
        "claim",
        [Cl.uint(1), Cl.uint(100), Cl.uint(10), Cl.standardPrincipal(wallet2), dummySignature],
        deployer
      );

      expect(result).toBeErr(Cl.uint(102)); // ERR-INVALID-SIGNATURE
    });

    it("should enforce campaign cap", () => {
      const dummySignature = Cl.bufferFromHex("00".repeat(65));

      // Claim with cap of 1
      simnet.callPublicFn(
        "LuxuryNFT",
        "claim",
        [Cl.uint(1), Cl.uint(200), Cl.uint(1), Cl.standardPrincipal(wallet1), dummySignature],
        deployer
      );

      // Second claim should fail due to cap
      const { result } = simnet.callPublicFn(
        "LuxuryNFT",
        "claim",
        [Cl.uint(1), Cl.uint(201), Cl.uint(1), Cl.standardPrincipal(wallet2), dummySignature],
        deployer
      );

      expect(result).toBeErr(Cl.uint(103)); // ERR-CAP-REACHED
    });
  });

  describe("NFT Transfer", () => {
    beforeEach(() => {
      // Mint an NFT to wallet1
      const dummySignature = Cl.bufferFromHex("00".repeat(65));
      simnet.callPublicFn(
        "LuxuryNFT",
        "claim",
        [Cl.uint(1), Cl.uint(300), Cl.uint(0), Cl.standardPrincipal(wallet1), dummySignature],
        wallet1
      );
    });

    it("should allow owner to transfer NFT", () => {
      const { result } = simnet.callPublicFn(
        "LuxuryNFT",
        "transfer",
        [Cl.uint(1), Cl.standardPrincipal(wallet1), Cl.standardPrincipal(wallet2)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));

      // Verify new owner
      const owner = simnet.callReadOnlyFn("LuxuryNFT", "get-token-owner", [Cl.uint(1)], deployer);
      expect(owner.result).toBeOk(Cl.some(Cl.standardPrincipal(wallet2)));
    });

    it("should prevent non-owner from transferring", () => {
      const { result } = simnet.callPublicFn(
        "LuxuryNFT",
        "transfer",
        [Cl.uint(1), Cl.standardPrincipal(wallet1), Cl.standardPrincipal(wallet2)],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(101)); // ERR-NOT-TOKEN-OWNER
    });

    it("should respect transferrable flag", () => {
      // Disable transfers
      simnet.callPublicFn("LuxuryNFT", "set-transferrable", [Cl.bool(false)], deployer);

      const { result } = simnet.callPublicFn(
        "LuxuryNFT",
        "transfer",
        [Cl.uint(1), Cl.standardPrincipal(wallet1), Cl.standardPrincipal(wallet2)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(105)); // ERR-NON-TRANSFERRABLE
    });
  });

  describe("NFT Approval", () => {
    beforeEach(() => {
      const dummySignature = Cl.bufferFromHex("00".repeat(65));
      simnet.callPublicFn(
        "LuxuryNFT",
        "claim",
        [Cl.uint(1), Cl.uint(400), Cl.uint(0), Cl.standardPrincipal(wallet1), dummySignature],
        wallet1
      );
    });

    it("should allow owner to set approval", () => {
      const { result } = simnet.callPublicFn(
        "LuxuryNFT",
        "set-approval",
        [Cl.uint(1), Cl.standardPrincipal(wallet2)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));

      const operator = simnet.callReadOnlyFn("LuxuryNFT", "get-token-operator", [Cl.uint(1)], deployer);
      expect(operator.result).toBeOk(Cl.some(Cl.standardPrincipal(wallet2)));
    });

    it("should allow approved operator to transfer", () => {
      // Set approval
      simnet.callPublicFn(
        "LuxuryNFT",
        "set-approval",
        [Cl.uint(1), Cl.standardPrincipal(wallet2)],
        wallet1
      );

      // Transfer as operator
      const { result } = simnet.callPublicFn(
        "LuxuryNFT",
        "transfer",
        [Cl.uint(1), Cl.standardPrincipal(wallet1), Cl.standardPrincipal(deployer)],
        wallet2
      );

      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("NFT Burn (New Feature)", () => {
    beforeEach(() => {
      const dummySignature = Cl.bufferFromHex("00".repeat(65));
      simnet.callPublicFn(
        "LuxuryNFT",
        "claim",
        [Cl.uint(1), Cl.uint(500), Cl.uint(0), Cl.standardPrincipal(wallet1), dummySignature],
        wallet1
      );
    });

    it("should allow owner to burn their NFT", () => {
      const { result } = simnet.callPublicFn(
        "LuxuryNFT",
        "burn",
        [Cl.uint(1)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));

      // Verify NFT no longer exists
  const owner = simnet.callReadOnlyFn("LuxuryNFT", "get-token-owner", [Cl.uint(1)], deployer);
  console.log("get-token-owner result:", owner);
  expect(owner.result).toBeErr(Cl.uint(108)); // ERR-TOKEN-NOT-FOUND
    });

    it("should prevent non-owner from burning NFT", () => {
      const { result } = simnet.callPublicFn(
        "LuxuryNFT",
        "burn",
        [Cl.uint(1)],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(101)); // ERR-NOT-TOKEN-OWNER
    });
  });

  describe("Admin Functions", () => {
    it("should allow owner to set base URI", () => {
      const { result } = simnet.callPublicFn(
        "LuxuryNFT",
        "set-base-uri",
        [Cl.stringAscii("https://example.com/metadata/")],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      const baseUri = simnet.callReadOnlyFn("LuxuryNFT", "get-base-uri", [], deployer);
      expect(baseUri.result).toBeOk(Cl.stringAscii("https://example.com/metadata/"));
    });

    it("should prevent non-owner from setting base URI", () => {
      const { result } = simnet.callPublicFn(
        "LuxuryNFT",
        "set-base-uri",
        [Cl.stringAscii("https://malicious.com/")],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(100)); // ERR-OWNER-ONLY
    });

    it("should allow owner to change contract owner", () => {
      const { result } = simnet.callPublicFn(
        "LuxuryNFT",
        "set-contract-owner",
        [Cl.standardPrincipal(wallet1)],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("Read-Only Functions", () => {
    it("should return correct campaign stats", () => {
      const dummySignature = Cl.bufferFromHex("00".repeat(65));

      // Mint 2 NFTs for campaign 1
      simnet.callPublicFn(
        "LuxuryNFT",
        "claim",
        [Cl.uint(1), Cl.uint(600), Cl.uint(0), Cl.standardPrincipal(wallet1), dummySignature],
        deployer
      );
      simnet.callPublicFn(
        "LuxuryNFT",
        "claim",
        [Cl.uint(1), Cl.uint(601), Cl.uint(0), Cl.standardPrincipal(wallet2), dummySignature],
        deployer
      );

      const stats = simnet.callReadOnlyFn("LuxuryNFT", "get-campaign-stats", [Cl.uint(1)], deployer);
      expect(stats.result).toBeOk(Cl.uint(2));
    });

    it("should return token URI when token exists", () => {
      const dummySignature = Cl.bufferFromHex("00".repeat(65));

      // Set base URI
      simnet.callPublicFn(
        "LuxuryNFT",
        "set-base-uri",
        [Cl.stringAscii("https://nft.luxury/")],
        deployer
      );

      // Mint token
      simnet.callPublicFn(
        "LuxuryNFT",
        "claim",
        [Cl.uint(1), Cl.uint(700), Cl.uint(0), Cl.standardPrincipal(wallet1), dummySignature],
        deployer
      );

      const uri = simnet.callReadOnlyFn("LuxuryNFT", "get-token-uri", [Cl.uint(1)], deployer);
      expect(uri.result).toBeOk(Cl.some(Cl.stringAscii("https://nft.luxury/1.json")));
    });
  });
});