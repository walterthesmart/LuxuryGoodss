import { describe, expect, it } from "vitest";
import { Clarinet, Tx, types } from "clarinet-sdk";

describe("LuxuryNFT contract tests", () => {
  let clarinet: Clarinet;
  let deployer: Account;
  let wallet_1: Account;

  beforeAll(() => {
    clarinet = new Clarinet();
    deployer = clarinet.accounts.get("deployer")!;
    wallet_1 = clarinet.accounts.get("wallet_1")!;
  });

  it("should allow a user to claim an NFT", () => {
    const block = clarinet.chain.mineBlock([
      Tx.contractCall("LuxuryNFT", "claim", [], wallet_1.address)
    ]);
    expect(block.receipts.length).toEqual(1);
    expect(block.receipts[0].result).toMatch(/ok/); // Adjust based on the actual result of the claim function
    // Optionally, check for specific events that should be emitted on successful claim
  });

  it("should correctly return approval status for an address", () => {
    // Assuming `get-approval` takes an address and returns a boolean indicating approval status
    const query = clarinet.chain.callReadOnlyFn("LuxuryNFT", "get-approval", [types.principal(wallet_1.address)], deployer.address);
    expect(query.result).toMatch(/true|false/); // Adjust based on the actual return type of get-approval
  });
});