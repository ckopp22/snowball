# Snowball

An endless, pixel-art snowball-defense game. You are a kid behind a snow fort; waves of bullies march down the screen and you knock them over with snowballs. Survive as many waves as you can. Plain HTML, CSS and JavaScript on one canvas, no frameworks or build step, installable as a PWA.

## How to play

- Touch (or click) and hold anywhere, then drag **away** from where you pressed. A dotted line shows the throw direction, opposite to your drag. Pull length does nothing; only direction matters.
- Release to throw one snowball. A pull under 10 px cancels. There is a 0.5 s cooldown between throws.
- One snowball knocks down one bully. Big Kids take two hits.
- A bully that reaches the fort removes health (Big Kids remove 2). At 0 health the game ends.
- Score: 10 / 20 / 30 / 25 points for Regular / Runner / Big Kid / Sled Kid, plus 50 per completed wave. Your best score is saved on the device.

## Run locally

The service worker needs `http://`, not `file://`. From this folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000. (Opening `index.html` directly still plays the game, just without offline support.)
To test on a phone, open `http://<your-computer-ip>:8000` on the same Wi-Fi. Add `?wave=8` to the URL to start at wave 8.

## Co-op (two devices)

On the title screen tap **CO-OP**. One player taps **CREATE GAME** and reads out the 4-letter code; the other taps **JOIN GAME** and types it. Both play as boys behind the same fort. The host's device runs the game and the guest's device sends its aim and throws.

- Connections are peer-to-peer (WebRTC) using [PeerJS](https://peerjs.com) 1.5.4 (MIT), vendored as `peerjs.min.js`. Pairing goes through PeerJS's free public signaling server, so both devices need internet access to connect (game data then flows directly between them).
- Codes are 4 letters, A to Z.
- Co-op can't be paused. If the other player leaves, a "Connection lost" screen returns you to the menu.

## Icons

```
node tools/make-icons.js
```

Regenerates the three PNGs in `icons/`. No dependencies needed.

## Updating the deployed game

Bump `CACHE_VERSION` at the top of `sw.js` whenever any game file changes. Otherwise installed copies keep serving the old cached files.

## Deploy to GitHub Pages

1. Create a public repository named `snowball` and push this folder to the `main` branch.
2. In the repository: Settings, Pages, Source "Deploy from a branch", branch `main`, folder `/ (root)`, Save.
3. After a minute the game is live at `https://<username>.github.io/snowball/`.
4. iPhone: open the link in Safari, tap Share, then Add to Home Screen. Android: open in Chrome, tap Install app.

All paths are relative, so the site works from the `/snowball/` subfolder.
