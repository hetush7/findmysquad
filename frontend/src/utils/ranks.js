// Helpers for a room's optional rank range.
// session.minRank / session.maxRank are rank names, or null for "no limit".
// `ranks` is the game's rank list, lowest first (from /api/game-info).

export function rankRangeLabel(session) {
  const { minRank, maxRank } = session;
  if (!minRank && !maxRank) {
    return "Any rank";
  }
  if (minRank && maxRank) {
    return minRank === maxRank ? `${minRank} only` : `${minRank} – ${maxRank}`;
  }
  return minRank ? `${minRank}+` : `Up to ${maxRank}`;
}

// Whether a player of `rank` fits the room's range. Unknown ranks (e.g. renamed by an admin) don't restrict.
export function rankAllowed(session, ranks, rank) {
  const position = ranks.indexOf(rank);
  const min = session.minRank ? ranks.indexOf(session.minRank) : -1;
  const max = session.maxRank ? ranks.indexOf(session.maxRank) : -1;
  if (position === -1) {
    return true;
  }
  if (min !== -1 && position < min) {
    return false;
  }
  if (max !== -1 && position > max) {
    return false;
  }
  return true;
}
