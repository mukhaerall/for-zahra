# for-zahra.exe

A cute, playful, softly romantic birthday website for Zahra. Built with vanilla HTML, CSS, and JavaScript.

## Run locally
Open `index.html` in a browser. For the best local development experience, use VS Code Live Server.

## Deploy to GitHub Pages
1. Create a GitHub repository, for example `for-zahra`.
2. Upload the contents of this folder (keep `index.html` at the repository root).
3. Open **Settings → Pages**.
4. Under Build and deployment, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then Save.
6. Wait for GitHub Pages to publish and open the provided URL.

## Optional instrumental music
The music button is included, but browsers require a user tap before audio can play.
To add music:
1. Use an instrumental audio file that you own or are licensed to use.
2. Put it at `assets/music/instrumental.mp3`.
3. The `<audio>` source in `index.html` already points to that path.

If you don't add a file, the website still works; the music toggle will show a small hint.

## Personalize before publishing
- Update the letter in `index.html` if you want to include a memory or phrase that is genuinely yours.
- Change the date in the top line and birthday date pill if needed.
- The current birthday date is set to 09 November 2026.

No backend, database, API key, or build step is required.

## What's new in v2
- Real loading sequence on the intro (progress bar, percentage, rotating status text); the button unlocks at 100%.
- "FIX THIS ISSUE" now runs a short compile-style loading before the birthday screen.
- Smooth fade transitions between screens, step dots, typed-in terminal lines, letter paragraphs that appear one by one.
- Richer confetti, floating hearts on the last screen, tiny sparkles on tap.
- Respects `prefers-reduced-motion`; fixed `>` and `&` HTML entities.

## What's new in v3
- Tap the candle on the birthday screen to blow it out and make a wish.
- Envelope that opens before the letter; a 15-second "catch the hearts" mini game.
- Polaroid gallery: in `index.html`, replace the `✿` inside each `<div class="photo">` with `<img src="assets/photos/1.jpg" alt="">` (and edit the captions).
- "psst... one more click?" now cycles through several wishes (edit the `wishes` list in `js/script.js`).
- Countdown on the intro. Set `LOCK_UNTIL_BIRTHDAY = true` in `js/script.js` to lock the surprise until 09 Nov (add `?preview` to the URL to peek).
- Music fades in/out. Suggested: soft lo-fi piano, music box or kalimba, royalty-free (Pixabay Music, YouTube Audio Library), under ~3 MB, saved as `assets/music/instrumental.mp3`.
