# mcp-theaudiodb

TheAudioDB MCP — community music metadata database.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_artist` | Search TheAudioDB for a music artist/band by name. Returns metadata: genre, style, mood, year formed, country, official website, English biography, and artist thumbnail image URL. Music-metadata lookup — complements MusicBrainz with biographies and artwork. |
| `search_album` | Search TheAudioDB for albums by artist (optionally narrowed to a specific album title). Returns album id, title, artist, release year, genre, album cover artwork URL, and English description. Omit the album arg to list all albums for the artist. |
| `get_artist` | Look up a single TheAudioDB artist by its idArtist (as returned by search_artist). Returns the same metadata fields as search_artist: genre, style, mood, formed year, country, website, biography, and thumbnail URL. |
| `get_album_tracks` | List all tracks on a TheAudioDB album by its idAlbum (as returned by search_album). Returns each track id, title, track number, duration in milliseconds, genre, and music-video URL when available. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "theaudiodb": {
      "url": "https://gateway.pipeworx.io/theaudiodb/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/theaudiodb/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Theaudiodb data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
