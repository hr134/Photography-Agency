# 📁 Media Upload Guide — Veloura Creations

All your images and videos live inside:
```
my-next-project/
└── public/
    ├── images/
    │   ├── hero/                   ← Homepage full-screen background photo
    │   ├── stories/
    │   │   ├── weddings/           ← Wedding couple photos
    │   │   ├── pre-wedding/        ← Pre-wedding shoot photos
    │   │   └── engagement/         ← Engagement session photos
    │   ├── photography/            ← Photography portfolio gallery
    │   ├── films/
    │   │   └── thumbnails/         ← Thumbnail covers for film videos
    │   ├── about/                  ← Team/studio/behind-the-scenes
    │   ├── packages/               ← Any package showcase images
    │   └── journal/                ← Blog/journal article images
    └── videos/                     ← Any locally hosted video files (optional)
```

---

## 🖼️ Supported Formats

| Type     | Formats                       |
|----------|-------------------------------|
| Photos   | `.jpg`, `.jpeg`, `.png`, `.webp` |
| Videos   | `.mp4`, `.webm`               |

> **Tip:** `.webp` is the best format for web — smaller file size, same quality.

---

## 🔗 How to Use a Photo in Code

Once you drop a photo into a folder, reference it like this:

**Example:** If you put `sayeef-afrin-01.jpg` inside `public/images/stories/weddings/`
```jsx
<img src="/images/stories/weddings/sayeef-afrin-01.jpg" alt="Sayeef & Afrin" />
```

No need to write the full path — just start from `/images/...`

---

## 📌 Naming Tips
- Use lowercase, no spaces → `sayeef-afrin-01.jpg` ✅
- Avoid: `Sayeef Afrin Photo 01.JPG` ❌
- Group by couple/event: e.g., `tanvir-maliha-01.jpg`, `tanvir-maliha-02.jpg`

---

## 📺 For Films (YouTube)
Videos are embedded from YouTube — no upload needed.
Just replace the YouTube video ID in `src/app/films/page.tsx`:
```tsx
youtubeId: "your-youtube-video-id-here"
```
Use `films/thumbnails/` for the cover images shown before the video plays.
