import { describe, expect, it, beforeEach } from "vitest";

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
    it("should allow claiming an NFT with valid parameters", () => {
      const dummySignature = Cl.bufferFromHex("00".repeat(65));

      const { result } = simnet.callPublicFn(
        "LuxuryNFT",
        "claim",
        [Cl.uint(1), Cl.uint(100), Cl.uint(10), Cl.standardPrincipal(wallet1), dummySignature],
        deployer
      );

      expect(result).toBeOk(Cl.uint(1));

      // Verify token count increased
      const count = simnet.callReadOnlyFn("LuxuryNFT", "get-token-count", [], deployer);
      expect(count.result).toBeOk(Cl.uint(1));
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