// 所有網站內容集中管理，方便日後透過 CMS 編輯

export const siteContent = {
  hero: {
    name: 'Hanson 曹瀚升',
    title: 'AI Business Systems Architect',
    subtitle: 'AI 商業系統架構師',
    tagline: '把混亂轉化為系統,把限制轉化為解法。',
    description: '這不只是一份履歷,而是一張能力形成地圖:記錄我如何一路把跨域經驗、商業問題與非結構化資訊,轉化為系統設計、流程重構與 AI 自動化能力。',
    ctas: [
      { text: 'View Evolution Map', href: '#evolution' },
      { text: 'View Selected Projects', href: '#projects' },
      { text: 'Contact Hanson', href: '#contact' }
    ]
  },

  coreThesis: {
    title: 'Core Thesis',
    subtitle: '核心主張',
    learnMoreUrl: null,
    items: [
      {
        id: 1,
        title: 'Structure Chaos',
        description: '把龐雜資訊、混亂流程與零散經驗,整理成清楚架構。',
        icon: 'layout-grid',
        detailUrl: null
      },
      {
        id: 2,
        title: 'Build Systems',
        description: '設計可複製、可維護、可擴張的流程、模板、知識庫與自動化管線。',
        icon: 'settings',
        detailUrl: null
      },
      {
        id: 3,
        title: 'Translate Across Domains',
        description: '能在醫療、影像、業務、行銷、AI 工具與企業流程之間轉譯需求。',
        icon: 'shuffle',
        detailUrl: null
      }
    ]
  },

  careerEvolution: {
    title: 'Career Evolution Map',
    subtitle: '職涯進化地圖',
    stages: [
      {
        id: 1,
        period: '1999–2015',
        title: '啟蒙與破局期',
        titleEn: 'Origin of Systems Thinking',
        summary: '從遊戲規則、發明展與知識整理中,形成對「系統」的直覺。',
        situation: '面對無聊的遊戲規則、零散的學習資料,以及現實問題中缺乏解法的狀態。',
        actions: '主動設計遊戲規則、創造玩法系統、嘗試發明原型,並將複雜知識重新整理成視覺化結構。',
        outcome: '建立了早期的痛點洞察、MVP 原型、知識結構化與視覺化能力。',
        coreAbility: '看見混亂中的結構,將零散資訊轉化為可理解的系統。',
        tags: ['Systems Thinking', 'MVP', 'Knowledge Mapping', 'Visual Structure'],
        detailUrl: null
      },
      {
        id: 2,
        period: '2016–2020',
        title: '資源整合與跨界統籌',
        titleEn: 'Resourceful Creation & Cross-domain Execution',
        summary: '在低預算、高限制的影像與舞台專案中,學會用有限資源創造高完成度成果。',
        situation: '學生時期面對預算有限、技術不足、場地與人力限制,卻需要完成高品質舞台、影像與專案成果。',
        actions: '結合魔術、手作、影像、企劃、談判與跨領域學習,用低成本方法替代昂貴技術解法。',
        outcome: '完成大型舞台演出、影像專案與競賽作品,累積跨域統籌、資源調度與創意解法能力。',
        coreAbility: '在資源有限的情況下,快速拼出可落地的 MVP 解法。',
        tags: ['Resource Integration', 'Creative Production', 'Low-cost MVP', 'Storytelling'],
        detailUrl: null
      },
      {
        id: 3,
        period: '2020–2023',
        title: '流程降維與自動化覺醒',
        titleEn: 'Workflow Design & Automation Mindset',
        summary: '在業務、內容與自媒體實作中,開始把重複工作拆成模板、流程與產線。',
        situation: '面對繁瑣紙本流程、業務溝通、內容產製與剪輯工作中的大量重複勞動。',
        actions: '重構表格與 SOP,建立防呆流程;將內容製作拆解成模板化管線,降低重複工作成本。',
        outcome: '形成業務流程重構、內容流水線、自動化思維與轉換漏斗觀念。',
        coreAbility: '把勞力密集工作拆解為可複製的流程與模板。',
        tags: ['Workflow Design', 'SOP', 'Content Pipeline', 'Automation Thinking'],
        detailUrl: null
      },
      {
        id: 4,
        period: '2024–2025',
        title: '商業系統觀察與資訊降維',
        titleEn: 'Business Systems & Information Compression',
        summary: '在高密度內容、影像與商業專案中,鍛鍊複雜資訊拆解與視覺化轉譯能力。',
        situation: '面對大量教學內容、複雜商業資訊、跨領域專案與需要快速理解的陌生領域。',
        actions: '萃取重點、重組敘事、視覺化複雜流程,將長時間內容濃縮成可學習、可溝通、可交付的成果。',
        outcome: '將長篇內容濃縮為精簡課程與高密度素材,建立資訊降維、視覺轉譯與商業理解能力。',
        coreAbility: '把高噪音資訊壓縮成清楚、可傳遞、可決策的內容系統。',
        tags: ['Information Compression', 'Visual UX', 'Business Translation', 'Content Systems'],
        detailUrl: null
      },
      {
        id: 5,
        period: '2025–Now',
        title: '企業 AI 與醫療數位轉型',
        titleEn: 'Enterprise AI & Medical Workflow Transformation',
        summary: '將過去的系統思維正式落地到企業流程、醫療器材、AI 工具與知識庫建構。',
        situation: '進入傳統醫療器材與企業環境,面對文獻龐雜、流程分散、資料混亂、跨部門協作與管理需求。',
        actions: '使用 AI 工具、Notion、Ragic、n8n、知識庫與自動化方法,協助文獻整理、競品分析、行銷素材、專案管理與流程重構。',
        outcome: '建立可用於醫療器材推廣、內部管理、專案追蹤與決策輔助的數位系統與工作流。',
        coreAbility: '將 AI、商業需求、醫療知識與企業流程整合成可運作的系統。',
        tags: ['AI Workflow', 'Medical Device', 'Knowledge Base', 'Ragic', 'Notion', 'n8n', 'Business Systems'],
        detailUrl: null
      }
    ]
  },

  projects: {
    title: 'Selected Projects',
    subtitle: '精選專案',
    viewAllUrl: null,
    items: [
      {
        id: 1,
        title: '醫療文獻轉譯系統',
        description: '將複雜醫學文獻整理成業務與行銷可使用的素材,支援產品推廣與內部溝通。',
        skills: ['AI Research', 'Medical Writing', 'Evidence Mapping'],
        image: null,
        link: null
      },
      {
        id: 2,
        title: '教學內容濃縮與視覺化',
        description: '將長時間教學內容濃縮為高密度學習素材,重構資訊順序、畫面引導與學習節奏。',
        skills: ['Information Design', 'Video Structure', 'UX Thinking'],
        image: null,
        link: null
      },
      {
        id: 3,
        title: '企業工作流與知識庫',
        description: '使用 Notion / Ragic / 自動化工具整理專案、任務、資料與跨部門資訊。',
        skills: ['Workflow Design', 'Database Thinking', 'Operations'],
        image: null,
        link: null
      },
      {
        id: 4,
        title: 'AI 圖文與內容產線',
        description: '設計多模型協作流程,將圖文生成、文案、社群平台發布邏輯模板化。',
        skills: ['Prompt Engineering', 'Content Automation', 'Multi-model Workflow'],
        image: null,
        link: null
      },
      {
        id: 5,
        title: '跨域影像與商業敘事',
        description: '將學術、產品、品牌或商業需求轉化為可理解的影像腳本與視覺內容。',
        skills: ['Storytelling', 'Production', 'Cross-domain Translation'],
        image: null,
        link: null
      }
    ]
  },

  capabilities: {
    title: 'Capability System',
    subtitle: '能力系統',
    viewDetailUrl: null,
    categories: [
      {
        id: 1,
        name: 'AI & Automation',
        skills: ['Prompt Engineering', 'ChatGPT', 'Claude', 'Gemini', 'Grok', 'n8n', 'Ragic', 'Notion']
      },
      {
        id: 2,
        name: 'Business Systems',
        skills: ['Workflow Design', 'SOP', 'Process Optimization', 'B2B Communication', 'Funnel Thinking']
      },
      {
        id: 3,
        name: 'Content & Communication',
        skills: ['Information Design', 'Video Production', 'Copywriting', 'Presentation', 'Visual Storytelling']
      },
      {
        id: 4,
        name: 'Medical & Research Translation',
        skills: ['Medical Device', 'Literature Review', 'Evidence Summary', 'Clinical Communication']
      },
      {
        id: 5,
        name: 'Tools',
        skills: ['Canva', 'FCPX', 'Adobe', 'Google Workspace', 'LINE OA', 'Basic Web Tools']
      }
    ]
  },

  nowNext: {
    title: 'Now, I build systems for the real world.',
    content: [
      '我已經在教育、影像、業務、內容、醫療與 AI 自動化裡,反覆驗證了同一種能力:',
      '看見混亂,拆解規則,重建系統。',
      '接下來,我想把這套能力放到更大的商業戰場:',
      '幫助企業建立真正能落地、能被團隊使用、能支援決策的 AI 工作流與數位系統。'
    ],
    closingEn: 'How far can this system-building ability scale in your organization?',
    closingZh: '這套把混亂轉化為系統的能力,能在貴公司的戰場被放大到什麼程度?'
  },

  contact: {
    email: 'hansonxdxd@gmail.com',
    location: 'Taipei / Taichung, Taiwan',
    openTo: [
      'AI Workflow / Business Systems',
      'Medical Device Digital Transformation',
      'Content Operations',
      '0-1 Project Building',
      'Cross-domain Automation Consulting'
    ]
  }
};
