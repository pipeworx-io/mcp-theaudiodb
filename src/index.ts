interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * TheAudioDB MCP — community music metadata database.
 *
 * Artist bios/genres/formed-year/country, album info + artwork URLs, and track
 * listings. Complements MusicBrainz by adding artwork URLs and biographies.
 * Uses the free public test API key "2".
 */


const BASE = 'https://www.theaudiodb.com/api/v1/json/2';
const UA = 'pipeworx/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search_artist',
    description:
      'Search TheAudioDB for a music artist/band by name. Returns metadata: genre, style, mood, year formed, country, official website, English biography, and artist thumbnail image URL. Music-metadata lookup — complements MusicBrainz with biographies and artwork.',
    inputSchema: {
      type: 'object',
      properties: {
        artist: { type: 'string', description: 'Artist or band name, e.g. "Coldplay".' },
      },
      required: ['artist'],
    },
  },
  {
    name: 'search_album',
    description:
      'Search TheAudioDB for albums by artist (optionally narrowed to a specific album title). Returns album id, title, artist, release year, genre, album cover artwork URL, and English description. Omit the album arg to list all albums for the artist.',
    inputSchema: {
      type: 'object',
      properties: {
        artist: { type: 'string', description: 'Artist or band name, e.g. "Coldplay".' },
        album: { type: 'string', description: 'Optional album title to narrow the search, e.g. "Parachutes".' },
      },
      required: ['artist'],
    },
  },
  {
    name: 'get_artist',
    description:
      'Look up a single TheAudioDB artist by its idArtist (as returned by search_artist). Returns the same metadata fields as search_artist: genre, style, mood, formed year, country, website, biography, and thumbnail URL.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'TheAudioDB idArtist, e.g. "111239".' },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_album_tracks',
    description:
      'List all tracks on a TheAudioDB album by its idAlbum (as returned by search_album). Returns each track id, title, track number, duration in milliseconds, genre, and music-video URL when available.',
    inputSchema: {
      type: 'object',
      properties: {
        album_id: { type: 'string', description: 'TheAudioDB idAlbum, e.g. "2109615".' },
      },
      required: ['album_id'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  try {
    switch (name) {
      case 'search_artist': {
        const artist = reqStr(args, 'artist');
        const data = (await audioGet(`/search.php?s=${encodeURIComponent(artist)}`)) as { artists?: unknown };
        const list = data?.artists;
        if (!Array.isArray(list) || list.length === 0) return { found: false, artists: [] };
        return { found: true, artists: list.map(mapArtist) };
      }
      case 'search_album': {
        const artist = reqStr(args, 'artist');
        const album = optStr(args, 'album');
        let url = `/searchalbum.php?s=${encodeURIComponent(artist)}`;
        if (album) url += `&a=${encodeURIComponent(album)}`;
        const data = (await audioGet(url)) as { album?: unknown };
        const list = data?.album;
        if (!Array.isArray(list) || list.length === 0) return { found: false, albums: [] };
        return { found: true, albums: list.map(mapAlbum) };
      }
      case 'get_artist': {
        const id = reqStr(args, 'id');
        const data = (await audioGet(`/artist.php?i=${encodeURIComponent(id)}`)) as { artists?: unknown };
        const list = data?.artists;
        if (!Array.isArray(list) || list.length === 0) return { error: 'artist not found', id };
        return mapArtist(list[0]);
      }
      case 'get_album_tracks': {
        const albumId = reqStr(args, 'album_id');
        const data = (await audioGet(`/track.php?m=${encodeURIComponent(albumId)}`)) as { track?: unknown };
        const list = data?.track;
        if (!Array.isArray(list) || list.length === 0) return { found: false, tracks: [] };
        return { found: true, tracks: list.map(mapTrack) };
      }
      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

async function audioGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`TheAudioDB: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
}

function mapArtist(raw: unknown): Record<string, unknown> {
  const a = asRecord(raw);
  return {
    id: a.idArtist ?? null,
    name: a.strArtist ?? null,
    genre: a.strGenre ?? null,
    style: a.strStyle ?? null,
    mood: a.strMood ?? null,
    formedYear: a.intFormedYear ?? null,
    country: a.strCountry ?? null,
    website: a.strWebsite ?? null,
    // API exposes the English bio as strBiographyEN on some endpoints and
    // strBiography on others — accept either.
    biography: a.strBiographyEN ?? a.strBiography ?? null,
    thumb: a.strArtistThumb ?? null,
  };
}

function mapAlbum(raw: unknown): Record<string, unknown> {
  const a = asRecord(raw);
  return {
    id: a.idAlbum ?? null,
    title: a.strAlbum ?? null,
    artist: a.strArtist ?? null,
    year: a.intYearReleased ?? null,
    genre: a.strGenre ?? null,
    thumb: a.strAlbumThumb ?? null,
    // English description: strDescriptionEN on some endpoints, strDescription on others.
    description: a.strDescriptionEN ?? a.strDescription ?? null,
  };
}

function mapTrack(raw: unknown): Record<string, unknown> {
  const t = asRecord(raw);
  return {
    id: t.idTrack ?? null,
    title: t.strTrack ?? null,
    trackNumber: t.intTrackNumber ?? null,
    durationMs: t.intDuration ?? null,
    genre: t.strGenre ?? null,
    musicVideo: t.strMusicVid ?? null,
  };
}

function reqStr(args: Record<string, unknown>, key: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing or empty.`);
  return v.trim();
}

function optStr(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
