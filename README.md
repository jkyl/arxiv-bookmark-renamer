# ArXiv Bookmark Renamer

A Chrome extension that automatically renames your arXiv bookmarks from catalog numbers to actual paper titles.

> **Disclaimer:** This extension was entirely "vibe-coded" with Claude 3.7 Sonnet. No actual programming experience was involved in its creation - just vibes and AI assistance. You can view the conversation that created this extension [here.](https://claude.ai/share/ad9914d4-500b-42b5-9cd0-80a75044eabf)

## Overview

If you've ever bookmarked arXiv papers, you've probably noticed that the default bookmark titles are just the arXiv ID numbers (like "2101.12345" or "cond-mat/0123456") rather than descriptive paper titles. This extension solves that problem by:

1. Finding all arXiv bookmarks in a folder you select
2. Looking up the actual paper titles using the arXiv API
3. Renaming your bookmarks to use those titles

## Features

- Simple user interface with folder selection dropdown
- Works with both abstract pages (arxiv.org/abs/...) and PDF links (arxiv.org/pdf/...)
- Handles both new-style IDs (2101.12345) and old-style category IDs (cond-mat/0123456)
- Shows real-time progress as bookmarks are processed
- Provides detailed logging of the renaming process
- Updates bookmarks in-place without requiring export/import

## Installation

### From Source Code

1. **Download the extension files**
   - Create a folder named "arxiv-bookmark-renamer" (or any name you prefer)
   - Save the three files (`manifest.json`, `popup.html`, `popup.js`) into this folder

2. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" using the toggle in the top-right corner
   - Click "Load unpacked"
   - Select the folder containing the extension files

## Usage

1. Click the extension icon in your Chrome toolbar
2. Select a bookmark folder containing arXiv bookmarks from the dropdown menu
3. Click the "Rename ArXiv Bookmarks" button
4. Wait as the extension processes each bookmark:
   - The progress bar shows completion status
   - The log window shows details about each bookmark being processed
5. When complete, you'll see a summary of how many bookmarks were modified

## How It Works

The extension:

1. Uses the Chrome Bookmarks API to access your bookmarks
2. Identifies arXiv links by looking for URLs containing "arxiv.org"
3. Extracts the arXiv ID from each bookmark URL
4. Checks if the current bookmark title looks like an arXiv ID (rather than a paper title)
5. Queries the arXiv API (http://export.arxiv.org/api/query) to fetch the paper's metadata
6. Updates the bookmark title with the paper's actual title
7. Keeps all other bookmarks unchanged

## Limitations

- The extension processes bookmarks at a rate of approximately one per second to avoid overloading the arXiv API
- Only bookmarks whose titles look like arXiv IDs will be renamed (to avoid overwriting custom titles)
- Requires internet connection to fetch paper titles from the arXiv API

## Troubleshooting

- **Extension doesn't appear in toolbar**: Click the puzzle piece icon in Chrome to see all extensions, then pin the ArXiv Bookmark Renamer
- **No folders in dropdown**: Make sure you have at least one bookmark folder in Chrome
- **API errors**: Check your internet connection; the extension needs to connect to export.arxiv.org

## Privacy

- This extension only accesses your bookmarks and the arXiv API
- No data is sent anywhere except to the official arXiv API to retrieve paper titles
- All processing happens locally in your browser

## License

MIT License

## Acknowledgments

- Uses the public arXiv API for metadata retrieval