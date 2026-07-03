# ToolzEasy static website

Deploy this folder directly to Cloudflare Pages.

## Files

- `index.html` - homepage and tool UI
- `styles.css` - responsive design
- `app.js` - browser-side tool logic
- `robots.txt` and `sitemap.xml` - basic SEO files
- `404.html` - not found page

## Notes

Text, utility, image and several PDF tools run in the browser. Each tool opens on its own `tool.html?tool=...` URL while the homepage keeps the full tools grid.

Notes:

- PDF and image protect tools create encrypted file packages.
- PDF merge, split, compress, rotate, PDF-to-JPG, PDF-to-Word text export, Word/text-to-PDF, JPG-to-PDF and drawn PDF signature use browser libraries.

For Cloudflare Pages, use this folder as the deploy output:

```text
outputs/toolzeasy-site
```
