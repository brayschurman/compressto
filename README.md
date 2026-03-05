# 🎥✨ compress.to

> Record a quick camera clip, compress it right in your browser, and download a tiny share-ready file. 🚀📦

compress.to is a **client-side video recorder + compressor** built for short clips that need to be small enough for messaging apps (especially iMessage-style limits). 📱💬

## 🌟 What This App Is

compress.to helps you:

- 🎬 Record directly from your camera + microphone
- 👀 Preview your clip instantly
- 🗜️ Compress using quality/size presets
- 📥 Download the optimized file with one click
- 🔒 Keep processing local in-browser (no upload step in current flow)

## 🧠 Why It Exists

Big phone recordings are annoying to send. This app focuses on **fast capture + aggressive size control** so short selfie videos are easier to share. ⚡

## 🛠️ Core Features

- ⏱️ 120-second max recording timer with live countdown
- 🎚️ Camera + microphone device picker
- 🔴/✅ Record and stop controls
- 📊 Real-time compression progress bar
- 🧪 Presets tuned for messaging workflows:
  - `Large` (best visual quality)
  - `Medium` (balanced)
  - `Small` (smallest output)
- 🧾 Auto-generated download filename (preset + timestamp)
- 🧱 Graceful errors for permission/device/compression issues

## ⚙️ Tech Stack

- ⚛️ Next.js 15 + React 19 + TypeScript
- 🎨 Tailwind CSS v4
- 🧭 tRPC (scaffolded)
- 🗄️ Drizzle + Postgres + Better Auth (scaffolded backend/auth foundation)

## 🚀 Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create env file

```bash
cp .env.example .env
```

`DATABASE_URL` is required by environment validation.

### 3. Start local database (optional for recorder UI, useful for full stack scaffold)

```bash
./start-database.sh
```

### 4. Run the app

```bash
pnpm dev
```

Open: `http://localhost:3000` 🌐

## 🧪 Available Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm check
```

## 🔄 How Compression Works (High Level)

1. 🎥 Capture input via `MediaRecorder`
2. 🖼️ Draw video frames onto a canvas at preset resolution/FPS
3. 🔊 Route audio through `AudioContext` into a mixed stream
4. 📼 Re-record the mixed stream at target bitrates
5. 📥 Download compressed blob as `.mov`/`.webm` depending on browser support

## 🔐 Privacy Notes

- 🧮 Compression runs in the browser runtime
- ☁️ No cloud upload step in current recording/compression path
- 🎛️ Camera/mic permissions are required

## 📌 Current Scope

This repository still includes T3 scaffold pieces (auth/trpc/db), but the current homepage experience is focused on the **record → compress → download** loop. 🧰

## 🗺️ Potential Next Steps

- 📤 Native share sheet integration
- 📏 Side-by-side size reduction stats in final UI
- 🧵 Background/off-main-thread encode worker
- 🍏 More explicit preset targeting for iMessage/MMS platform limits

---

Built for tiny videos and faster sharing. 🎬➡️📦➡️💬
