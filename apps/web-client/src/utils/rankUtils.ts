interface RankDefinition {
  readonly keywords: readonly string[];
  readonly badgePath: string;
  readonly displayName: string;
}

const DEFAULT_BADGE_PATH = "/ranks/user.png";
const DEFAULT_DISPLAY_NAME = "Usuario";

const RANK_DEFINITIONS: readonly RankDefinition[] = [
  {
    keywords: ["neroferno"],
    badgePath: "/ranks/rank-neroferno.png",
    displayName: "Neroferno",
  },
  {
    keywords: ["killu"],
    badgePath: "/ranks/rank-killu.png",
    displayName: "Killuwu",
  },
  {
    keywords: ["fundador", "founder"],
    badgePath: "/ranks/rank-fundador.png",
    displayName: "Fundador",
  },
  {
    keywords: ["donador", "donor"],
    badgePath: "/ranks/rank-donador.png",
    displayName: "Donador",
  },
  {
    keywords: ["developer", "dev"],
    badgePath: "/ranks/developer.png",
    displayName: "Developer",
  },
  {
    keywords: ["admin"],
    badgePath: "/ranks/admin.png",
    displayName: "Admin",
  },
  {
    keywords: ["staff"],
    badgePath: "/ranks/staff.png",
    displayName: "Staff",
  },
  {
    keywords: ["mod"],
    badgePath: "/ranks/moderator.png",
    displayName: "Moderador",
  },
  {
    keywords: ["helper"],
    badgePath: "/ranks/helper.png",
    displayName: "Helper",
  },
];

const findRankDefinition = (role?: string): RankDefinition | undefined => {
  if (!role) {
    return undefined;
  }

  const normalizedRole = role.toLowerCase().trim();
  return RANK_DEFINITIONS.find((def) =>
    def.keywords.some((keyword) => normalizedRole.includes(keyword))
  );
};

export const getRankBadgePath = (role?: string): string => {
  const rank = findRankDefinition(role);
  return rank?.badgePath ?? DEFAULT_BADGE_PATH;
};

export const getRankDisplayName = (role?: string): string => {
  if (!role) {
    return DEFAULT_DISPLAY_NAME;
  }

  const rank = findRankDefinition(role);
  if (rank) {
    return rank.displayName;
  }

  return role.charAt(0).toUpperCase() + role.slice(1);
};