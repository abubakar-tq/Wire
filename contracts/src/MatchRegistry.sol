// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {
    AWAY_TEAM_SIDE,
    HOME_TEAM_SIDE,
    MAX_PLAYERS_PER_MATCH,
    MatchInfo,
    MatchStatus,
    PlayerMeta,
    RoleType
} from "./types/Structs.sol";
import {
    DuplicatePlayer,
    InvalidArrayLength,
    InvalidMatchId,
    InvalidMatchTiming,
    InvalidPlayerRole,
    InvalidStatusTransition,
    InvalidTeamSide,
    MatchAlreadyExists,
    MatchLocked,
    MatchNotFound,
    PlayerNotAllowed,
    TooManyPlayers
} from "./errors/Errors.sol";
import {MatchCreated, MatchPlayersSet, MatchStatusUpdated} from "./events/Events.sol";

contract MatchRegistry is AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant STATUS_UPDATER_ROLE = keccak256("STATUS_UPDATER_ROLE");

    mapping(uint256 => MatchInfo) private _matches;
    mapping(uint256 => mapping(uint16 => PlayerMeta)) private _matchPlayers;
    mapping(uint256 => uint16[]) private _matchPlayerIds;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    modifier onlyStatusUpdater() {
        _checkStatusUpdater();
        _;
    }

    function _checkStatusUpdater() internal view {
        if (!hasRole(OPERATOR_ROLE, msg.sender) && !hasRole(STATUS_UPDATER_ROLE, msg.sender)) {
            revert AccessControlUnauthorizedAccount(msg.sender, STATUS_UPDATER_ROLE);
        }
    }

    function createMatch(uint256 matchId, bytes32 homeTeam, bytes32 awayTeam, uint64 startTime, uint64 lockTime)
        external
        onlyRole(OPERATOR_ROLE)
    {
        if (matchId == 0) revert InvalidMatchId();
        if (_matches[matchId].exists) revert MatchAlreadyExists();
        if (lockTime <= block.timestamp || startTime <= lockTime) revert InvalidMatchTiming();

        _matches[matchId] = MatchInfo({
            startTime: startTime,
            lockTime: lockTime,
            status: MatchStatus.Scheduled,
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            exists: true
        });

        emit MatchCreated(matchId, homeTeam, awayTeam, startTime, lockTime, msg.sender);
    }

    function setMatchPlayers(
        uint256 matchId,
        uint16[] calldata playerIds,
        uint8[] calldata roles,
        uint8[] calldata teamSides
    ) external onlyRole(OPERATOR_ROLE) {
        _requireMatch(matchId);
        if (isLocked(matchId)) revert MatchLocked(matchId);
        if (playerIds.length == 0 || playerIds.length != roles.length || playerIds.length != teamSides.length) {
            revert InvalidArrayLength();
        }
        if (playerIds.length > MAX_PLAYERS_PER_MATCH) revert TooManyPlayers();

        uint16[] storage previousIds = _matchPlayerIds[matchId];
        for (uint256 i = 0; i < previousIds.length; ++i) {
            delete _matchPlayers[matchId][previousIds[i]];
        }
        delete _matchPlayerIds[matchId];

        for (uint256 i = 0; i < playerIds.length; ++i) {
            uint16 playerId = playerIds[i];
            if (playerId == 0) revert PlayerNotAllowed(matchId, playerId);
            if (roles[i] > uint8(RoleType.BOWL)) revert InvalidPlayerRole();
            if (teamSides[i] != HOME_TEAM_SIDE && teamSides[i] != AWAY_TEAM_SIDE) revert InvalidTeamSide();

            for (uint256 j = 0; j < i; ++j) {
                if (playerIds[j] == playerId) revert DuplicatePlayer(playerId);
            }

            _matchPlayers[matchId][playerId] =
                PlayerMeta({playerId: playerId, role: roles[i], teamSide: teamSides[i], allowed: true});
            _matchPlayerIds[matchId].push(playerId);
        }

        emit MatchPlayersSet(matchId, playerIds.length, playerIds, roles, teamSides, msg.sender);
    }

    function updateMatchStatus(uint256 matchId, MatchStatus newStatus) external onlyStatusUpdater {
        MatchInfo storage info = _matches[matchId];
        if (!info.exists) revert MatchNotFound();
        MatchStatus previousStatus = info.status;
        if (!_isValidTransition(previousStatus, newStatus)) revert InvalidStatusTransition();

        info.status = newStatus;
        emit MatchStatusUpdated(matchId, previousStatus, newStatus, msg.sender);
    }

    function isLocked(uint256 matchId) public view returns (bool) {
        MatchInfo memory info = _matches[matchId];
        if (!info.exists) revert MatchNotFound();
        return block.timestamp >= info.lockTime || info.status != MatchStatus.Scheduled;
    }

    function isPlayerAllowed(uint256 matchId, uint16 playerId) external view returns (bool) {
        if (!_matches[matchId].exists) revert MatchNotFound();
        return _matchPlayers[matchId][playerId].allowed;
    }

    function getPlayerMeta(uint256 matchId, uint16 playerId) external view returns (PlayerMeta memory) {
        if (!_matches[matchId].exists) revert MatchNotFound();
        return _matchPlayers[matchId][playerId];
    }

    function getMatch(uint256 matchId) external view returns (MatchInfo memory) {
        MatchInfo memory info = _matches[matchId];
        if (!info.exists) revert MatchNotFound();
        return info;
    }

    function getMatchPlayerIds(uint256 matchId) external view returns (uint16[] memory) {
        if (!_matches[matchId].exists) revert MatchNotFound();
        return _matchPlayerIds[matchId];
    }

    function _requireMatch(uint256 matchId) private view {
        if (!_matches[matchId].exists) revert MatchNotFound();
    }

    function _isValidTransition(MatchStatus current, MatchStatus next) private pure returns (bool) {
        if (current == next || current == MatchStatus.Finalized || current == MatchStatus.Cancelled) {
            return false;
        }
        if (next == MatchStatus.Scheduled) {
            return false;
        }
        if (next == MatchStatus.Cancelled) {
            return true;
        }
        if (current == MatchStatus.Scheduled) {
            return next == MatchStatus.Locked || next == MatchStatus.StatsSubmitted;
        }
        if (current == MatchStatus.Locked) {
            return next == MatchStatus.StatsSubmitted;
        }
        if (current == MatchStatus.StatsSubmitted) {
            return next == MatchStatus.Finalized;
        }
        return false;
    }
}
