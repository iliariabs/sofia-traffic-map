# 🗺️ Sofia-Traffic-Map

A real-time map of Sofia’s public transport — focused on **buses** and **trams**.

Live demo: https://iliariabs.github.io/sofia-traffic-map/

![Preview](https://i.imgur.com/94inVQs.png)

---

## ✨ Features

- Live vehicle positions (updated every ~60s)
- Search by route number or stop name
- Toggle buses, trams, and stops independently
- Route lines with official colors
- 100% client-side — no backend required

---

## 📊 Data Sources

- Static GTFS: `gtfs.sofiatraffic.bg/api/v1/static`
- Real-time positions: `gtfs.sofiatraffic.bg/api/v1/vehicle-positions`
- Map tiles: OpenStreetMap

Thanks to the Sofia Urban Mobility Center for open data.

---

## 🛠️ Tech Stack

**React + TypeScript**, **Vite**, **Zustand**, **Tailwind**,  
**Leaflet / react-leaflet**, **JSZip**, **PapaParse**
