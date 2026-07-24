const LEAGUES = [
  { key: 'NFL', sport: 'football', league: 'nfl' },
  { key: 'NHL', sport: 'hockey', league: 'nhl' },
  { key: 'MLB', sport: 'baseball', league: 'mlb' },
  { key: 'NBA', sport: 'basketball', league: 'nba' },
  { key: 'MLS', sport: 'soccer', league: 'usa.1' },
  { key: 'UFC', sport: 'mma', league: 'ufc' },
];

const MLB_TEAMS = ['Blue Jays', 'Mariners'];
const FEATURED_KEYWORDS = ['Vancouver', 'Seattle Seahawks', 'Blue Jays', 'Mariners'];

function formatDateYYYYMMDD(d) {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function pacificParts(iso) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Vancouver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso));
}

function pacificDate(iso) {
  const p = pacificParts(iso);
  const y = p.find((x) => x.type === 'year').value;
  const m = p.find((x) => x.type === 'month').value;
  const d = p.find((x) => x.type === 'day').value;
  return `${y}-${m}-${d}`;
}

function pacificHour(iso) {
  const p = pacificParts(iso);
  return parseInt(p.find((x) => x.type === 'hour').value, 10);
}

function pacificTime(iso) {
  return new Date(iso).toLocaleTimeString('en-CA', {
    timeZone: 'America/Vancouver',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function pacificDateLong(iso) {
  return new Date(iso).toLocaleDateString('en-CA', {
    timeZone: 'America/Vancouver',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.json();
}

function isCompleted(event) {
  const status = event.status && event.status.type && event.status.type.name;
  return status && /final|post|cancelled/i.test(status);
}

function normalizeEspnEvent(event, leagueKey) {
  const comp = event.competitions && event.competitions[0];
  if (!comp) return null;
  const teams = comp.competitors || [];
  const home = teams.find((t) => t.homeAway === 'home');
  const away = teams.find((t) => t.homeAway === 'away');
  const homeTeam = home ? home.team : {};
  const awayTeam = away ? away.team : {};
  const displayName = event.name || `${awayTeam.displayName || 'TBD'} at ${homeTeam.displayName || 'TBD'}`;

  // MLB filter: only Blue Jays / Mariners
  if (leagueKey === 'MLB') {
    const names = `${homeTeam.displayName || ''} ${awayTeam.displayName || ''}`;
    if (!MLB_TEAMS.some((t) => names.includes(t))) return null;
  }

  // Remove games before 11 AM Pacific
  if (pacificHour(event.date) < 11) return null;

  const namesLower = displayName.toLowerCase();
  const featured = FEATURED_KEYWORDS.some((k) => namesLower.includes(k.toLowerCase()));

  return {
    id: event.id,
    league: leagueKey,
    name: displayName,
    startTimeISO: event.date,
    pacificDate: pacificDate(event.date),
    pacificTime: pacificTime(event.date),
    pacificDateLong: pacificDateLong(event.date),
    homeTeam: homeTeam.displayName || 'TBD',
    awayTeam: awayTeam.displayName || 'TBD',
    homeLogo: homeTeam.logo || '',
    awayLogo: awayTeam.logo || '',
    venue: comp.venue && comp.venue.fullName ? comp.venue.fullName : '',
    featured,
    reserveUrl: '/contact.html',
  };
}

async function fetchEspn(leagueKey, sport, league, start, end) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard?dates=${start}-${end}&limit=100`;
  const data = await fetchJson(url);
  return (data.events || [])
    .filter((e) => !isCompleted(e))
    .map((e) => normalizeEspnEvent(e, leagueKey))
    .filter(Boolean);
}

async function fetchF1(year, now) {
  try {
    const data = await fetchJson(`https://api.jolpi.ca/ergast/f1/${year}.json`);
    const races = data.MRData.RaceTable.Races || [];
    return races
      .map((r) => {
        const iso = `${r.date}T${r.time || '00:00:00Z'}`;
        if (new Date(iso) < now) return null;
        if (pacificHour(iso) < 11) return null;
        return {
          id: `f1-${r.round}`,
          league: 'F1',
          name: r.raceName,
          startTimeISO: iso,
          pacificDate: pacificDate(iso),
          pacificTime: pacificTime(iso),
          pacificDateLong: pacificDateLong(iso),
          homeTeam: r.Circuit.circuitName,
          awayTeam: r.Circuit.Location.country,
          homeLogo: '',
          awayLogo: '',
          venue: r.Circuit.circuitName,
          featured: false,
          reserveUrl: '/contact.html',
        };
      })
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}

module.exports = async (req, res) => {
  const now = new Date();
  const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const end = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
  const startStr = formatDateYYYYMMDD(start);
  const endStr = formatDateYYYYMMDD(end);

  const espnResults = await Promise.allSettled(
    LEAGUES.map((l) => fetchEspn(l.key, l.sport, l.league, startStr, endStr))
  );

  let games = [];
  espnResults.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      games = games.concat(r.value);
    }
  });

  const f1Games = await fetchF1(now.getUTCFullYear(), now);
  games = games.concat(f1Games);

  // Sort by start time
  games.sort((a, b) => new Date(a.startTimeISO) - new Date(b.startTimeISO));

  // Bucket by Pacific date
  const todayStr = pacificDate(now.toISOString());
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = pacificDate(tomorrow.toISOString());

  const today = [];
  const tomorrowList = [];
  const thisWeek = [];

  games.forEach((g) => {
    if (g.pacificDate === todayStr) today.push(g);
    else if (g.pacificDate === tomorrowStr) tomorrowList.push(g);
    else thisWeek.push(g);
  });

  // Featured first within each bucket
  const sortFeatured = (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  today.sort(sortFeatured);
  tomorrowList.sort(sortFeatured);
  thisWeek.sort(sortFeatured);

  const payload = {
    generatedAt: now.toISOString(),
    today,
    tomorrow: tomorrowList,
    thisWeek,
    all: games,
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=1800, stale-while-revalidate=3600');
  res.status(200).json(payload);
};
