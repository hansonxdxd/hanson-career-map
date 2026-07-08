# PRD — Career Evolution Map (Hanson 曹瀚升 個人品牌網站)

## Original Problem Statement
高級、精緻的單頁式個人品牌網站，主角 Hanson 曹瀚升 (AI Business Systems Architect)。
概念為「職涯進化地圖 / Career Evolution Map」，用視覺化垂直時間軸呈現能力形成。
深色科技感 (navy/blue/cyan)，Apple 風格平滑滑動，時間軸區塊滑入時放大。

## User Choices / Preferences
- Apple 風格的高級滑動感，區塊滑到放大、平時縮小
- 垂直時間線，不同區塊
- 需要後台 CMS 分 section 編輯所有文字內容
- 每個 section (尤其 Evolution Map) 可加外部連結，變成點擊按鈕
- 專案區塊可上傳圖片或加連結
- 高級、順暢、簡單互動

## Architecture
- **Frontend**: React + Tailwind + framer-motion + react-intersection-observer
- **Backend**: FastAPI + MongoDB (motor)
- **Auth**: JWT Bearer token (localStorage), single admin seeded from env
- **Content**: stored in `db.site_content` (_id="main"), served via GET /api/content
- **Images**: uploaded as base64 data URLs via POST /api/upload

## Routes
- `/` — public landing page (7 sections)
- `/admin/login` — CMS login
- `/admin` — CMS dashboard (auth-guarded)

## API Endpoints
- GET `/api/content` (public)
- POST `/api/auth/login`, GET `/api/auth/me`
- PUT `/api/content` (protected)
- POST `/api/upload` (protected)

## Admin Credentials
- hansonxdxd@gmail.com / Hanson2025! (see /app/memory/test_credentials.md)

## What's Been Implemented (2025)
- [x] Public single-page site: Hero, Core Thesis, Career Evolution Map (5 stages), Selected Projects, Capability System, Now/Next, Contact
- [x] Apple-style scroll animations, vertical glowing timeline, scale-on-scroll stage cards
- [x] Dark tech aesthetic, glass-morphism cards, responsive (desktop/tablet/mobile)
- [x] External link buttons on: Core Thesis (per-card + section), Evolution stages (了解更多), Projects (per-project + section), Capabilities (section)
- [x] Full CMS: login, 7 section editors, add/remove stages/projects/categories, image upload, link fields
- [x] Content persistence MongoDB, public site reads from API with mock fallback
- [x] Tested: backend 13/13 pytest, frontend all critical flows

## Prioritized Backlog
- P1: Public contact form (currently displays info only)
- P2: SEO meta tags / Open Graph for sharing
- P2: File/GridFS storage instead of base64 for images (production scale)
- P2: Content schema validation on PUT
- P2: Drag-to-reorder stages/projects in CMS

## Update 3 (2025) — Project Database核心化 + 三面架構重構
- [x] 三面架構:Home (`/`)、Archive (`/archive`)、Admin (`/admin`)
- [x] Project Database 成為唯一資料來源;職涯地圖、精選專案、能力系統皆「引用」它
- [x] 設定檔各自完全獨立(含各自 projectDatabase),互不同步
- [x] 前台導覽重構:頂部 nav + 右側 section 圓點導覽(active 發光) + Hero scroll indicator(移除主要 CTA)
- [x] Hero 圖片:layout(左/右/中)+shape(卡片/圓角方/圓形)+顯示開關 + Canva 式裁切
- [x] Archive:橫向可展開專案卡片、每段內容可個別開關、?stage/?project 亮起
- [x] 職涯階段選取關聯專案 → 自動帶入短標題 chips + 去重能力標籤
- [x] 精選專案改為 slot 選取資料庫專案 + 可選覆寫;能力系統可從標籤池加入
- [x] Admin 分兩大群組;專案 CRUD(新增/排序/隱藏/刪除/複製/成果連結)+ 回到前台/未儲存提醒/helper text/刪除二次確認
- [x] 刪除專案自動清除孤兒引用;測試:後端 34/34、前端核心流程 PASS

## Update 2 (2025) — Profile Versions + Advanced CMS
- [x] Profile/version system: multiple content profiles, each with independent public URL (`/` for default, `/p/:slug` for others). Create / rename / delete / set-default / switch in admin.
- [x] Per-profile section visibility toggles + per-stage show/hide
- [x] Import / Export JSON, Reset demo content, Download backup in admin
- [x] Hero image upload with Canva-style drag-to-reposition crop + alt text
- [x] Core Thesis icons: built-in icon picker (28 icons) + custom icon upload
- [x] Career stages reorder (up/down) + individual visibility
- [x] Projects: no empty frame when no image, alt text, drag crop, reorder
- [x] Contact: phone + LINE fields (icons) + editable resume download button (text+link)
- [x] Right-side + top scroll progress bar
- [x] Tested: backend 27/27 pytest, frontend all critical flows PASS
- Data model migrated from single `site_content` doc to `db.profiles` collection (auto-migrated on startup)
