// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Importing OpenZeppelin's Ownable for access control, allowing only the contract owner to perform admin tasks.
import "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";

// ProofMint contract with Self Protocol human verification integration
// Enables decentralized tracking of gadget ownership and lifecycle with human verification
// It uses IPFS for immutable receipt metadata storage and enforces role-based access for merchants, buyers, and recyclers.
// This contract prioritizes security, transparency, and extensibility for supply chain use cases.
contract ProofMintWithSelfVerification is
    Ownable,
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    SelfVerificationRoot
{
    // Event to track successful human verifications
    event HumanVerificationCompleted(
        address indexed user,
        ISelfVerificationRoot.GenericDiscloseOutputV2 output,
        bytes userData
    );

    // Enum defining gadget lifecycle states for clear status tracking.
    enum GadgetStatus {
        Active, // 0 - Gadget is in normal use
        Stolen, // 1 - Gadget reported as stolen
        Misplaced, // 2 - Gadget reported as lost/misplaced
        Recycled // 3 - Gadget has been recycled
    }

    // Enum defining subscription tiers with different limits and pricing.
    enum SubscriptionTier {
        Basic, // 0 - Basic tier: 100 receipts/month
        Premium, // 1 - Premium tier: 500 receipts/month
        Enterprise // 2 - Enterprise tier: unlimited receipts
    }

    // Struct to store merchant subscription details.
    struct Subscription {
        SubscriptionTier tier; // Subscription tier level
        uint256 expiresAt; // Timestamp when subscription expires
        uint256 receiptsIssued; // Number of receipts issued this period
        uint256 lastResetTime; // Last time receipt counter was reset
        bool isActive; // Whether subscription is currently active
    }

    // Struct to store receipt details, linking ownership and metadata.
    struct Receipt {
        uint256 id; // Unique identifier for the receipt
        address merchant; // Address of the merchant issuing the receipt
        address buyer; // Address of the buyer/owner
        string ipfsHash; // IPFS hash storing receipt metadata (e.g., serial number, description)
        uint256 timestamp; // Creation timestamp of the receipt
        GadgetStatus gadgetStatus; // Current status of the gadget
        uint256 lastStatusUpdate; // Timestamp of the last status change
    }

    // Storage mappings for efficient data retrieval.
    mapping(address => bool) public verifiedMerchants; // Tracks verified merchants
    mapping(address => bool) public recyclers; // Tracks verified recyclers
    mapping(address => bool) public verifiedHumans; // Tracks human-verified users
    mapping(uint256 => Receipt) public receipts; // Maps receipt ID to receipt details
    mapping(address => uint256[]) public merchantReceipts; // Maps merchant to their issued receipt IDs
    mapping(address => uint256[]) public buyerReceipts; // Maps buyer to their purchased receipt IDs
    mapping(address => Subscription) public subscriptions;
    mapping(address => string) public merchantName;

    // Self Protocol verification configuration
    bytes32 public verificationConfigId;
    address public lastVerifiedUser;

    // USDC token address (Celo Alfajores testnet)
    IERC20 public constant USDC =
        IERC20(0x01C5C0122039549AD1493B8220cABEdD739BC44E);

    // Subscription pricing in USDC (6 decimals) - TESTNET PRICES
    uint256 public constant BASIC_MONTHLY_PRICE = 1 * 10 ** 6; // $1 USDC
    uint256 public constant PREMIUM_MONTHLY_PRICE = 1 * 10 ** 6; // $1 USDC
    uint256 public constant ENTERPRISE_MONTHLY_PRICE = 1 * 10 ** 6; // $1 USDC

    // ETH pricing (for backward compatibility) - TESTNET PRICES
    uint256 public constant BASIC_MONTHLY_PRICE_ETH = 0.0001 ether;
    uint256 public constant PREMIUM_MONTHLY_PRICE_ETH = 0.0001 ether;
    uint256 public constant ENTERPRISE_MONTHLY_PRICE_ETH = 0.0001 ether;

    // Receipt limits per subscription tier
    uint256 public constant BASIC_RECEIPT_LIMIT = 100;
    uint256 public constant PREMIUM_RECEIPT_LIMIT = 500;
    uint256 public constant GRACE_PERIOD = 7 days;
    uint256 public constant MONTHLY_DURATION = 30 days;

    uint256 public nextReceiptId;

    // Events
    event MerchantAdded(address indexed merchant);
    event MerchantRemoved(address indexed merchant);
    event RecyclerAdded(address indexed recycler);
    event RecyclerRemoved(address indexed recycler);
    event ReceiptIssued(
        uint256 indexed id,
        address indexed merchant,
        address indexed buyer,
        string ipfsHash
    );
    event GadgetStatusChanged(
        uint256 indexed receiptId,
        GadgetStatus newStatus,
        address updatedBy
    );
    event GadgetRecycled(uint256 indexed receiptId, address indexed recycler);
    event SubscriptionPurchased(
        address indexed merchant,
        SubscriptionTier tier,
        uint256 duration,
        uint256 expiresAt
    );
    event SubscriptionExpired(address indexed merchant);

    // Custom errors
    error NotVerifiedMerchant();
    error NotRecycler();
    error NotVerifiedHuman();
    error OnlyAdmin();
    error OnlyBuyerCanFlag();
    error InvalidReceipt();
    error SubscriptionInactive();
    error ReceiptLimitExceeded();
    error InvalidPayment();
    error InvalidDuration();
    error HumanVerificationRequired();

    /**
     * @notice Constructor for the contract
     * @param _identityVerificationHubV2Address The address of the Identity Verification Hub V2
     * @param _scope The scope of the contract
     * @param _verificationConfigId The configuration ID for the contract
     */
    constructor(
        address _identityVerificationHubV2Address,
        uint256 _scope,
        bytes32 _verificationConfigId
    )
        ERC721("Proofmint", "PFMT")
        Ownable(msg.sender)
        SelfVerificationRoot(_identityVerificationHubV2Address, _scope)
    {
        verificationConfigId = _verificationConfigId;
        nextReceiptId = 1;
    }

    /**
     * @notice Implementation of customVerificationHook
     * @dev This function is called by onVerificationSuccess after hub address validation
     * @param _output The verification output from the hub
     * @param _userData The user data passed through verification
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory _output,
        bytes memory _userData
    ) internal override {
        lastVerifiedUser = address(uint160(_output.userIdentifier));
        verifiedHumans[lastVerifiedUser] = true;

        emit HumanVerificationCompleted(lastVerifiedUser, _output, _userData);
    }

    function getConfigId(
        bytes32 _destinationChainId,
        bytes32 _userIdentifier,
        bytes memory _userDefinedData
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }

    /**
     * @notice Check if an address is a verified human
     */
    function isVerifiedHuman(address _user) external view returns (bool) {
        return verifiedHumans[_user];
    }

    function setConfigId(bytes32 _configId) external onlyOwner {
        verificationConfigId = _configId;
    }

    // Modifiers
    modifier onlyVerifiedMerchant() {
        if (!verifiedMerchants[msg.sender]) revert NotVerifiedMerchant();
        _;
    }

    modifier onlyRecycler() {
        if (!recyclers[msg.sender]) revert NotRecycler();
        _;
    }

    modifier onlyAdmin() {
        if (msg.sender != owner()) revert OnlyAdmin();
        _;
    }

    modifier onlyVerifiedHuman() {
        if (!verifiedHumans[msg.sender]) revert NotVerifiedHuman();
        _;
    }

    modifier requiresHumanVerification() {
        if (!verifiedHumans[msg.sender]) revert HumanVerificationRequired();
        _;
    }

    // Admin functions
    function addMerchant(address merchantAddr) external onlyAdmin {
        require(merchantAddr != address(0), "Invalid merchant address");
        require(!verifiedMerchants[merchantAddr], "Merchant already added");
        verifiedMerchants[merchantAddr] = true;
        emit MerchantAdded(merchantAddr);
    }

    function removeMerchant(address merchantAddr) external onlyAdmin {
        require(merchantAddr != address(0), "Invalid merchant address");
        require(verifiedMerchants[merchantAddr], "Merchant not found");
        verifiedMerchants[merchantAddr] = false;
        subscriptions[merchantAddr].isActive = false;
        emit MerchantRemoved(merchantAddr);
    }

    function addRecycler(address recycler) external onlyAdmin {
        require(recycler != address(0), "Invalid recycler address");
        require(!recyclers[recycler], "Recycler already added");
        recyclers[recycler] = true;
        emit RecyclerAdded(recycler);
    }

    function removeRecycler(address recycler) external onlyAdmin {
        require(recycler != address(0), "Invalid recycler address");
        require(recyclers[recycler], "Recycler not found");
        recyclers[recycler] = false;
        emit RecyclerRemoved(recycler);
    }

    // Subscription functions with human verification requirement
    function purchaseSubscription(
        SubscriptionTier tier,
        uint256 durationMonths
    ) external requiresHumanVerification {
        if (!verifiedMerchants[msg.sender]) revert NotVerifiedMerchant();
        if (durationMonths == 0 || durationMonths > 12)
            revert InvalidDuration();

        uint256 monthlyPrice = getSubscriptionPrice(tier);
        uint256 totalPrice = monthlyPrice * durationMonths;

        if (durationMonths == 12) {
            totalPrice = (totalPrice * 90) / 100; // 10% discount for yearly
        }

        // Transfer USDC from user to contract
        require(
            USDC.transferFrom(msg.sender, address(this), totalPrice),
            "USDC transfer failed"
        );

        uint256 newExpirationTime = block.timestamp +
            (durationMonths * MONTHLY_DURATION);

        subscriptions[msg.sender] = Subscription({
            tier: tier,
            expiresAt: newExpirationTime,
            receiptsIssued: 0,
            lastResetTime: block.timestamp,
            isActive: true
        });

        emit SubscriptionPurchased(
            msg.sender,
            tier,
            durationMonths,
            newExpirationTime
        );
    }

    function renewSubscription(
        uint256 durationMonths
    ) external requiresHumanVerification {
        if (!verifiedMerchants[msg.sender]) revert NotVerifiedMerchant();
        if (durationMonths == 0 || durationMonths > 12)
            revert InvalidDuration();

        Subscription storage sub = subscriptions[msg.sender];
        uint256 monthlyPrice = getSubscriptionPrice(sub.tier);
        uint256 totalPrice = monthlyPrice * durationMonths;

        if (durationMonths == 12) {
            totalPrice = (totalPrice * 90) / 100; // 10% discount for yearly
        }

        // Transfer USDC from user to contract
        require(
            USDC.transferFrom(msg.sender, address(this), totalPrice),
            "USDC transfer failed"
        );

        uint256 extensionBase = sub.expiresAt > block.timestamp
            ? sub.expiresAt
            : block.timestamp;
        sub.expiresAt = extensionBase + (durationMonths * MONTHLY_DURATION);
        sub.isActive = true;

        emit SubscriptionPurchased(
            msg.sender,
            sub.tier,
            durationMonths,
            sub.expiresAt
        );
    }

    function getSubscriptionPrice(
        SubscriptionTier tier
    ) internal pure returns (uint256) {
        if (tier == SubscriptionTier.Basic) return BASIC_MONTHLY_PRICE;
        if (tier == SubscriptionTier.Premium) return PREMIUM_MONTHLY_PRICE;
        return ENTERPRISE_MONTHLY_PRICE;
    }

    // Receipt functions with human verification requirement
    function issueReceipt(
        address buyer,
        string calldata ipfsHash
    )
        external
        onlyVerifiedMerchant
        requiresHumanVerification
        returns (uint256 id)
    {
        _checkSubscriptionAndLimits(msg.sender);

        id = nextReceiptId++;

        receipts[id] = Receipt({
            id: id,
            merchant: msg.sender,
            buyer: buyer,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            gadgetStatus: GadgetStatus.Active,
            lastStatusUpdate: block.timestamp
        });

        merchantReceipts[msg.sender].push(id);
        buyerReceipts[buyer].push(id);

        subscriptions[msg.sender].receiptsIssued++;
        _safeMint(buyer, id);
        _setTokenURI(id, ipfsHash);

        emit ReceiptIssued(id, msg.sender, buyer, ipfsHash);
    }

    function _checkSubscriptionAndLimits(address merchant) internal {
        Subscription storage sub = subscriptions[merchant];

        if (!sub.isActive) revert SubscriptionInactive();

        if (block.timestamp > sub.expiresAt + GRACE_PERIOD) {
            sub.isActive = false;
            emit SubscriptionExpired(merchant);
            revert SubscriptionInactive();
        }

        if (block.timestamp >= sub.lastResetTime + MONTHLY_DURATION) {
            sub.receiptsIssued = 0;
            sub.lastResetTime = block.timestamp;
        }

        if (
            sub.tier == SubscriptionTier.Basic &&
            sub.receiptsIssued >= BASIC_RECEIPT_LIMIT
        ) {
            revert ReceiptLimitExceeded();
        }
        if (
            sub.tier == SubscriptionTier.Premium &&
            sub.receiptsIssued >= PREMIUM_RECEIPT_LIMIT
        ) {
            revert ReceiptLimitExceeded();
        }
    }

    // Gadget status functions with human verification requirement
    function flagGadget(
        uint256 receiptId,
        GadgetStatus status
    ) external requiresHumanVerification {
        Receipt storage receipt = receipts[receiptId];
        if (receipt.merchant == address(0)) revert InvalidReceipt();
        if (receipt.buyer != msg.sender) revert OnlyBuyerCanFlag();

        receipt.gadgetStatus = status;
        receipt.lastStatusUpdate = block.timestamp;

        emit GadgetStatusChanged(receiptId, status, msg.sender);
    }

    function recycleGadget(
        uint256 receiptId
    ) external onlyRecycler requiresHumanVerification {
        Receipt storage receipt = receipts[receiptId];
        if (receipt.merchant == address(0)) revert InvalidReceipt();

        receipt.gadgetStatus = GadgetStatus.Recycled;
        receipt.lastStatusUpdate = block.timestamp;

        emit GadgetRecycled(receiptId, msg.sender);
        emit GadgetStatusChanged(receiptId, GadgetStatus.Recycled, msg.sender);
    }

    // View functions
    function getMerchantReceipts(
        address merchant
    ) external view returns (uint256[] memory) {
        return merchantReceipts[merchant];
    }

    function getUserReceipts(
        address user
    ) external view returns (uint256[] memory) {
        return buyerReceipts[user];
    }

    function viewAllReceipts()
        external
        view
        onlyAdmin
        returns (Receipt[] memory)
    {
        Receipt[] memory allReceipts = new Receipt[](nextReceiptId - 1);

        for (uint256 i = 1; i < nextReceiptId; i++) {
            allReceipts[i - 1] = receipts[i];
        }

        return allReceipts;
    }

    function getReceipt(
        uint256 receiptId
    ) external view returns (Receipt memory) {
        if (receipts[receiptId].merchant == address(0)) revert InvalidReceipt();
        return receipts[receiptId];
    }

    function getReceiptStatus(
        uint256 receiptId
    )
        external
        view
        returns (
            GadgetStatus status,
            address owner,
            address merchant,
            uint256 lastUpdate
        )
    {
        Receipt memory receipt = receipts[receiptId];
        if (receipt.merchant == address(0)) revert InvalidReceipt();

        return (
            receipt.gadgetStatus,
            receipt.buyer,
            receipt.merchant,
            receipt.lastStatusUpdate
        );
    }

    function isVerifiedMerchant(address merchant) external view returns (bool) {
        return verifiedMerchants[merchant];
    }

    function isRecycler(address recycler) external view returns (bool) {
        return recyclers[recycler];
    }

    function getTotalStats() external view returns (uint256 totalReceipts) {
        return (nextReceiptId - 1);
    }

    function getSubscription(
        address merchant
    )
        external
        view
        returns (
            SubscriptionTier tier,
            uint256 expiresAt,
            uint256 receiptsIssued,
            uint256 receiptsRemaining,
            bool isActive,
            bool isExpired
        )
    {
        Subscription memory sub = subscriptions[merchant];
        uint256 limit = sub.tier == SubscriptionTier.Basic
            ? BASIC_RECEIPT_LIMIT
            : sub.tier == SubscriptionTier.Premium
                ? PREMIUM_RECEIPT_LIMIT
                : 0;

        uint256 remaining = 0;
        if (sub.tier != SubscriptionTier.Enterprise) {
            remaining = limit > sub.receiptsIssued
                ? limit - sub.receiptsIssued
                : 0;
        }

        return (
            sub.tier,
            sub.expiresAt,
            sub.receiptsIssued,
            remaining,
            sub.isActive,
            block.timestamp > sub.expiresAt
        );
    }

    function getSubscriptionPricing()
        external
        pure
        returns (
            uint256 basicMonthly,
            uint256 premiumMonthly,
            uint256 enterpriseMonthly,
            uint256 yearlyDiscount
        )
    {
        return (
            BASIC_MONTHLY_PRICE,
            PREMIUM_MONTHLY_PRICE,
            ENTERPRISE_MONTHLY_PRICE,
            10
        );
    }

    function canIssueReceipts(address merchant) external view returns (bool) {
        if (!verifiedMerchants[merchant]) return false;
        if (!verifiedHumans[merchant]) return false; // Require human verification

        Subscription memory sub = subscriptions[merchant];
        if (!sub.isActive) return false;
        if (block.timestamp > sub.expiresAt + GRACE_PERIOD) return false;

        uint256 currentReceiptCount = sub.receiptsIssued;
        if (block.timestamp >= sub.lastResetTime + MONTHLY_DURATION) {
            currentReceiptCount = 0;
        }

        if (
            sub.tier == SubscriptionTier.Basic &&
            currentReceiptCount >= BASIC_RECEIPT_LIMIT
        ) {
            return false;
        }
        if (
            sub.tier == SubscriptionTier.Premium &&
            currentReceiptCount >= PREMIUM_RECEIPT_LIMIT
        ) {
            return false;
        }

        return true;
    }

    function getnextReceiptId() external view returns (uint256) {
        return nextReceiptId;
    }

    function getVersion() external pure returns (string memory) {
        return "2.0.0-with-self-verification";
    }

    // Merchant name functions
    function setMerchantName(
        string calldata name
    ) external onlyVerifiedMerchant requiresHumanVerification {
        merchantName[msg.sender] = name;
    }

    // Required overrides for multiple inheritance
    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Admin functions for emergency management
    function withdrawFunds() external onlyAdmin {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    function withdrawUSDC() external onlyAdmin {
        uint256 balance = USDC.balanceOf(address(this));
        require(balance > 0, "No USDC to withdraw");

        require(USDC.transfer(owner(), balance), "USDC transfer failed");
    }

    function pauseMerchantSubscription(
        address merchant,
        bool shouldPause
    ) external onlyAdmin {
        subscriptions[merchant].isActive = !shouldPause;
        if (shouldPause) {
            emit SubscriptionExpired(merchant);
        }
    }

    // Emergency function to manually verify humans (admin only)
    function emergencyVerifyHuman(address user) external onlyAdmin {
        verifiedHumans[user] = true;
    }

    // Emergency function to revoke human verification (admin only)
    function revokeHumanVerification(address user) external onlyAdmin {
        verifiedHumans[user] = false;
    }
}
