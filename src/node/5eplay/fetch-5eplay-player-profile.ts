const DEFAULT_AVATAR_URL = 'https://oss-arena.5eplay.com/images/default_avatar.png';

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Referer: 'https://arena.5eplay.com/',
};

export type FiveEPlayPlayerProfile = {
  username: string;
  avatarUrl: string;
};

type UserInterfaceHeaderResponseSuccess = {
  data: {
    header: {
      user_data: {
        avatar_url: string;
        username: string;
      };
    };
  };
};

async function fetchPlayerProfileFromHeader(playerId: string): Promise<FiveEPlayPlayerProfile | null> {
  const endpoints = [
    `https://gate.5eplay.com/userinterface/http/v1/userinterface/header/${playerId}`,
    `https://gate.5eplay.com/userinterface/pt/v1/userinterface/header/${playerId}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { headers: REQUEST_HEADERS });
      if (response.status !== 200) {
        continue;
      }

      const data: UserInterfaceHeaderResponseSuccess = await response.json();
      const userData = data.data.header.user_data;

      return {
        username: userData.username,
        avatarUrl: `https://oss-arena.5eplay.com/${userData.avatar_url}`,
      };
    } catch {
      continue;
    }
  }

  return null;
}

type MatchListResponse = {
  data: { match_id: string }[] | null;
};

type MatchDetailPlayer = {
  user_info: {
    user_data: {
      uuid: string;
      username: string;
      profile: {
        avatarUrl: string;
      };
    };
  };
};

type MatchDetailResponse = {
  data: {
    group_1: MatchDetailPlayer[];
    group_2: MatchDetailPlayer[];
  } | null;
};

async function fetchLastMatchId(playerId: string, csType: number): Promise<string | null> {
  const response = await fetch(
    `https://gate.5eplay.com/crane/http/api/data/match/list?uuid=${playerId}&limit=1&cs_type=${csType}`,
    { headers: REQUEST_HEADERS },
  );
  const data: MatchListResponse = await response.json();

  if (!data.data?.length) {
    return null;
  }

  return data.data[0].match_id;
}

async function fetchPlayerProfileFromMatch(playerId: string): Promise<FiveEPlayPlayerProfile | null> {
  const matchId = (await fetchLastMatchId(playerId, 0)) ?? (await fetchLastMatchId(playerId, 1));
  if (!matchId) {
    return null;
  }

  const response = await fetch(`https://gate.5eplay.com/crane/http/api/data/match/${matchId}`, {
    headers: REQUEST_HEADERS,
  });
  const data: MatchDetailResponse = await response.json();
  if (!data.data) {
    return null;
  }

  const player = [...data.data.group_1, ...data.data.group_2].find(
    (matchPlayer) => matchPlayer.user_info.user_data.uuid === playerId,
  );
  if (!player) {
    return null;
  }

  const userData = player.user_info.user_data;

  return {
    username: userData.username,
    avatarUrl: `https://oss-arena.5eplay.com/${userData.profile.avatarUrl}`,
  };
}

export async function fetch5EPlayPlayerProfile(playerId: string, domainId: string): Promise<FiveEPlayPlayerProfile> {
  const fromHeader = await fetchPlayerProfileFromHeader(playerId);
  if (fromHeader) {
    return fromHeader;
  }

  const fromMatch = await fetchPlayerProfileFromMatch(playerId);
  if (fromMatch) {
    return fromMatch;
  }

  return {
    username: domainId,
    avatarUrl: DEFAULT_AVATAR_URL,
  };
}
