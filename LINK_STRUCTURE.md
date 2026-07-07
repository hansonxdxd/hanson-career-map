# 連結結構說明

這份文件說明了網站中所有可以添加連結的位置，以及在後台 CMS 中如何管理這些連結。

## 📌 可以添加連結的位置

### 1. **Hero Section (主視覺區)**
- 三個 CTA 按鈕都已經有內部錨點連結（不需要編輯）

### 2. **Core Thesis (核心主張)**
每個核心主張卡片可以添加：
- `detailUrl`: 個別卡片的"了解更多"連結
- `learnMoreUrl`: Section 級別的"探索完整方法論"按鈕連結

**示例：**
```javascript
coreThesis: {
  learnMoreUrl: "https://notion.so/hanson/core-methodology", // Section 級別連結
  items: [
    {
      title: 'Structure Chaos',
      detailUrl: "https://medium.com/@hanson/structure-chaos" // 個別卡片連結
    }
  ]
}
```

### 3. **Career Evolution Map (職涯進化地圖)** ⭐ 最重要
每個階段卡片可以添加：
- `detailUrl`: 在卡片底部顯示"了解更多"按鈕

**示例：**
```javascript
careerEvolution: {
  stages: [
    {
      period: '1999–2015',
      title: '啟蒙與破局期',
      detailUrl: "https://medium.com/@hanson/origin-story", // 添加此階段的詳細文章連結
      // ... 其他內容
    }
  ]
}
```

### 4. **Selected Projects (精選專案)**
每個專案可以添加：
- `link`: 個別專案的外部連結（GitHub, 作品集, 文章等）
- `image`: 專案圖片 URL
- Section 級別的 `viewAllUrl`: "查看所有專案"按鈕連結

**示例：**
```javascript
projects: {
  viewAllUrl: "https://portfolio.hanson.tw/all-projects", // Section 級別連結
  items: [
    {
      title: '醫療文獻轉譯系統',
      link: "https://github.com/hanson/medical-translation", // 專案連結
      image: "https://example.com/project-image.jpg" // 專案圖片
    }
  ]
}
```

### 5. **Capability System (能力系統)**
- `viewDetailUrl`: Section 級別的"查看完整技能樹"按鈕連結

**示例：**
```javascript
capabilities: {
  viewDetailUrl: "https://notion.so/hanson/skill-tree" // Section 級別連結
}
```

---

## 🎯 後台 CMS 功能

後台系統將提供以下功能：

### ✏️ 內容編輯
- 編輯所有 section 的文字內容
- 管理職涯階段（新增、編輯、刪除、排序）
- 管理專案（新增、編輯、刪除）
- 管理能力標籤

### 🔗 連結管理
- 為每個區塊添加/編輯外部連結
- 支援預覽連結
- 連結驗證

### 📸 圖片管理
- 上傳專案圖片
- 圖片預覽
- 圖片刪除

### 📊 資料結構
所有內容將存儲在 MongoDB 中，結構與 mockData.js 相同，方便前端直接使用。

---

## 🚀 下一步

開發後台 CMS 系統，包括：
1. 登入認證系統
2. Dashboard 管理介面
3. 內容編輯表單
4. 圖片上傳功能
5. API 端點（CRUD 操作）
6. 前端連接真實 API

