from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import base64
import bcrypt
import jwt
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime, timezone, timedelta
from copy import deepcopy

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT config
JWT_ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(email: str) -> str:
    payload = {
        "sub": email,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


# App setup
app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------------- Models ----------------
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


# ---------------- Default Content ----------------
DEFAULT_CONTENT = {
    "hero": {
        "name": "Hanson 曹瀚升",
        "title": "AI Business Systems Architect",
        "subtitle": "AI 商業系統架構師",
        "tagline": "把混亂轉化為系統,把限制轉化為解法。",
        "description": "這不只是一份履歷,而是一張能力形成地圖:記錄我如何一路把跨域經驗、商業問題與非結構化資訊,轉化為系統設計、流程重構與 AI 自動化能力。",
        "ctas": [
            {"text": "View Evolution Map", "href": "#evolution"},
            {"text": "View Selected Projects", "href": "#projects"},
            {"text": "Contact Hanson", "href": "#contact"},
        ],
    },
    "coreThesis": {
        "title": "Core Thesis",
        "subtitle": "核心主張",
        "learnMoreUrl": None,
        "items": [
            {"id": 1, "title": "Structure Chaos", "description": "把龐雜資訊、混亂流程與零散經驗,整理成清楚架構。", "icon": "layout-grid", "detailUrl": None},
            {"id": 2, "title": "Build Systems", "description": "設計可複製、可維護、可擴張的流程、模板、知識庫與自動化管線。", "icon": "settings", "detailUrl": None},
            {"id": 3, "title": "Translate Across Domains", "description": "能在醫療、影像、業務、行銷、AI 工具與企業流程之間轉譯需求。", "icon": "shuffle", "detailUrl": None},
        ],
    },
    "careerEvolution": {
        "title": "Career Evolution Map",
        "subtitle": "職涯進化地圖",
        "stages": [
            {"id": 1, "period": "1999–2015", "title": "啟蒙與破局期", "titleEn": "Origin of Systems Thinking", "summary": "從遊戲規則、發明展與知識整理中,形成對「系統」的直覺。", "situation": "面對無聊的遊戲規則、零散的學習資料,以及現實問題中缺乏解法的狀態。", "actions": "主動設計遊戲規則、創造玩法系統、嘗試發明原型,並將複雜知識重新整理成視覺化結構。", "outcome": "建立了早期的痛點洞察、MVP 原型、知識結構化與視覺化能力。", "coreAbility": "看見混亂中的結構,將零散資訊轉化為可理解的系統。", "tags": ["Systems Thinking", "MVP", "Knowledge Mapping", "Visual Structure"], "detailUrl": None},
            {"id": 2, "period": "2016–2020", "title": "資源整合與跨界統籌", "titleEn": "Resourceful Creation & Cross-domain Execution", "summary": "在低預算、高限制的影像與舞台專案中,學會用有限資源創造高完成度成果。", "situation": "學生時期面對預算有限、技術不足、場地與人力限制,卻需要完成高品質舞台、影像與專案成果。", "actions": "結合魔術、手作、影像、企劃、談判與跨領域學習,用低成本方法替代昂貴技術解法。", "outcome": "完成大型舞台演出、影像專案與競賽作品,累積跨域統籌、資源調度與創意解法能力。", "coreAbility": "在資源有限的情況下,快速拼出可落地的 MVP 解法。", "tags": ["Resource Integration", "Creative Production", "Low-cost MVP", "Storytelling"], "detailUrl": None},
            {"id": 3, "period": "2020–2023", "title": "流程降維與自動化覺醒", "titleEn": "Workflow Design & Automation Mindset", "summary": "在業務、內容與自媒體實作中,開始把重複工作拆成模板、流程與產線。", "situation": "面對繁瑣紙本流程、業務溝通、內容產製與剪輯工作中的大量重複勞動。", "actions": "重構表格與 SOP,建立防呆流程;將內容製作拆解成模板化管線,降低重複工作成本。", "outcome": "形成業務流程重構、內容流水線、自動化思維與轉換漏斗觀念。", "coreAbility": "把勞力密集工作拆解為可複製的流程與模板。", "tags": ["Workflow Design", "SOP", "Content Pipeline", "Automation Thinking"], "detailUrl": None},
            {"id": 4, "period": "2024–2025", "title": "商業系統觀察與資訊降維", "titleEn": "Business Systems & Information Compression", "summary": "在高密度內容、影像與商業專案中,鍛鍊複雜資訊拆解與視覺化轉譯能力。", "situation": "面對大量教學內容、複雜商業資訊、跨領域專案與需要快速理解的陌生領域。", "actions": "萃取重點、重組敘事、視覺化複雜流程,將長時間內容濃縮成可學習、可溝通、可交付的成果。", "outcome": "將長篇內容濃縮為精簡課程與高密度素材,建立資訊降維、視覺轉譯與商業理解能力。", "coreAbility": "把高噪音資訊壓縮成清楚、可傳遞、可決策的內容系統。", "tags": ["Information Compression", "Visual UX", "Business Translation", "Content Systems"], "detailUrl": None},
            {"id": 5, "period": "2025–Now", "title": "企業 AI 與醫療數位轉型", "titleEn": "Enterprise AI & Medical Workflow Transformation", "summary": "將過去的系統思維正式落地到企業流程、醫療器材、AI 工具與知識庫建構。", "situation": "進入傳統醫療器材與企業環境,面對文獻龐雜、流程分散、資料混亂、跨部門協作與管理需求。", "actions": "使用 AI 工具、Notion、Ragic、n8n、知識庫與自動化方法,協助文獻整理、競品分析、行銷素材、專案管理與流程重構。", "outcome": "建立可用於醫療器材推廣、內部管理、專案追蹤與決策輔助的數位系統與工作流。", "coreAbility": "將 AI、商業需求、醫療知識與企業流程整合成可運作的系統。", "tags": ["AI Workflow", "Medical Device", "Knowledge Base", "Ragic", "Notion", "n8n", "Business Systems"], "detailUrl": None},
        ],
    },
    "projects": {
        "title": "Selected Projects",
        "subtitle": "精選專案",
        "viewAllUrl": None,
        "items": [
            {"id": 1, "title": "醫療文獻轉譯系統", "description": "將複雜醫學文獻整理成業務與行銷可使用的素材,支援產品推廣與內部溝通。", "skills": ["AI Research", "Medical Writing", "Evidence Mapping"], "image": None, "link": None},
            {"id": 2, "title": "教學內容濃縮與視覺化", "description": "將長時間教學內容濃縮為高密度學習素材,重構資訊順序、畫面引導與學習節奏。", "skills": ["Information Design", "Video Structure", "UX Thinking"], "image": None, "link": None},
            {"id": 3, "title": "企業工作流與知識庫", "description": "使用 Notion / Ragic / 自動化工具整理專案、任務、資料與跨部門資訊。", "skills": ["Workflow Design", "Database Thinking", "Operations"], "image": None, "link": None},
            {"id": 4, "title": "AI 圖文與內容產線", "description": "設計多模型協作流程,將圖文生成、文案、社群平台發布邏輯模板化。", "skills": ["Prompt Engineering", "Content Automation", "Multi-model Workflow"], "image": None, "link": None},
            {"id": 5, "title": "跨域影像與商業敘事", "description": "將學術、產品、品牌或商業需求轉化為可理解的影像腳本與視覺內容。", "skills": ["Storytelling", "Production", "Cross-domain Translation"], "image": None, "link": None},
        ],
    },
    "capabilities": {
        "title": "Capability System",
        "subtitle": "能力系統",
        "viewDetailUrl": None,
        "categories": [
            {"id": 1, "name": "AI & Automation", "skills": ["Prompt Engineering", "ChatGPT", "Claude", "Gemini", "Grok", "n8n", "Ragic", "Notion"]},
            {"id": 2, "name": "Business Systems", "skills": ["Workflow Design", "SOP", "Process Optimization", "B2B Communication", "Funnel Thinking"]},
            {"id": 3, "name": "Content & Communication", "skills": ["Information Design", "Video Production", "Copywriting", "Presentation", "Visual Storytelling"]},
            {"id": 4, "name": "Medical & Research Translation", "skills": ["Medical Device", "Literature Review", "Evidence Summary", "Clinical Communication"]},
            {"id": 5, "name": "Tools", "skills": ["Canva", "FCPX", "Adobe", "Google Workspace", "LINE OA", "Basic Web Tools"]},
        ],
    },
    "nowNext": {
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
        "email": "hansonxdxd@gmail.com",
        "location": "Taipei / Taichung, Taiwan",
        "openTo": [
            "AI Workflow / Business Systems",
            "Medical Device Digital Transformation",
            "Content Operations",
            "0-1 Project Building",
            "Cross-domain Automation Consulting",
        ],
    },
}


# ---------------- Auth Dependency ----------------
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
        email = payload.get("email")
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return {"email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------- Public Routes ----------------
@api_router.get("/")
async def root():
    return {"message": "Career Evolution Map API"}


@api_router.get("/content")
async def get_content():
    """Public endpoint - returns the website content."""
    doc = await db.site_content.find_one({"_id": "main"})
    if not doc:
        # seed default content
        content = deepcopy(DEFAULT_CONTENT)
        await db.site_content.insert_one({"_id": "main", "content": content})
        return content
    return doc["content"]


# ---------------- Auth Routes ----------------
@api_router.post("/auth/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="電子郵件或密碼錯誤")
    token = create_access_token(email)
    return TokenResponse(access_token=token, email=email)


@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


# ---------------- Protected Content Routes ----------------
@api_router.put("/content")
async def update_content(payload: ContentUpdate, current_user: dict = Depends(get_current_user)):
    """Update the full site content."""
    await db.site_content.update_one(
        {"_id": "main"},
        {"$set": {"content": payload.content, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"success": True, "message": "內容已更新"}


@api_router.post("/upload")
async def upload_image(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Upload an image, returns a base64 data URL to embed directly."""
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="僅支援 JPEG, PNG, WebP, GIF 格式")
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="圖片大小不能超過 5MB")
    b64 = base64.b64encode(contents).decode("utf-8")
    data_url = f"data:{file.content_type};base64,{b64}"
    return {"success": True, "url": data_url}


# ---------------- App Config ----------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower().strip()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Hanson",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Admin user seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logger.info(f"Admin password updated: {admin_email}")


async def seed_content():
    doc = await db.site_content.find_one({"_id": "main"})
    if not doc:
        content = deepcopy(DEFAULT_CONTENT)
        await db.site_content.insert_one({"_id": "main", "content": content})
        logger.info("Default site content seeded")


@app.on_event("startup")
async def startup_event():
    await db.users.create_index("email", unique=True)
    await seed_admin()
    await seed_content()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
