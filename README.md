# MMM Reader

A web reader for Myst, Might, Mayhem — with multi-book support via PDF upload.

## Setup for GitHub Pages

1. **Fork / push this repo to GitHub**
2. In your repo, go to **Settings → Pages → Source** → select **GitHub Actions**
3. Edit `vite.config.js` and change `/mmm-reader/` to match your **exact repo name**:
   ```js
   base: '/your-repo-name/',
   ```
4. Push to `main` — the action builds and deploys automatically
5. Your site will be at `https://your-username.github.io/your-repo-name/`

## Local dev

```bash
npm install --legacy-peer-deps
npm run dev
```
