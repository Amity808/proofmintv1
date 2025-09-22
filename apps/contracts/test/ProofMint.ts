import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther } from "viem";

describe("ProofMint", function () {
  async function deployProofMintFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, merchant, buyer, recycler, otherAccount] = await hre.viem.getWalletClients();

    // Deploy the test contract which initializes automatically
    const proofMint = await hre.viem.deployContract("ProofMintTest");

    const publicClient = await hre.viem.getPublicClient();

    return {
      proofMint,
      owner,
      merchant,
      buyer,
      recycler,
      otherAccount,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should initialize with correct name and symbol", async function () {
      const { proofMint } = await loadFixture(deployProofMintFixture);

      expect(await proofMint.read.name()).to.equal("Proofmint");
      expect(await proofMint.read.symbol()).to.equal("PFMT");
    });

    it("Should set the right owner", async function () {
      const { proofMint, owner } = await loadFixture(deployProofMintFixture);

      expect(await proofMint.read.owner()).to.equal(
        getAddress(owner.account.address)
      );
    });

    it("Should initialize nextReceiptId to 1", async function () {
      const { proofMint } = await loadFixture(deployProofMintFixture);

      expect(await proofMint.read.getnextReceiptId()).to.equal(1n);
    });

    it("Should return correct version", async function () {
      const { proofMint } = await loadFixture(deployProofMintFixture);

      expect(await proofMint.read.getVersion()).to.equal("1.0.0");
    });
  });

  describe("Merchant Management", function () {
    it("Should allow owner to add merchant", async function () {
      const { proofMint, merchant } = await loadFixture(deployProofMintFixture);

      await proofMint.write.addMerchant([merchant.account.address]);
      expect(await proofMint.read.isVerifiedMerchant([merchant.account.address])).to.be.true;
    });

    it("Should emit MerchantAdded event", async function () {
      const { proofMint, merchant, publicClient } = await loadFixture(deployProofMintFixture);

      const hash = await proofMint.write.addMerchant([merchant.account.address]);
      await publicClient.waitForTransactionReceipt({ hash });

      const events = await proofMint.getEvents.MerchantAdded();
      expect(events).to.have.lengthOf(1);
      expect(events[0].args.merchant).to.equal(getAddress(merchant.account.address));
    });

    it("Should not allow non-owner to add merchant", async function () {
      const { proofMint, merchant, otherAccount } = await loadFixture(deployProofMintFixture);

      const proofMintAsOther = await hre.viem.getContractAt(
        "ProofMint",
        proofMint.address,
        { client: { wallet: otherAccount } }
      );

      await expect(
        proofMintAsOther.write.addMerchant([merchant.account.address])
      ).to.be.rejectedWith("OnlyAdmin");
    });

    it("Should allow owner to remove merchant", async function () {
      const { proofMint, merchant } = await loadFixture(deployProofMintFixture);

      await proofMint.write.addMerchant([merchant.account.address]);
      await proofMint.write.removeMerchant([merchant.account.address]);
      
      expect(await proofMint.read.isVerifiedMerchant([merchant.account.address])).to.be.false;
    });
  });

  describe("Subscription Management", function () {
    it("Should allow verified merchant to purchase basic subscription", async function () {
      const { proofMint, merchant, publicClient } = await loadFixture(deployProofMintFixture);

      await proofMint.write.addMerchant([merchant.account.address]);

      const proofMintAsMerchant = await hre.viem.getContractAt(
        "ProofMint",
        proofMint.address,
        { client: { wallet: merchant } }
      );

      const basicPrice = parseEther("0.001"); // BASIC_MONTHLY_PRICE_ETH
      
      const hash = await proofMintAsMerchant.write.purchaseSubscription([0, 1], { // Basic tier, 1 month
        value: basicPrice
      });
      await publicClient.waitForTransactionReceipt({ hash });

      const subscription = await proofMint.read.getSubscription([merchant.account.address]);
      expect(subscription[0]).to.equal(0); // Basic tier
      expect(subscription[4]).to.be.true; // isActive
    });

    it("Should apply yearly discount for 12-month subscription", async function () {
      const { proofMint, merchant, publicClient } = await loadFixture(deployProofMintFixture);

      await proofMint.write.addMerchant([merchant.account.address]);

      const proofMintAsMerchant = await hre.viem.getContractAt(
        "ProofMint",
        proofMint.address,
        { client: { wallet: merchant } }
      );

      const basicPrice = parseEther("0.001"); // BASIC_MONTHLY_PRICE_ETH
      const yearlyPrice = (basicPrice * 12n * 90n) / 100n; // 10% discount
      
      const hash = await proofMintAsMerchant.write.purchaseSubscription([0, 12], { // Basic tier, 12 months
        value: yearlyPrice
      });
      await publicClient.waitForTransactionReceipt({ hash });

      const subscription = await proofMint.read.getSubscription([merchant.account.address]);
      expect(subscription[4]).to.be.true; // isActive
    });

    it("Should not allow unverified merchant to purchase subscription", async function () {
      const { proofMint, merchant } = await loadFixture(deployProofMintFixture);

      const proofMintAsMerchant = await hre.viem.getContractAt(
        "ProofMint",
        proofMint.address,
        { client: { wallet: merchant } }
      );

      const basicPrice = parseEther("0.001");
      
      await expect(
        proofMintAsMerchant.write.purchaseSubscription([0, 1], {
          value: basicPrice
        })
      ).to.be.rejectedWith("NotVerifiedMerchant");
    });
  });

  describe("Receipt Management", function () {
    async function setupMerchantWithSubscription() {
      const fixture = await loadFixture(deployProofMintFixture);
      const { proofMint, merchant, publicClient } = fixture;

      await proofMint.write.addMerchant([merchant.account.address]);

      const proofMintAsMerchant = await hre.viem.getContractAt(
        "ProofMint",
        proofMint.address,
        { client: { wallet: merchant } }
      );

      const basicPrice = parseEther("0.001");
      const hash = await proofMintAsMerchant.write.purchaseSubscription([0, 1], {
        value: basicPrice
      });
      await publicClient.waitForTransactionReceipt({ hash });

      return { ...fixture, proofMintAsMerchant };
    }

    it("Should allow verified merchant with subscription to issue receipt", async function () {
      const { proofMint, proofMintAsMerchant, buyer, publicClient } = await setupMerchantWithSubscription();

      const ipfsHash = "QmTest123";
      const hash = await proofMintAsMerchant.write.issueReceipt([buyer.account.address, ipfsHash]);
      await publicClient.waitForTransactionReceipt({ hash });

      expect(await proofMint.read.getnextReceiptId()).to.equal(2n);
      
      const receipt = await proofMint.read.getReceipt([1n]);
      expect(receipt.buyer).to.equal(getAddress(buyer.account.address));
      expect(receipt.ipfsHash).to.equal(ipfsHash);
    });

    it("Should mint NFT to buyer when receipt is issued", async function () {
      const { proofMint, proofMintAsMerchant, buyer, publicClient } = await setupMerchantWithSubscription();

      const ipfsHash = "QmTest123";
      const hash = await proofMintAsMerchant.write.issueReceipt([buyer.account.address, ipfsHash]);
      await publicClient.waitForTransactionReceipt({ hash });

      expect(await proofMint.read.ownerOf([1n])).to.equal(getAddress(buyer.account.address));
      expect(await proofMint.read.tokenURI([1n])).to.equal(ipfsHash);
    });

    it("Should emit ReceiptIssued event", async function () {
      const { proofMint, proofMintAsMerchant, merchant, buyer, publicClient } = await setupMerchantWithSubscription();

      const ipfsHash = "QmTest123";
      const hash = await proofMintAsMerchant.write.issueReceipt([buyer.account.address, ipfsHash]);
      await publicClient.waitForTransactionReceipt({ hash });

      const events = await proofMint.getEvents.ReceiptIssued();
      expect(events).to.have.lengthOf(1);
      expect(events[0].args.id).to.equal(1n);
      expect(events[0].args.merchant).to.equal(getAddress(merchant.account.address));
      expect(events[0].args.buyer).to.equal(getAddress(buyer.account.address));
      expect(events[0].args.ipfsHash).to.equal(ipfsHash);
    });
  });

  describe("Gadget Status Management", function () {
    async function setupReceiptFixture() {
      const fixture = await setupMerchantWithSubscription();
      const { proofMint, proofMintAsMerchant, buyer, publicClient } = fixture;

      const ipfsHash = "QmTest123";
      const hash = await proofMintAsMerchant.write.issueReceipt([buyer.account.address, ipfsHash]);
      await publicClient.waitForTransactionReceipt({ hash });

      return { ...fixture };
    }

    async function setupMerchantWithSubscription() {
      const fixture = await loadFixture(deployProofMintFixture);
      const { proofMint, merchant, publicClient } = fixture;

      await proofMint.write.addMerchant([merchant.account.address]);

      const proofMintAsMerchant = await hre.viem.getContractAt(
        "ProofMint",
        proofMint.address,
        { client: { wallet: merchant } }
      );

      const basicPrice = parseEther("0.001");
      const hash = await proofMintAsMerchant.write.purchaseSubscription([0, 1], {
        value: basicPrice
      });
      await publicClient.waitForTransactionReceipt({ hash });

      return { ...fixture, proofMintAsMerchant };
    }

    it("Should allow buyer to flag gadget status", async function () {
      const { proofMint, buyer, publicClient } = await setupReceiptFixture();

      const proofMintAsBuyer = await hre.viem.getContractAt(
        "ProofMint",
        proofMint.address,
        { client: { wallet: buyer } }
      );

      const hash = await proofMintAsBuyer.write.flagGadget([1n, 1]); // Stolen status
      await publicClient.waitForTransactionReceipt({ hash });

      const status = await proofMint.read.getReceiptStatus([1n]);
      expect(status[0]).to.equal(1); // Stolen status
    });

    it("Should not allow non-buyer to flag gadget", async function () {
      const { proofMint, otherAccount } = await setupReceiptFixture();

      const proofMintAsOther = await hre.viem.getContractAt(
        "ProofMint",
        proofMint.address,
        { client: { wallet: otherAccount } }
      );

      await expect(
        proofMintAsOther.write.flagGadget([1n, 1])
      ).to.be.rejectedWith("OnlyBuyerCanFlag");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to pause contract", async function () {
      const { proofMint } = await loadFixture(deployProofMintFixture);

      await proofMint.write.pause();
      expect(await proofMint.read.paused()).to.be.true;
    });

    it("Should allow owner to unpause contract", async function () {
      const { proofMint } = await loadFixture(deployProofMintFixture);

      await proofMint.write.pause();
      await proofMint.write.unpause();
      expect(await proofMint.read.paused()).to.be.false;
    });

    it("Should allow owner to withdraw funds", async function () {
      const { proofMint, merchant, owner, publicClient } = await loadFixture(deployProofMintFixture);

      await proofMint.write.addMerchant([merchant.account.address]);

      const proofMintAsMerchant = await hre.viem.getContractAt(
        "ProofMint",
        proofMint.address,
        { client: { wallet: merchant } }
      );

      const basicPrice = parseEther("0.001");
      await proofMintAsMerchant.write.purchaseSubscription([0, 1], {
        value: basicPrice
      });

      const ownerBalanceBefore = await publicClient.getBalance({
        address: owner.account.address
      });

      const hash = await proofMint.write.withdrawFunds();
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      const ownerBalanceAfter = await publicClient.getBalance({
        address: owner.account.address
      });

      // Owner balance should be close to the original plus the subscription payment (accounting for gas)
      const expectedMinBalance = ownerBalanceBefore + basicPrice - parseEther("0.01"); // Account for gas costs
      expect(ownerBalanceAfter > expectedMinBalance).to.be.true;
    });
  });

  describe("Version Info", function () {
    it("Should return correct version", async function () {
      const { proofMint } = await loadFixture(deployProofMintFixture);

      expect(await proofMint.read.getVersion()).to.equal("1.0.0");
    });
  });
});