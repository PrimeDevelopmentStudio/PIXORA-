export type ElementType =
  | 'text'
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'star'
  | 'line'
  | 'arrow'
  | 'image';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  scaleX: number;
  scaleY: number;
  opacity: number; // 0 to 1
  isLocked?: boolean;
  isVisible?: boolean;
  name?: string;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontStyle?: 'normal' | 'italic';
  fontWeight?: 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  textDecoration?: 'none' | 'underline';
  align: 'left' | 'center' | 'right' | 'justify';
  letterSpacing?: number;
  lineHeight?: number;
  backgroundColor?: string;
}

export interface ShapeElement extends BaseElement {
  type: 'rect' | 'circle' | 'triangle' | 'star' | 'line' | 'arrow';
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number; // for rect
  numPoints?: number; // for star
  innerRadius?: number; // for star
  outerRadius?: number; // for star
  points?: number[]; // for line/arrow
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  naturalWidth?: number;
  naturalHeight?: number;
  cornerRadius?: number;
  filterPreset?: 'none' | 'grayscale' | 'sepia' | 'vintage' | 'warm' | 'cool' | 'vivid';
  brightness?: number; // -1 to 1
  contrast?: number; // -100 to 100
  stroke?: string;
  strokeWidth?: number;
}

export type CanvasElement = TextElement | ShapeElement | ImageElement;

export interface Project {
  id: string;
  title: string;
  width: number;
  height: number;
  backgroundColor: string;
  isTransparent?: boolean;
  elements: CanvasElement[];
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
}

export type TemplateCategory =
  | 'all'
  | 'social'
  | 'youtube'
  | 'posters'
  | 'invitations'
  | 'presentations'
  | 'logos'
  | 'business'
  | 'photo';

export interface Template {
  id: string;
  title: string;
  category: TemplateCategory;
  categoryLabel: string;
  width: number;
  height: number;
  backgroundColor: string;
  isTransparent?: boolean;
  elements: CanvasElement[];
  tags: string[];
  description?: string;
  isCommunity?: boolean;
  authorName?: string;
  createdAt?: number;
}

export interface CanvasDimensions {
  width: number;
  height: number;
  label: string;
  iconName?: string;
  description?: string;
  category?: TemplateCategory;
}

export type ActiveSidebarTab =
  | 'templates'
  | 'elements'
  | 'text'
  | 'uploads'
  | 'background'
  | 'layers';
