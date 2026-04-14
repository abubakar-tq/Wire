// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IMatchRegistry} from "./interfaces/IMatchRegistry.sol";
import {MAX_PLAYERS_PER_MATCH, MatchInfo, MatchStatus, PlayerStats} from "./types/Structs.sol";
import {
    DuplicatePlayer,
    InvalidArrayLength,
    MatchNotFound,
    PlayerNotAllowed,
    StatsAlreadySubmitted,
    TooManyPlayers,
    ZeroAddress
} from "./errors/Errors.sol";
import {MatchStatsSubmitted, PlayerPointsComputed} from "./events/Events.sol";
import {ScoringRules} from "./lib/ScoringRules.sol";

contract ScoreManager is AccessControl {
    bytes32 public constant SCORE_PUBLISHER_ROLE = keccak256("SCORE_PUBLISHER_ROLE");

    // Public getter keeps the integration-facing name from the design.
    // forge-lint: disable-next-line(screaming-snake-case-immutable)
    IMatchRegistry public immutable matchRegistry;

    mapping(uint256 => mapping(uint16 => PlayerStats)) private _rawStatsByMatch;
    mapping(uint256 => mapping(uint16 => int32)) private _playerPointsByMatch;
    mapping(uint256 => bool) private _statsSubmitted;

    constructor(IMatchRegistry registry) {
        if (address(registry) == address(0)) revert ZeroAddress();
        matchRegistry = registry;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function submitMatchStats(uint256 matchId, uint16[] calldata playerIds, PlayerStats[] calldata stats)
        external
        onlyRole(SCORE_PUBLISHER_ROLE)
    {
        MatchInfo memory info = matchRegistry.getMatch(matchId);
        if (!info.exists) revert MatchNotFound();
        if (_statsSubmitted[matchId]) revert StatsAlreadySubmitted(matchId);
        if (playerIds.length == 0 || playerIds.length != stats.length) revert InvalidArrayLength();
        if (playerIds.length > MAX_PLAYERS_PER_MATCH) revert TooManyPlayers();

        _statsSubmitted[matchId] = true;
        for (uint256 i = 0; i < playerIds.length; ++i) {
            uint16 playerId = playerIds[i];
            if (!matchRegistry.isPlayerAllowed(matchId, playerId)) revert PlayerNotAllowed(matchId, playerId);
            for (uint256 j = 0; j < i; ++j) {
                if (playerIds[j] == playerId) revert DuplicatePlayer(playerId);
            }

            PlayerStats calldata playerStats = stats[i];
            int32 points = ScoringRules.calculate(playerStats);
            _rawStatsByMatch[matchId][playerId] = playerStats;
            _playerPointsByMatch[matchId][playerId] = points;
            emit PlayerPointsComputed(matchId, playerId, points);
        }

        matchRegistry.updateMatchStatus(matchId, MatchStatus.StatsSubmitted);
        emit MatchStatsSubmitted(matchId, playerIds.length);
    }

    function getPlayerPoints(uint256 matchId, uint16 playerId) external view returns (int32) {
        return _playerPointsByMatch[matchId][playerId];
    }

    function getPlayerStats(uint256 matchId, uint16 playerId) external view returns (PlayerStats memory) {
        return _rawStatsByMatch[matchId][playerId];
    }

    function hasStats(uint256 matchId) external view returns (bool) {
        return _statsSubmitted[matchId];
    }
}
