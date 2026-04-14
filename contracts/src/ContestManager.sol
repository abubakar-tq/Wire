// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IFantasyTeamNFT} from "./interfaces/IFantasyTeamNFT.sol";
import {ILegacyPassport} from "./interfaces/ILegacyPassport.sol";
import {IMatchRegistry} from "./interfaces/IMatchRegistry.sol";
import {IScoreManager} from "./interfaces/IScoreManager.sol";
import {
    Entry,
    Contest,
    MAX_ENTRIES_PER_CONTEST,
    MAX_ENTRIES_PER_WALLET,
    MIN_ENTRIES_TO_FINALIZE,
    MatchInfo,
    MatchStatus,
    Squad
} from "./types/Structs.sol";
import {
    ContestAlreadyExists,
    ContestCancelled,
    ContestFinalizedAlready,
    ContestFull,
    ContestNotFound,
    InvalidContestConfig,
    InvalidContestId,
    MatchAlreadyHasContest,
    MatchLocked,
    NativeTransferFailed,
    NoRefund,
    NoReward,
    NoTreasuryBalance,
    NotEnoughEntries,
    SquadMatchMismatch,
    StatsNotSubmitted,
    WalletEntryLimitReached,
    WrongEntryFee,
    ZeroAddress
} from "./errors/Errors.sol";
import {
    ContestCancelled as ContestCancelledEvent,
    ContestCreated,
    ContestFinalized,
    ContestJoined,
    RefundClaimed,
    RewardClaimed,
    TreasuryClaimed,
    TreasuryUpdated
} from "./events/Events.sol";

