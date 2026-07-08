import {
  LayoutGrid, Settings, Shuffle, Brain, Network, Workflow, Database,
  Boxes, Cpu, GitBranch, Layers, Target, Zap, Compass, Puzzle,
  Lightbulb, TrendingUp, Rocket, Sparkles, Code, LineChart, Microscope,
  Stethoscope, FileText, PenTool, Video, MessageSquare, Share2,
} from 'lucide-react';

// Built-in icon library for Core Thesis (and reusable elsewhere)
export const ICON_LIBRARY = {
  'layout-grid': LayoutGrid,
  'settings': Settings,
  'shuffle': Shuffle,
  'brain': Brain,
  'network': Network,
  'workflow': Workflow,
  'database': Database,
  'boxes': Boxes,
  'cpu': Cpu,
  'git-branch': GitBranch,
  'layers': Layers,
  'target': Target,
  'zap': Zap,
  'compass': Compass,
  'puzzle': Puzzle,
  'lightbulb': Lightbulb,
  'trending-up': TrendingUp,
  'rocket': Rocket,
  'sparkles': Sparkles,
  'code': Code,
  'line-chart': LineChart,
  'microscope': Microscope,
  'stethoscope': Stethoscope,
  'file-text': FileText,
  'pen-tool': PenTool,
  'video': Video,
  'message-square': MessageSquare,
  'share2': Share2,
};

export const ICON_KEYS = Object.keys(ICON_LIBRARY);

export function getIcon(key) {
  return ICON_LIBRARY[key] || LayoutGrid;
}
