# Content Extraction Scripts

Automated Puppeteer scripts for extracting content from the Paolo Mascatelli Squarespace website.

## Prerequisites

Make sure you have Node.js and npm installed, then install dependencies:

```bash
npm install
```

## Scripts Overview

### 1. `extract-all.js` (Recommended)
Runs all extraction scripts in sequence. This is the easiest way to extract everything.

```bash
npm run scrape:all
```

### 2. `extract-content.js`
Extracts text content, headings, paragraphs, links, forms, and metadata from all pages.

**Output:**
- `assets/content/site-content.json` - Full site content in JSON format
- `assets/content/*.md` - Individual markdown files for each page

```bash
npm run scrape:content
```

### 3. `analyze-galleries.js`
Analyzes gallery structures, categories, filter buttons, and toggle systems.

**Output:**
- `assets/content/gallery-structure.json` - Gallery analysis
- `assets/content/webflow-cms-structure.json` - CMS recommendations

```bash
npm run scrape:galleries
```

### 4. `map-urls.js`
Creates URL mappings for 301 redirects from Squarespace to Webflow.

**Output:**
- `assets/content/url-redirects.json` - URL mapping data
- `assets/content/redirects.htaccess` - Apache redirect rules
- `assets/content/webflow-redirects.txt` - Webflow redirect format

```bash
npm run scrape:urls
```

### 5. `scrape-images.js`
Downloads all images from the website with metadata.

**Output:**
- `assets/images/` - Downloaded images organized by page
- `assets/image-metadata.json` - Image metadata including alt text, dimensions, etc.

**Note:** This script may take a while depending on the number of images.

```bash
npm run scrape:images
```

## Usage

### Run Everything at Once
```bash
npm run scrape:all
```

This will run all scripts in sequence:
1. Extract content
2. Analyze galleries
3. Map URLs
4. Download images

### Run Individual Scripts
You can run scripts individually if you only need specific data:

```bash
# Extract just the text content
npm run scrape:content

# Analyze gallery structures only
npm run scrape:galleries

# Create URL redirects only
npm run scrape:urls

# Download images only
npm run scrape:images
```

## Output Structure

After running the scripts, you'll have:

```
assets/
├── images/                          # Downloaded images
│   ├── home_0_image.jpg
│   ├── projects_1_image.jpg
│   └── ...
├── image-metadata.json              # Image catalog with metadata
└── content/                         # Extracted content
    ├── site-content.json            # Full site content
    ├── gallery-structure.json       # Gallery analysis
    ├── url-redirects.json           # URL mappings
    ├── webflow-cms-structure.json   # CMS recommendations
    ├── redirects.htaccess            # Apache redirects
    ├── webflow-redirects.txt        # Webflow redirects
    ├── home.md                      # Page content in markdown
    ├── projects.md
    └── ...
```

## Customization

### Modify Base URL
If you need to scrape a different domain, update the `BASE_URL` constant in each script:

```javascript
const BASE_URL = 'https://your-domain.com';
```

### Add More Pages
To scrape additional pages, add them to the `pages` array in each script:

```javascript
const pages = [
  { name: 'Home', url: BASE_URL },
  { name: 'About', url: `${BASE_URL}/about` },
  // Add more pages here
];
```

### Adjust Rate Limiting
To change download speed (useful for large sites), modify the timeout in `scrape-images.js`:

```javascript
// Increase/decrease delay between downloads (in milliseconds)
await new Promise(resolve => setTimeout(resolve, 100)); // 100ms default
```

## Troubleshooting

### Script Hangs or Times Out
- Increase timeout values in the scripts (default is 60000ms)
- Check your internet connection
- The site might be blocking automated requests

### Missing Images
- Some images may be lazy-loaded - the scripts include auto-scroll to handle this
- Check `image-metadata.json` for images that failed to download
- You can re-run just the image scraper with `npm run scrape:images`

### Memory Issues
- If downloading many large images, run the image scraper separately
- Close other applications to free up memory
- Consider downloading images in batches by modifying the script

## Next Steps After Extraction

1. **Review the Data**
   - Check `assets/content/site-content.json` for accuracy
   - Verify images downloaded correctly
   - Review gallery categories and structure

2. **Set Up Webflow**
   - Create a new Webflow project
   - Use `webflow-cms-structure.json` as a guide for CMS collections
   - Import design system (colors, fonts, etc.)

3. **Import Content**
   - Use the extracted content to populate Webflow pages
   - Upload images to Webflow
   - Create CMS items based on the extracted data

4. **Set Up Redirects**
   - Import the redirect rules into Webflow
   - Test all redirects before going live

## Notes

- Scripts use headless Chrome via Puppeteer
- Downloads respect rate limits to avoid overwhelming the server
- All scripts skip already-downloaded content to save time
- Scripts are idempotent - safe to run multiple times
