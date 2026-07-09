from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import logging
import base64
import bcrypt
import jwt
from pydantic import BaseModel, ConfigDict
from typing import Optional, Any, Dict
from datetime import datetime, timezone, timedelta
from copy import deepcopy

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(email: str) -> str:
    payload = {"sub": email, "email": email, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def slugify(text: str) -> str:
    text = (text or "").strip().lower()
    text = re.sub(r"[^a-z0-9\u4e00-\u9fff]+", "-", text)
    return text.strip("-") or "item"


app = FastAPI()
api_router = APIRouter(prefix="/api")


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str


class ContentUpdate(BaseModel):
    model_config = ConfigDict(extra="allow")
    content: Dict[str, Any]


class ProfileCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    source_slug: Optional[str] = None


class ProfileMetaUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    is_default: Optional[bool] = None


def _proj(pid, order, title, shortTitle, period, ptype, summary, tags, situation, achievement, learned, results=""):
    return {
        "id": pid, "slug": pid, "enabled": True, "order": order,
        "image": None, "imageAlt": "", "imagePosition": {"x": 50, "y": 50},
        "title": title, "shortTitle": shortTitle, "period": period, "type": ptype,
        "summary": summary, "tags": tags,
        "situation": situation, "situationEnabled": True,
        "achievement": achievement, "achievementEnabled": True,
        "learned": learned, "learnedEnabled": True,
        "results": results, "resultsEnabled": bool(results),
        "notes": "", "notesEnabled": False,
        "links": [],
    }


DEFAULT_PROJECT_DB = [
    _proj("medical-literature", 1, "醫療文獻轉譯系統", "醫療文獻轉譯", "2025–至今", "Enterprise AI",
          "將複雜醫學文獻整理成業務與行銷可使用的素材,支援產品推廣與內部溝通。",
          ["AI Research", "Medical Writing", "Evidence Mapping", "Knowledge Base"],
          "進入醫療器材領域時,面對大量英文臨床文獻與法規資料,業務與行銷團隊難以快速理解與運用。",
          "建立一套 AI 輔助的文獻整理與轉譯流程,將關鍵證據濃縮成業務簡報、衛教素材與內部知識卡,支援產品推廣與跨部門溝通。",
          "學會把專業知識轉譯成不同角色可用的語言,並用結構化方式維護可持續更新的知識庫。",
          "產出可重複使用的文獻摘要模板與證據地圖。"),
    _proj("teaching-condense", 2, "教學內容濃縮與視覺化", "教學內容濃縮", "2024–2025", "Content Design",
          "將長時間教學內容濃縮為高密度學習素材,重構資訊順序、畫面引導與學習節奏。",
          ["Information Design", "Video Structure", "UX Thinking"],
          "面對長時間、資訊密度不一的教學內容,學習者不易掌握重點與節奏。",
          "重構資訊順序與畫面引導,將長影片濃縮為高密度學習素材,提升理解效率與學習體驗。",
          "掌握資訊設計與視覺敘事,懂得用節奏與層次降低學習門檻。"),
    _proj("enterprise-workflow", 3, "企業工作流與知識庫", "企業知識庫", "2025–至今", "Operations",
          "使用 Notion / Ragic / 自動化工具整理專案、任務、資料與跨部門資訊。",
          ["Workflow Design", "Database Thinking", "Operations", "Notion", "Ragic"],
          "企業內部專案、任務與資料分散在不同工具,跨部門協作與追蹤困難。",
          "以 Notion / Ragic 與自動化工具建立集中式知識庫與工作流,整合專案、任務與資料,提升團隊協作透明度。",
          "建立資料庫思維與流程設計能力,理解如何讓系統真正被團隊使用。"),
    _proj("ai-content-pipeline", 4, "AI 圖文與內容產線", "AI 內容產線", "2020–2023", "Content Automation",
          "設計多模型協作流程,將圖文生成、文案、社群平台發布邏輯模板化。",
          ["Prompt Engineering", "Content Automation", "Multi-model Workflow"],
          "內容產製需要大量圖文與跨平台發布,重複性高且耗時。",
          "設計多模型協作流程,將圖文生成、文案與社群發布邏輯模板化,建立可複製的內容產線。",
          "熟悉 Prompt 工程與多模型協作,懂得把創意流程系統化。"),
    _proj("cross-domain-visual", 5, "跨域影像與商業敘事", "跨域影像敘事", "2016–2020", "Creative Production",
          "將學術、產品、品牌或商業需求轉化為可理解的影像腳本與視覺內容。",
          ["Storytelling", "Production", "Cross-domain Translation"],
          "學術、產品與品牌需求複雜,不易轉化為易懂的視覺與敘事。",
          "將跨域需求轉化為影像腳本與視覺內容,在有限資源下完成多項舞台、影像與競賽作品。",
          "累積跨域統籌、資源調度與說故事能力,能在有限資源下產出高完成度成果。"),
]


DEFAULT_CONTENT = {
    "hero": {
        "visible": True,
        "name": "Hanson 曹瀚升",
        "title": "AI Business Systems Architect",
        "subtitle": "AI 商業系統架構師",
        "tagline": "把混亂轉化為系統,把限制轉化為解法。",
        "description": "這不只是一份履歷,而是一張能力形成地圖:記錄我如何一路把跨域經驗、商業問題與非結構化資訊,轉化為系統設計、流程重構與 AI 自動化能力。",
        "image": None,
        "imageAlt": "",
        "imagePosition": {"x": 50, "y": 50},
        "showImage": True,
        "layout": "right",
        "shape": "card",
        "scrollHint": "Scroll to explore",
        "ctas": [
            {"text": "View Evolution Map", "href": "#evolution"},
            {"text": "View Selected Projects", "href": "#projects"},
            {"text": "Contact Hanson", "href": "#contact"},
        ],
    },
    "coreThesis": {
        "visible": True,
        "title": "Core Thesis",
        "subtitle": "核心主張",
        "learnMoreUrl": None,
        "items": [
            {"id": 1, "title": "Structure Chaos", "description": "把龐雜資訊、混亂流程與零散經驗,整理成清楚架構。", "iconType": "builtin", "icon": "layout-grid", "detailUrl": None},
            {"id": 2, "title": "Build Systems", "description": "設計可複製、可維護、可擴張的流程、模板、知識庫與自動化管線。", "iconType": "builtin", "icon": "settings", "detailUrl": None},
            {"id": 3, "title": "Translate Across Domains", "description": "能在醫療、影像、業務、行銷、AI 工具與企業流程之間轉譯需求。", "iconType": "builtin", "icon": "shuffle", "detailUrl": None},
        ],
    },
    "careerEvolution": {
        "visible": True,
        "title": "Career Evolution Map",
        "subtitle": "職涯進化地圖",
        "stages": [
            {"id": 1, "slug": "origin", "visible": True, "period": "1999–2015", "title": "啟蒙與破局期", "titleEn": "Origin of Systems Thinking", "summary": "從遊戲規則、發明展與知識整理中,形成對「系統」的直覺。", "situation": "面對無聊的遊戲規則、零散的學習資料,以及現實問題中缺乏解法的狀態。", "actions": "主動設計遊戲規則、創造玩法系統、嘗試發明原型,並將複雜知識重新整理成視覺化結構。", "outcome": "建立了早期的痛點洞察、MVP 原型、知識結構化與視覺化能力。", "relatedProjectIds": [], "manualTags": ["Systems Thinking", "MVP", "Knowledge Mapping"], "removedAutoTags": []},
            {"id": 2, "slug": "resourceful", "visible": True, "period": "2016–2020", "title": "資源整合與跨界統籌", "titleEn": "Resourceful Creation & Cross-domain Execution", "summary": "在低預算、高限制的影像與舞台專案中,學會用有限資源創造高完成度成果。", "situation": "學生時期面對預算有限、技術不足、場地與人力限制,卻需要完成高品質舞台、影像與專案成果。", "actions": "結合魔術、手作、影像、企劃、談判與跨領域學習,用低成本方法替代昂貴技術解法。", "outcome": "完成大型舞台演出、影像專案與競賽作品,累積跨域統籌、資源調度與創意解法能力。", "relatedProjectIds": ["cross-domain-visual"], "manualTags": [], "removedAutoTags": []},
            {"id": 3, "slug": "workflow", "visible": True, "period": "2020–2023", "title": "流程降維與自動化覺醒", "titleEn": "Workflow Design & Automation Mindset", "summary": "在業務、內容與自媒體實作中,開始把重複工作拆成模板、流程與產線。", "situation": "面對繁瑣紙本流程、業務溝通、內容產製與剪輯工作中的大量重複勞動。", "actions": "重構表格與 SOP,建立防呆流程;將內容製作拆解成模板化管線,降低重複工作成本。", "outcome": "形成業務流程重構、內容流水線、自動化思維與轉換漏斗觀念。", "relatedProjectIds": ["ai-content-pipeline"], "manualTags": ["SOP", "Content Pipeline"], "removedAutoTags": []},
            {"id": 4, "slug": "compression", "visible": True, "period": "2024–2025", "title": "商業系統觀察與資訊降維", "titleEn": "Business Systems & Information Compression", "summary": "在高密度內容、影像與商業專案中,鍛鍊複雜資訊拆解與視覺化轉譯能力。", "situation": "面對大量教學內容、複雜商業資訊、跨領域專案與需要快速理解的陌生領域。", "actions": "萃取重點、重組敘事、視覺化複雜流程,將長時間內容濃縮成可學習、可溝通、可交付的成果。", "outcome": "將長篇內容濃縮為精簡課程與高密度素材,建立資訊降維、視覺轉譯與商業理解能力。", "relatedProjectIds": ["teaching-condense"], "manualTags": ["Business Translation"], "removedAutoTags": []},
            {"id": 5, "slug": "enterprise-ai", "visible": True, "period": "2025–Now", "title": "企業 AI 與醫療數位轉型", "titleEn": "Enterprise AI & Medical Workflow Transformation", "summary": "將過去的系統思維正式落地到企業流程、醫療器材、AI 工具與知識庫建構。", "situation": "進入傳統醫療器材與企業環境,面對文獻龐雜、流程分散、資料混亂、跨部門協作與管理需求。", "actions": "使用 AI 工具、Notion、Ragic、n8n、知識庫與自動化方法,協助文獻整理、競品分析、行銷素材、專案管理與流程重構。", "outcome": "建立可用於醫療器材推廣、內部管理、專案追蹤與決策輔助的數位系統與工作流。", "relatedProjectIds": ["medical-literature", "enterprise-workflow"], "manualTags": ["n8n", "Business Systems"], "removedAutoTags": []},
        ],
    },
    "projects": {
        "visible": True,
        "title": "Selected Projects",
        "subtitle": "精選專案",
        "viewAllUrl": None,
        "items": [
            {"id": 1, "projectId": "medical-literature", "overrides": {}, "visible": True},
            {"id": 2, "projectId": "teaching-condense", "overrides": {}, "visible": True},
            {"id": 3, "projectId": "enterprise-workflow", "overrides": {}, "visible": True},
            {"id": 4, "projectId": "ai-content-pipeline", "overrides": {}, "visible": True},
            {"id": 5, "projectId": "cross-domain-visual", "overrides": {}, "visible": True},
        ],
    },
    "capabilities": {
        "visible": True,
        "title": "Capability System",
        "subtitle": "能力系統",
        "viewDetailUrl": None,
        "categories": [
            {"id": 1, "name": "AI & Automation", "description": "", "visible": True, "skills": ["Prompt Engineering", "ChatGPT", "Claude", "Gemini", "Grok", "n8n", "Ragic", "Notion"]},
            {"id": 2, "name": "Business Systems", "description": "", "visible": True, "skills": ["Workflow Design", "SOP", "Process Optimization", "B2B Communication", "Funnel Thinking"]},
            {"id": 3, "name": "Content & Communication", "description": "", "visible": True, "skills": ["Information Design", "Video Production", "Copywriting", "Presentation", "Visual Storytelling"]},
            {"id": 4, "name": "Medical & Research Translation", "description": "", "visible": True, "skills": ["Medical Device", "Literature Review", "Evidence Summary", "Clinical Communication"]},
            {"id": 5, "name": "Tools", "description": "", "visible": True, "skills": ["Canva", "FCPX", "Adobe", "Google Workspace", "LINE OA", "Basic Web Tools"]},
        ],
    },
    "nowNext": {
        "visible": True,
        "title": "Now, I build systems for the real world.",
        "content": [
            "我已經在教育、影像、業務、內容、醫療與 AI 自動化裡,反覆驗證了同一種能力:",
            "看見混亂,拆解規則,重建系統。",
            "接下來,我想把這套能力放到更大的商業戰場:",
            "幫助企業建立真正能落地、能被團隊使用、能支援決策的 AI 工作流與數位系統。",
        ],
        "closingEn": "How far can this system-building ability scale in your organization?",
        "closingZh": "這套把混亂轉化為系統的能力,能在貴公司的戰場被放大到什麼程度?",
    },
    "contact": {
        "visible": True,
        "email": "hansonxdxd@gmail.com",
        "phone": "",
        "lineUrl": "",
        "location": "Taipei / Taichung, Taiwan",
        "openTo": [
            "AI Workflow / Business Systems",
            "Medical Device Digital Transformation",
            "Content Operations",
            "0-1 Project Building",
            "Cross-domain Automation Consulting",
        ],
        "resume": {"text": "下載傳統履歷 Resume", "url": None},
    },
    "projectDatabase": deepcopy(DEFAULT_PROJECT_DB),
}


def _migrate_old_project(p, idx):
    pid = slugify(p.get("title") or f"project-{idx + 1}")
    return {
        "id": pid, "slug": pid, "enabled": p.get("visible", True) is not False, "order": idx + 1,
        "image": p.get("image"), "imageAlt": p.get("imageAlt", ""), "imagePosition": p.get("imagePosition", {"x": 50, "y": 50}),
        "title": p.get("title", ""), "shortTitle": p.get("title", "")[:10], "period": "", "type": "",
        "summary": p.get("description", ""), "tags": p.get("skills", []),
        "situation": "", "situationEnabled": False,
        "achievement": "", "achievementEnabled": False,
        "learned": "", "learnedEnabled": False,
        "results": "", "resultsEnabled": False,
        "notes": "", "notesEnabled": False,
        "links": [{"id": 1, "label": "查看專案", "url": p.get("link"), "type": "website"}] if p.get("link") else [],
    }


def backfill_content(content: dict) -> dict:
    if not isinstance(content, dict):
        return deepcopy(DEFAULT_CONTENT)

    for sec in ["hero", "coreThesis", "careerEvolution", "projects", "capabilities", "nowNext", "contact"]:
        if isinstance(content.get(sec), dict):
            content[sec].setdefault("visible", True)

    h = content.get("hero")
    if isinstance(h, dict):
        h.setdefault("image", None)
        h.setdefault("imageAlt", "")
        h.setdefault("imagePosition", {"x": 50, "y": 50})
        h.setdefault("showImage", True)
        h.setdefault("layout", "right")
        h.setdefault("shape", "card")
        h.setdefault("scrollHint", "Scroll to explore")

    ct = content.get("coreThesis")
    if isinstance(ct, dict):
        for it in ct.get("items", []):
            it.setdefault("iconType", "builtin")
            it.setdefault("icon", "layout-grid")

    c = content.get("contact")
    if isinstance(c, dict):
        c.setdefault("phone", "")
        c.setdefault("lineUrl", "")
        c.setdefault("resume", {"text": "下載傳統履歷 Resume", "url": None})

    # ---- Project database migration ----
    if "projectDatabase" not in content:
        old_items = []
        if isinstance(content.get("projects"), dict):
            old_items = content["projects"].get("items", []) or []
        pdb = [_migrate_old_project(p, i) for i, p in enumerate(old_items)]
        if not pdb:
            pdb = deepcopy(DEFAULT_PROJECT_DB)
        content["projectDatabase"] = pdb
        # rebuild selected projects as slots referencing db
        if isinstance(content.get("projects"), dict):
            content["projects"]["items"] = [
                {"id": i + 1, "projectId": dp["id"], "overrides": {}, "visible": True}
                for i, dp in enumerate(pdb)
            ]

    # ensure project db entries have all fields
    for i, p in enumerate(content.get("projectDatabase", [])):
        p.setdefault("slug", slugify(p.get("title") or f"project-{i + 1}"))
        p.setdefault("id", p["slug"])
        p.setdefault("enabled", True)
        p.setdefault("order", i + 1)
        p.setdefault("image", None)
        p.setdefault("imageAlt", "")
        p.setdefault("imagePosition", {"x": 50, "y": 50})
        p.setdefault("shortTitle", "")
        p.setdefault("period", "")
        p.setdefault("type", "")
        p.setdefault("summary", "")
        p.setdefault("tags", [])
        for f in ["situation", "achievement", "learned", "results", "notes"]:
            p.setdefault(f, "")
            p.setdefault(f + "Enabled", bool(p.get(f)))
        p.setdefault("links", [])

    # ---- Career stages migration to relation model ----
    ce = content.get("careerEvolution")
    if isinstance(ce, dict):
        for st in ce.get("stages", []):
            st.setdefault("visible", True)
            st.setdefault("slug", slugify(st.get("titleEn") or st.get("title") or f"stage-{st.get('id', '')}"))
            st.setdefault("relatedProjectIds", [])
            st.setdefault("situation", "")
            st.setdefault("actions", "")
            st.setdefault("outcome", "")
            if "manualTags" not in st:
                st["manualTags"] = st.get("tags", []) or []
            st.setdefault("removedAutoTags", [])

    # ---- Selected projects slots ----
    pr = content.get("projects")
    if isinstance(pr, dict):
        new_items = []
        for i, it in enumerate(pr.get("items", [])):
            if "projectId" in it:
                it.setdefault("overrides", {})
                it.setdefault("visible", True)
                it.setdefault("id", i + 1)
                new_items.append(it)
        pr["items"] = new_items

    # ---- Capabilities ----
    cap = content.get("capabilities")
    if isinstance(cap, dict):
        for cat in cap.get("categories", []):
            cat.setdefault("description", "")
            cat.setdefault("visible", True)

    return content


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"email": payload.get("email")})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return {"email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_default_profile() -> dict:
    prof = await db.profiles.find_one({"is_default": True})
    if not prof:
        prof = await db.profiles.find_one({})
    return prof


@api_router.get("/")
async def root():
    return {"message": "Career Evolution Map API"}


@api_router.get("/content")
async def get_content():
    prof = await get_default_profile()
    if not prof:
        content = deepcopy(DEFAULT_CONTENT)
        await db.profiles.insert_one({"slug": "main", "name": "主要版本", "content": content, "is_default": True, "created_at": datetime.now(timezone.utc).isoformat()})
        return content
    return backfill_content(prof["content"])


@api_router.get("/profiles/{slug}")
async def get_profile_by_slug(slug: str):
    prof = await db.profiles.find_one({"slug": slug})
    if not prof:
        raise HTTPException(status_code=404, detail="找不到此設定檔")
    return {"slug": prof["slug"], "name": prof.get("name", prof["slug"]), "is_default": prof.get("is_default", False), "content": backfill_content(prof["content"])}


@api_router.post("/auth/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="電子郵件或密碼錯誤")
    return TokenResponse(access_token=create_access_token(email), email=email)


@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


@api_router.get("/profiles")
async def list_profiles(current_user: dict = Depends(get_current_user)):
    profiles = await db.profiles.find({}).to_list(200)
    return [{"slug": p["slug"], "name": p.get("name", p["slug"]), "is_default": p.get("is_default", False), "updated_at": p.get("updated_at")} for p in profiles]


@api_router.post("/profiles")
async def create_profile(payload: ProfileCreate, current_user: dict = Depends(get_current_user)):
    base_slug = slugify(payload.slug or payload.name)
    slug = base_slug
    i = 2
    while await db.profiles.find_one({"slug": slug}):
        slug = f"{base_slug}-{i}"
        i += 1
    if payload.source_slug:
        src = await db.profiles.find_one({"slug": payload.source_slug})
        content = deepcopy(src["content"]) if src else deepcopy(DEFAULT_CONTENT)
    else:
        content = deepcopy(DEFAULT_CONTENT)
    doc = {"slug": slug, "name": payload.name or slug, "content": backfill_content(content), "is_default": False, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()}
    await db.profiles.insert_one(doc)
    return {"slug": slug, "name": doc["name"], "is_default": False}


@api_router.get("/admin/profiles/{slug}")
async def admin_get_profile(slug: str, current_user: dict = Depends(get_current_user)):
    prof = await db.profiles.find_one({"slug": slug})
    if not prof:
        raise HTTPException(status_code=404, detail="找不到此設定檔")
    return {"slug": prof["slug"], "name": prof.get("name", prof["slug"]), "is_default": prof.get("is_default", False), "content": backfill_content(prof["content"])}


@api_router.put("/profiles/{slug}")
async def update_profile_content(slug: str, payload: ContentUpdate, current_user: dict = Depends(get_current_user)):
    prof = await db.profiles.find_one({"slug": slug})
    if not prof:
        raise HTTPException(status_code=404, detail="找不到此設定檔")
    await db.profiles.update_one({"slug": slug}, {"$set": {"content": payload.content, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"success": True, "message": "內容已更新"}


@api_router.patch("/profiles/{slug}")
async def update_profile_meta(slug: str, payload: ProfileMetaUpdate, current_user: dict = Depends(get_current_user)):
    prof = await db.profiles.find_one({"slug": slug})
    if not prof:
        raise HTTPException(status_code=404, detail="找不到此設定檔")
    updates = {}
    if payload.name is not None:
        updates["name"] = payload.name
    if payload.slug is not None and payload.slug != slug:
        new_slug = slugify(payload.slug)
        if await db.profiles.find_one({"slug": new_slug}):
            raise HTTPException(status_code=400, detail="此網址代稱已被使用")
        updates["slug"] = new_slug
    if payload.is_default:
        await db.profiles.update_many({}, {"$set": {"is_default": False}})
        updates["is_default"] = True
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.profiles.update_one({"slug": slug}, {"$set": updates})
    return {"success": True, "slug": updates.get("slug", slug)}


@api_router.delete("/profiles/{slug}")
async def delete_profile(slug: str, current_user: dict = Depends(get_current_user)):
    prof = await db.profiles.find_one({"slug": slug})
    if not prof:
        raise HTTPException(status_code=404, detail="找不到此設定檔")
    if await db.profiles.count_documents({}) <= 1:
        raise HTTPException(status_code=400, detail="至少需保留一個設定檔")
    was_default = prof.get("is_default", False)
    await db.profiles.delete_one({"slug": slug})
    if was_default:
        other = await db.profiles.find_one({})
        if other:
            await db.profiles.update_one({"slug": other["slug"]}, {"$set": {"is_default": True}})
    return {"success": True}


@api_router.post("/profiles/{slug}/reset")
async def reset_profile(slug: str, current_user: dict = Depends(get_current_user)):
    prof = await db.profiles.find_one({"slug": slug})
    if not prof:
        raise HTTPException(status_code=404, detail="找不到此設定檔")
    await db.profiles.update_one({"slug": slug}, {"$set": {"content": deepcopy(DEFAULT_CONTENT), "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"success": True, "content": deepcopy(DEFAULT_CONTENT)}


@api_router.post("/upload")
async def upload_image(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="僅支援 JPEG, PNG, WebP, GIF 格式")
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="圖片大小不能超過 5MB")
    b64 = base64.b64encode(contents).decode("utf-8")
    return {"success": True, "url": f"data:{file.content_type};base64,{b64}"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower().strip()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({"email": admin_email, "password_hash": hash_password(admin_password), "name": "Hanson", "role": "admin", "created_at": datetime.now(timezone.utc).isoformat()})
        logger.info(f"Admin user seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info(f"Admin password updated: {admin_email}")


async def seed_profiles():
    count = await db.profiles.count_documents({})
    if count > 0:
        if not await db.profiles.find_one({"is_default": True}):
            first = await db.profiles.find_one({})
            if first:
                await db.profiles.update_one({"slug": first["slug"]}, {"$set": {"is_default": True}})
        return
    legacy = await db.site_content.find_one({"_id": "main"})
    content = backfill_content(legacy["content"]) if legacy and "content" in legacy else deepcopy(DEFAULT_CONTENT)
    await db.profiles.insert_one({"slug": "main", "name": "主要版本", "content": content, "is_default": True, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()})
    logger.info("Default profile seeded/migrated")


@app.on_event("startup")
async def startup_event():
    await db.users.create_index("email", unique=True)
    await db.profiles.create_index("slug", unique=True)
    await seed_admin()
    await seed_profiles()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
