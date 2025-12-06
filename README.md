# Sofia-Traffic-Map

A real-time public transport tracker for Sofia, Bulgaria — focused on **buses** and **trams**.

Live demo: https://iliariabs.github.io/sofia-traffic-map/

![Preview](https://i.imgur.com/94inVQs.png)  
*Dark cyber-green aesthetic • Real-time vehicle positions • Route shapes • Stop search*

---

### Features

- Real-time bus & tram positions (updated every 30 seconds)
- Interactive map powered by Leaflet + OpenStreetMap
- Filter by route number with instant search
- Toggle bus / tram visibility independently
- Show/hide stops (appears at zoom ≥15)
- Click any stop name to instantly zoom to it
- Selected routes highlighted with official colors and shapes
- Fully responsive – gorgeous sliding sidebar on mobile
- Offline-capable static GTFS data loading via ZIP
- Zero backend – 100% client-side

---

### Data Sources

- **Static GTFS**: `https://gtfs.sofiatraffic.bg/api/v1/static` (official Sofia Traffic schedule data)
- **Real-time vehicle positions**: `https://gtfs.sofiatraffic.bg/api/v1/vehicle-positions` (GTFS-RT feed)
- Map tiles: OpenStreetMap

Big thanks to [Sofia Urban Mobility Center](https://www.sofiatraffic.bg/) for providing open data!

---

### Tech Stack

- **React** + **TypeScript**
- **Vite** (blazing fast dev server)
- **Zustand** – lightweight state management
- **Tailwind CSS** – styling
- **Leaflet** + **react-leaflet** – map rendering
- **GTFS-Realtime bindings** (protobuf)
- **PapaParse** – CSV parsing
- **JSZip** – reading GTFS ZIP on the client
- Clean Architecture & SOLID principles

---

### Running Locally

```bash
# Clone the repo
git clone https://github.com/yourusername/sofia-traffic-map.git
cd sofia-traffic-map

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:5173

---

### Building for Production

```bash
npm run build
```

The output will be in `/dist` – ready to deploy anywhere (Vercel, Netlify, Cloudflare Pages, etc.).

---

### Performance Optimizations

- Vehicle deduplication by ID
- Polylines only rendered when route is selected and intersects viewport
- Stop layer uses zoom-based visibility + clustering logic internally
- Memoized expensive computations (`useMemo`, `useCallback`)
- Virtualized / bounded vehicle rendering (only shows vehicles in view + 25% padding)

---

### Mobile Experience

- Bottom drag handle to open sidebar
- Full-height drawer with safe-area support
- Body scroll lock when sidebar open
- Touch-friendly buttons and inputs

---

### License

MIT © 2025 – Feel free to use, modify, and redistribute.