contract ContestManager is AccessControl, ReentrancyGuard {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Public getters keep the integration-facing names from the design.
    // forge-lint: disable-next-line(screaming-snake-case-immutable)
    IMatchRegistry public immutable matchRegistry;
    // forge-lint: disable-next-line(screaming-snake-case-immutable)
    IFantasyTeamNFT public immutable fantasyTeamNFT;
    // forge-lint: disable-next-line(screaming-snake-case-immutable)
    IScoreManager public immutable scoreManager;
    // forge-lint: disable-next-line(screaming-snake-case-immutable)
    ILegacyPassport public immutable legacyPassport;

    address public treasury;
    uint256 public treasuryClaimable;

    mapping(uint256 => Contest) private _contests;
    mapping(uint256 => Entry[]) private _contestEntries;
    mapping(uint256 => mapping(uint256 => bool)) public tokenEntered;
    mapping(uint256 => mapping(address => uint8)) public entriesByWallet;
    mapping(address => uint256) public claimableRewards;
    mapping(address => uint256) public refundableEntries;
    mapping(uint256 => uint16[3]) private _winnerIndexes;
    mapping(uint256 => uint256[3]) private _winnerRewards;
    mapping(uint256 => uint256) public contestIdByMatch;

    constructor(IMatchRegistry registry, IFantasyTeamNFT teamNft, IScoreManager scores, ILegacyPassport passport) {
        if (
            address(registry) == address(0) || address(teamNft) == address(0) || address(scores) == address(0)
                || address(passport) == address(0)
        ) {
            revert ZeroAddress();
        }
        matchRegistry = registry;
        fantasyTeamNFT = teamNft;
        scoreManager = scores;
        legacyPassport = passport;
        treasury = msg.sender;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    function createContest(
        uint256 contestId,
        uint256 matchId,
        uint96 entryFee,
        uint16 maxEntries,
        uint8 maxEntriesPerWallet
    ) external onlyRole(OPERATOR_ROLE) {
        if (contestId == 0) revert InvalidContestId();
        if (_contests[contestId].exists) revert ContestAlreadyExists();
        MatchInfo memory info = matchRegistry.getMatch(matchId);
        if (!info.exists) revert ContestNotFound();
        if (matchRegistry.isLocked(matchId)) revert MatchLocked(matchId);
        if (contestIdByMatch[matchId] != 0) revert MatchAlreadyHasContest(matchId, contestIdByMatch[matchId]);
        if (
            entryFee == 0 || maxEntries == 0 || maxEntries > MAX_ENTRIES_PER_CONTEST || maxEntriesPerWallet == 0
                || maxEntriesPerWallet > MAX_ENTRIES_PER_WALLET || maxEntriesPerWallet > maxEntries
        ) {
            revert InvalidContestConfig();
        }

        _contests[contestId] = Contest({
            matchId: matchId,
            entryFee: entryFee,
            maxEntries: maxEntries,
            maxEntriesPerWallet: maxEntriesPerWallet,
            totalEntries: 0,
            finalized: false,
            cancelled: false,
            exists: true
        });
        contestIdByMatch[matchId] = contestId;

        emit ContestCreated(contestId, matchId, entryFee, maxEntries, maxEntriesPerWallet);
    }

    function joinContest(uint256 contestId, uint16[11] calldata playerIds, uint16 captainId, uint16 viceCaptainId)
        external
        payable
        nonReentrant
        returns (uint256 tokenId)
    {
        Contest storage contest = _requireContest(contestId);
        if (contest.finalized) revert ContestFinalizedAlready();
        if (contest.cancelled) revert ContestCancelled();
        if (msg.value != contest.entryFee) revert WrongEntryFee(contest.entryFee, msg.value);
        if (contest.totalEntries >= contest.maxEntries) revert ContestFull();
        if (entriesByWallet[contestId][msg.sender] >= contest.maxEntriesPerWallet) {
            revert WalletEntryLimitReached();
        }
        if (matchRegistry.isLocked(contest.matchId)) revert MatchLocked(contest.matchId);

        legacyPassport.mintIfNeeded(msg.sender);
        tokenId = fantasyTeamNFT.mintSquad(msg.sender, contest.matchId, playerIds, captainId, viceCaptainId);

        uint16 entryIndex = contest.totalEntries;
        _contestEntries[contestId].push(
            Entry({user: msg.sender, tokenId: tokenId, score: 0, joinedAt: uint64(block.timestamp)})
        );
        tokenEntered[contestId][tokenId] = true;
        unchecked {
            ++contest.totalEntries;
            ++entriesByWallet[contestId][msg.sender];
        }
        legacyPassport.recordEntry(msg.sender);

        emit ContestJoined(contestId, contest.matchId, msg.sender, tokenId, entryIndex);
    }

    function finalizeContest(uint256 contestId) external onlyRole(OPERATOR_ROLE) {
        Contest storage contest = _requireContest(contestId);
        if (contest.finalized) revert ContestFinalizedAlready();
        if (contest.cancelled) revert ContestCancelled();
        if (!scoreManager.hasStats(contest.matchId)) revert StatsNotSubmitted(contest.matchId);
        if (contest.totalEntries < MIN_ENTRIES_TO_FINALIZE) revert NotEnoughEntries();

        Entry[] storage entries = _contestEntries[contestId];
        uint16[3] memory topIndexes;
        bool[3] memory topSet;

        for (uint256 i = 0; i < entries.length; ++i) {
            int32 score = previewSquadScore(contest.matchId, entries[i].tokenId);
            entries[i].score = score;

            for (uint256 rank = 0; rank < 3; ++rank) {
                if (!topSet[rank] || _entryBeats(entries[i], entries[topIndexes[rank]])) {
                    for (uint256 shift = 2; shift > rank; --shift) {
                        topIndexes[shift] = topIndexes[shift - 1];
                        topSet[shift] = topSet[shift - 1];
                    }
                    // Safe because contest entries are capped at 25.
                    // forge-lint: disable-next-line(unsafe-typecast)
                    topIndexes[rank] = uint16(i);
                    topSet[rank] = true;
                    break;
                }
            }
        }

        uint256 pool = uint256(contest.entryFee) * contest.totalEntries;
        uint256 prizePool = (pool * 90) / 100;
        uint256 treasuryFee = pool - prizePool;
        uint256[3] memory rewards;
        rewards[0] = (prizePool * 50) / 100;
        rewards[1] = (prizePool * 30) / 100;
        rewards[2] = prizePool - rewards[0] - rewards[1];

        contest.finalized = true;
        _winnerIndexes[contestId] = topIndexes;
        _winnerRewards[contestId] = rewards;
        treasuryClaimable += treasuryFee;

        for (uint256 i = 0; i < 3; ++i) {
            address winner = entries[topIndexes[i]].user;
            claimableRewards[winner] += rewards[i];
            legacyPassport.recordWin(winner);
        }

        matchRegistry.updateMatchStatus(contest.matchId, MatchStatus.Finalized);
        emit ContestFinalized(contestId, contest.matchId, topIndexes, rewards, treasuryFee);
    }

    function cancelContest(uint256 contestId) external onlyRole(OPERATOR_ROLE) {
        Contest storage contest = _requireContest(contestId);
        if (contest.finalized) revert ContestFinalizedAlready();
        if (contest.cancelled) revert ContestCancelled();

        contest.cancelled = true;
        Entry[] storage entries = _contestEntries[contestId];
        for (uint256 i = 0; i < entries.length; ++i) {
            refundableEntries[entries[i].user] += contest.entryFee;
        }

        matchRegistry.updateMatchStatus(contest.matchId, MatchStatus.Cancelled);
        emit ContestCancelledEvent(contestId, contest.matchId, entries.length);
    }

    function claimReward() external nonReentrant {
        uint256 amount = claimableRewards[msg.sender];
        if (amount == 0) revert NoReward();
        claimableRewards[msg.sender] = 0;
        legacyPassport.recordRewardClaim(msg.sender, amount);
        _sendNative(msg.sender, amount);
        emit RewardClaimed(msg.sender, amount);
    }

    function claimRefund() external nonReentrant {
        uint256 amount = refundableEntries[msg.sender];
        if (amount == 0) revert NoRefund();
        refundableEntries[msg.sender] = 0;
        _sendNative(msg.sender, amount);
        emit RefundClaimed(msg.sender, amount);
    }

    function claimTreasury() external nonReentrant {
        if (msg.sender != treasury && !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert AccessControlUnauthorizedAccount(msg.sender, DEFAULT_ADMIN_ROLE);
        }
        uint256 amount = treasuryClaimable;
        if (amount == 0) revert NoTreasuryBalance();
        treasuryClaimable = 0;
        _sendNative(treasury, amount);
        emit TreasuryClaimed(treasury, amount);
    }

    function setTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newTreasury == address(0)) revert ZeroAddress();
        address previousTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(previousTreasury, newTreasury);
    }

    function getContest(uint256 contestId) external view returns (Contest memory) {
        return _contests[contestId];
    }

    function getEntry(uint256 contestId, uint256 entryIndex) external view returns (Entry memory) {
        return _contestEntries[contestId][entryIndex];
    }

    function getEntryCount(uint256 contestId) external view returns (uint256) {
        return _contestEntries[contestId].length;
    }

    function getContestEntries(uint256 contestId) external view returns (Entry[] memory) {
        return _contestEntries[contestId];
    }

    function getWinners(uint256 contestId) external view returns (uint16[3] memory, uint256[3] memory) {
        return (_winnerIndexes[contestId], _winnerRewards[contestId]);
    }

    function getClaimableReward(address user) external view returns (uint256) {
        return claimableRewards[user];
    }

    function getRefundableEntryAmount(address user) external view returns (uint256) {
        return refundableEntries[user];
    }

    function previewSquadScore(uint256 matchId, uint256 tokenId) public view returns (int32) {
        Squad memory squad = fantasyTeamNFT.getSquad(tokenId);
        if (squad.matchId != matchId) revert SquadMatchMismatch(matchId, squad.matchId);

        int256 total;
        int256 captainBase;
        int256 viceCaptainBase;

        for (uint256 i = 0; i < squad.playerIds.length; ++i) {
            int32 playerPoints = scoreManager.getPlayerPoints(matchId, squad.playerIds[i]);
            total += playerPoints;
            if (squad.playerIds[i] == squad.captainId) {
                captainBase = playerPoints;
            }
            if (squad.playerIds[i] == squad.viceCaptainId) {
                viceCaptainBase = playerPoints;
            }
        }

        // Safe because a squad has 11 players and each player score is bounded by PlayerStats field sizes.
        // forge-lint: disable-next-line(unsafe-typecast)
        return int32(total + captainBase + (viceCaptainBase / 2));
    }

    function _requireContest(uint256 contestId) private view returns (Contest storage contest) {
        contest = _contests[contestId];
        if (!contest.exists) revert ContestNotFound();
    }

    function _entryBeats(Entry storage candidate, Entry storage incumbent) private view returns (bool) {
        if (candidate.score != incumbent.score) {
            return candidate.score > incumbent.score;
        }
        if (candidate.joinedAt != incumbent.joinedAt) {
            return candidate.joinedAt < incumbent.joinedAt;
        }
        return candidate.tokenId < incumbent.tokenId;
    }

    function _sendNative(address to, uint256 amount) private {
        (bool success,) = to.call{value: amount}("");
        if (!success) revert NativeTransferFailed();
    }
}
