# mcp-theaudiodb

TheAudioDB MCP — community music metadata database.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Theaudiodb data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
