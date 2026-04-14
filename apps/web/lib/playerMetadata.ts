export type PlayerMetadata = {
  id: number;
  name: string;
  team?: string;
  imageUrl?: string;
};

const playerImagePath = (id: number) => `/players/${id}.png`;

export const PLAYER_METADATA: PlayerMetadata[] = [
  { id: 1, name: "Ishan Kishan", team: "KK", imageUrl: playerImagePath(1) },
  { id: 2, name: "Rohit Sharma", team: "KK", imageUrl: playerImagePath(2) },
  { id: 3, name: "Suryakumar Yadav", team: "KK", imageUrl: playerImagePath(3) },
  { id: 4, name: "Jos Buttler", team: "KK", imageUrl: playerImagePath(4) },
  { id: 5, name: "Hardik Pandya", team: "KK", imageUrl: playerImagePath(5) },
  { id: 6, name: "Jasprit Bumrah", team: "KK", imageUrl: playerImagePath(6) },
  { id: 7, name: "Sanju Samson", team: "LQ", imageUrl: playerImagePath(7) },
  { id: 8, name: "Yuzvendra Chahal", team: "LQ", imageUrl: playerImagePath(8) },
  { id: 9, name: "Virat Kohli", team: "LQ", imageUrl: playerImagePath(9) },
  { id: 10, name: "Axar Patel", team: "LQ", imageUrl: playerImagePath(10) },
  { id: 11, name: "Rishabh Pant", team: "LQ", imageUrl: playerImagePath(11) }
];

const PLAYER_METADATA_BY_ID = new Map(PLAYER_METADATA.map((player) => [player.id, player]));

export function getPlayerMetadata(playerId: number): PlayerMetadata | undefined {
  return PLAYER_METADATA_BY_ID.get(playerId);
}
