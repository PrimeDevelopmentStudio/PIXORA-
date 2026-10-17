import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import Konva from 'konva';
import { CanvasElement, Project, TextElement, ShapeElement, ImageElement } from '../../types/editor';

export interface EditorCanvasHandle {
  exportDataUrl: (
    format: 'png' | 'jpeg',
    quality: number,
    transparent: boolean,
    pixelRatio: number
  ) => Promise<string | null>;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitToScreen: () => void;
  getZoom: () => number;
}

interface EditorCanvasProps {
  project: Project;
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (updated: CanvasElement) => void;
  onCanvasClick?: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export const EditorCanvas = forwardRef<EditorCanvasHandle, EditorCanvasProps>(
  (
    {
      project,
      selectedId,
      onSelectElement,
      onUpdateElement,
      zoom,
      onZoomChange,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage | null>(null);
    const mainLayerRef = useRef<Konva.Layer | null>(null);
    const bgLayerRef = useRef<Konva.Layer | null>(null);
    const bgRectRef = useRef<Konva.Rect | null>(null);
    const transformerRef = useRef<Konva.Transformer | null>(null);
    const nodeMapRef = useRef<Map<string, Konva.Shape>>(new Map());
    const isTransformingRef = useRef(false);

    // Track pan position
    const [panPos, setPanPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const isPanningRef = useRef(false);
    const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    // Calculate fit-to-screen zoom
    const calculateFitZoom = useCallback(() => {
      if (!containerRef.current) return 1;
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth <= 0 || clientHeight <= 0) return 1;

      // Available space with 40px margin
      const availW = Math.max(100, clientWidth - 80);
      const availH = Math.max(100, clientHeight - 80);

      const scaleX = availW / project.width;
      const scaleY = availH / project.height;
      const fitScale = Math.min(scaleX, scaleY);
      return Math.min(Math.max(fitScale, 0.1), 3);
    }, [project.width, project.height]);

    // Initial fit on mount or project dimension change
    useEffect(() => {
      const fit = calculateFitZoom();
      onZoomChange(Number(fit.toFixed(2)));
    }, [project.width, project.height, calculateFitZoom, onZoomChange]);

    // Setup Konva Stage once
    useEffect(() => {
      if (!containerRef.current) return;

      const stage = new Konva.Stage({
        container: containerRef.current,
        width: containerRef.current.clientWidth || 800,
        height: containerRef.current.clientHeight || 600,
      });
      stageRef.current = stage;

      const bgLayer = new Konva.Layer();
      const mainLayer = new Konva.Layer();
      stage.add(bgLayer);
      stage.add(mainLayer);

      bgLayerRef.current = bgLayer;
      mainLayerRef.current = mainLayer;

      // Transformer configuration
      const tr = new Konva.Transformer({
        nodes: [],
        keepRatio: false,
        enabledAnchors: [
          'top-left',
          'top-center',
          'top-right',
          'middle-right',
          'bottom-right',
          'bottom-center',
          'bottom-left',
          'middle-left',
        ],
        rotateAnchorOffset: 30,
        borderStroke: '#8b5cf6',
        borderStrokeWidth: 2,
        anchorStroke: '#8b5cf6',
        anchorFill: '#ffffff',
        anchorSize: 10,
        anchorCornerRadius: 3,
        boundBoxFunc: (oldBox, newBox) => {
          // Prevent invert or 0 size
          if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) {
            return oldBox;
          }
          return newBox;
        },
      });
      mainLayer.add(tr);
      transformerRef.current = tr;

      // Background rect
      const bgRect = new Konva.Rect({
        x: 0,
        y: 0,
        width: project.width,
        height: project.height,
        fill: project.backgroundColor || '#ffffff',
        listening: true,
      });
      bgLayer.add(bgRect);
      bgRectRef.current = bgRect;

      // Deselect when clicking on canvas background or stage
      stage.on('tap click', (e) => {
        // If clicked on stage empty area or background rect
        if (e.target === stage || e.target === bgRect) {
          onSelectElement(null);
        }
      });

      // Window resize listener
      const handleResize = () => {
        if (!containerRef.current || !stageRef.current) return;
        stageRef.current.width(containerRef.current.clientWidth);
        stageRef.current.height(containerRef.current.clientHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        stage.destroy();
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Update Stage size on container layout
    useEffect(() => {
      if (!containerRef.current || !stageRef.current) return;
      stageRef.current.width(containerRef.current.clientWidth);
      stageRef.current.height(containerRef.current.clientHeight);
    }, [project.width, project.height]);

    // Update background color & transparency
    useEffect(() => {
      if (!bgRectRef.current || !bgLayerRef.current) return;
      bgRectRef.current.width(project.width);
      bgRectRef.current.height(project.height);

      if (project.isTransparent) {
        bgRectRef.current.fill('transparent');
        bgRectRef.current.stroke('#475569');
        bgRectRef.current.strokeWidth(1);
        bgRectRef.current.dash([6, 6]);
      } else {
        bgRectRef.current.fill(project.backgroundColor || '#ffffff');
        bgRectRef.current.stroke('#334155');
        bgRectRef.current.strokeWidth(1);
        bgRectRef.current.dash([]);
      }
      bgLayerRef.current.batchDraw();
    }, [project.backgroundColor, project.isTransparent, project.width, project.height]);

    // Synchronize Canvas Elements into Konva Nodes
    useEffect(() => {
      const mainLayer = mainLayerRef.current;
      const tr = transformerRef.current;
      if (!mainLayer || !tr) return;

      const nodeMap = nodeMapRef.current;
      const currentIds = new Set(project.elements.map((el) => el.id));

      // 1. Remove nodes no longer in elements
      for (const [id, node] of nodeMap.entries()) {
        if (!currentIds.has(id)) {
          node.destroy();
          nodeMap.delete(id);
        }
      }

      // 2. Add or update elements
      project.elements.forEach((el) => {
        let node = nodeMap.get(el.id);

        if (!node) {
          // Create new node based on element type
          node = createKonvaNode(el);
          node.setAttr('id', el.id);
          nodeMap.set(el.id, node);
          mainLayer.add(node);

          // Event listeners
          node.on('tap click', (e) => {
            e.cancelBubble = true;
            onSelectElement(el.id);
          });

          node.on('dragstart', () => {
            isTransformingRef.current = true;
          });

          node.on('dragend', () => {
            isTransformingRef.current = false;
            if (!node) return;
            onUpdateElement({
              ...el,
              x: Math.round(node.x()),
              y: Math.round(node.y()),
            });
          });

          node.on('transformstart', () => {
            isTransformingRef.current = true;
          });

          node.on('transformend', () => {
            isTransformingRef.current = false;
            if (!node) return;

            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            const newRotation = Math.round(node.rotation());
            const newX = Math.round(node.x());
            const newY = Math.round(node.y());

            // Normalize scale into width/height for rectangles and images, or keep for text
            if (el.type === 'rect' || el.type === 'image') {
              const newWidth = Math.max(10, Math.round(node.width() * Math.abs(scaleX)));
              const newHeight = Math.max(10, Math.round(node.height() * Math.abs(scaleY)));
              node.scaleX(scaleX < 0 ? -1 : 1);
              node.scaleY(scaleY < 0 ? -1 : 1);
              node.width(newWidth);
              node.height(newHeight);

              onUpdateElement({
                ...el,
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight,
                rotation: newRotation,
                scaleX: scaleX < 0 ? -1 : 1,
                scaleY: scaleY < 0 ? -1 : 1,
              });
            } else if (el.type === 'circle') {
              const radius = Math.max(5, Math.round((node.width() / 2) * Math.abs(scaleX)));
              node.scaleX(1);
              node.scaleY(1);
              node.width(radius * 2);
              node.height(radius * 2);

              onUpdateElement({
                ...el,
                x: newX,
                y: newY,
                width: radius * 2,
                height: radius * 2,
                rotation: newRotation,
              });
            } else {
              onUpdateElement({
                ...el,
                x: newX,
                y: newY,
                rotation: newRotation,
                scaleX: Number(scaleX.toFixed(3)),
                scaleY: Number(scaleY.toFixed(3)),
              });
            }
          });
        }

        // Apply current properties to existing node
        applyPropertiesToNode(node, el);
      });

      // Keep Transformer on top of all nodes
      tr.moveToTop();
      mainLayer.batchDraw();
    }, [project.elements, onSelectElement, onUpdateElement]);

    // Update Transformer selection
    useEffect(() => {
      const tr = transformerRef.current;
      const mainLayer = mainLayerRef.current;
      if (!tr || !mainLayer) return;

      if (!selectedId) {
        tr.nodes([]);
      } else {
        const selectedNode = nodeMapRef.current.get(selectedId);
        const selectedEl = project.elements.find((el) => el.id === selectedId);

        if (selectedNode && selectedEl && !selectedEl.isLocked && selectedEl.isVisible !== false) {
          tr.nodes([selectedNode as any]);
          // For text, keep aspect ratio locked or unlocked based on preference
          tr.keepRatio(selectedEl.type === 'circle' || selectedEl.type === 'star');
        } else {
          tr.nodes([]);
        }
      }
      mainLayer.batchDraw();
    }, [selectedId, project.elements]);

    // Center Stage and Apply Zoom / Pan
    useEffect(() => {
      const stage = stageRef.current;
      const container = containerRef.current;
      if (!stage || !container) return;

      const containerWidth = container.clientWidth || 800;
      const containerHeight = container.clientHeight || 600;

      // Position the artboard centered in the container
      const artboardCenterX = (containerWidth - project.width * zoom) / 2 + panPos.x;
      const artboardCenterY = (containerHeight - project.height * zoom) / 2 + panPos.y;

      stage.scale({ x: zoom, y: zoom });
      stage.position({ x: artboardCenterX, y: artboardCenterY });
      stage.batchDraw();
    }, [zoom, panPos, project.width, project.height]);

    // Handle Pan with spacebar / middle mouse / drag
    const handleMouseDown = (e: React.MouseEvent) => {
      // Middle click or Space+click
      if (e.button === 1 || e.shiftKey) {
        isPanningRef.current = true;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
      }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isPanningRef.current) return;
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      setPanPos((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    };

    const handleMouseUp = () => {
      isPanningRef.current = false;
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      exportDataUrl: async (
        format: 'png' | 'jpeg',
        quality: number,
        transparent: boolean,
        pixelRatio: number
      ) => {
        const stage = stageRef.current;
        const tr = transformerRef.current;
        const bgRect = bgRectRef.current;
        if (!stage || !tr || !bgRect) return null;

        // 1. Temporarily detach transformer
        const currentNodes = tr.nodes();
        tr.nodes([]);

        // 2. Temporarily adjust background for transparency
        const prevFill = bgRect.fill();
        const prevStroke = bgRect.stroke();
        const prevDash = bgRect.dash();

        if (transparent) {
          bgRect.fill('transparent');
          bgRect.stroke('transparent');
        } else {
          bgRect.stroke('transparent');
        }

        // 3. Reset stage transform to native 1:1 artboard coordinates
        const prevScale = stage.scale();
        const prevPos = stage.position();

        stage.scale({ x: 1, y: 1 });
        stage.position({ x: 0, y: 0 });

        stage.batchDraw();

        // 4. Capture at artboard exact bounds
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const dataUrl = stage.toDataURL({
          x: 0,
          y: 0,
          width: project.width,
          height: project.height,
          pixelRatio: Math.max(1, pixelRatio),
          mimeType,
          quality: format === 'jpeg' ? quality : 1,
        });

        // 5. Restore previous UI state
        stage.scale(prevScale);
        stage.position(prevPos);
        bgRect.fill(prevFill);
        bgRect.stroke(prevStroke);
        bgRect.dash(prevDash);
        tr.nodes(currentNodes);
        stage.batchDraw();

        return dataUrl;
      },
      zoomIn: () => onZoomChange(Math.min(zoom * 1.25, 4)),
      zoomOut: () => onZoomChange(Math.max(zoom * 0.8, 0.1)),
      resetZoom: () => {
        setPanPos({ x: 0, y: 0 });
        onZoomChange(1);
      },
      fitToScreen: () => {
        setPanPos({ x: 0, y: 0 });
        const fit = calculateFitZoom();
        onZoomChange(Number(fit.toFixed(2)));
      },
      getZoom: () => zoom,
    }));

    return (
      <div
        className="relative w-full h-full overflow-hidden flex items-center justify-center checkerboard-bg select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div ref={containerRef} className="w-full h-full absolute inset-0" />
      </div>
    );
  }
);

EditorCanvas.displayName = 'EditorCanvas';

// Helper: Factory for Konva Nodes
function createKonvaNode(el: CanvasElement): Konva.Shape {
  switch (el.type) {
    case 'text': {
      const textEl = el as TextElement;
      return new Konva.Text({
        x: textEl.x,
        y: textEl.y,
        text: textEl.text,
        fontSize: textEl.fontSize || 32,
        fontFamily: textEl.fontFamily || 'Inter',
        fill: textEl.fill || '#000000',
        fontStyle: `${textEl.fontStyle || 'normal'} ${textEl.fontWeight || 'normal'}`,
        align: textEl.align || 'left',
        letterSpacing: textEl.letterSpacing || 0,
        lineHeight: textEl.lineHeight || 1.2,
        draggable: !textEl.isLocked,
        visible: textEl.isVisible !== false,
      });
    }

    case 'rect': {
      const shape = el as ShapeElement;
      return new Konva.Rect({
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
        fill: shape.fill || '#8b5cf6',
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth || 0,
        cornerRadius: shape.cornerRadius || 0,
        draggable: !shape.isLocked,
        visible: shape.isVisible !== false,
      });
    }

    case 'circle': {
      const shape = el as ShapeElement;
      const radius = (shape.width || 100) / 2;
      return new Konva.Circle({
        x: shape.x,
        y: shape.y,
        radius,
        fill: shape.fill || '#ec4899',
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth || 0,
        draggable: !shape.isLocked,
        visible: shape.isVisible !== false,
      });
    }

    case 'triangle': {
      const shape = el as ShapeElement;
      const radius = (shape.width || 100) / 2;
      return new Konva.RegularPolygon({
        x: shape.x,
        y: shape.y,
        sides: 3,
        radius,
        fill: shape.fill || '#06b6d4',
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth || 0,
        draggable: !shape.isLocked,
        visible: shape.isVisible !== false,
      });
    }

    case 'star': {
      const shape = el as ShapeElement;
      return new Konva.Star({
        x: shape.x,
        y: shape.y,
        numPoints: shape.numPoints || 5,
        innerRadius: shape.innerRadius || 30,
        outerRadius: shape.outerRadius || 60,
        fill: shape.fill || '#f59e0b',
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth || 0,
        draggable: !shape.isLocked,
        visible: shape.isVisible !== false,
      });
    }

    case 'line': {
      const shape = el as ShapeElement;
      return new Konva.Line({
        x: shape.x,
        y: shape.y,
        points: shape.points || [0, 0, shape.width || 100, 0],
        stroke: shape.stroke || shape.fill || '#ffffff',
        strokeWidth: shape.strokeWidth || 4,
        lineCap: 'round',
        lineJoin: 'round',
        draggable: !shape.isLocked,
        visible: shape.isVisible !== false,
      });
    }

    case 'arrow': {
      const shape = el as ShapeElement;
      return new Konva.Arrow({
        x: shape.x,
        y: shape.y,
        points: shape.points || [0, 0, shape.width || 100, 0],
        pointerLength: 15,
        pointerWidth: 15,
        fill: shape.fill || '#8b5cf6',
        stroke: shape.stroke || shape.fill || '#8b5cf6',
        strokeWidth: shape.strokeWidth || 4,
        draggable: !shape.isLocked,
        visible: shape.isVisible !== false,
      });
    }

    case 'image': {
      const imgEl = el as ImageElement;
      const konvaImg = new Konva.Image({
        image: undefined as any,
        x: imgEl.x,
        y: imgEl.y,
        width: imgEl.width || 200,
        height: imgEl.height || 200,
        cornerRadius: imgEl.cornerRadius || 0,
        draggable: !imgEl.isLocked,
        visible: imgEl.isVisible !== false,
      });

      const imageObj = new window.Image();
      imageObj.crossOrigin = 'anonymous';
      imageObj.src = imgEl.src;
      imageObj.onload = () => {
        konvaImg.image(imageObj);
        konvaImg.getLayer()?.batchDraw();
      };

      return konvaImg;
    }

    default: {
      const fallbackEl = el as any;
      return new Konva.Rect({
        x: fallbackEl.x || 0,
        y: fallbackEl.y || 0,
        width: fallbackEl.width || 100,
        height: fallbackEl.height || 100,
        fill: '#888888',
        draggable: !fallbackEl.isLocked,
      });
    }
  }
}

// Helper: Apply reactive element changes to Konva Node
function applyPropertiesToNode(node: Konva.Node, el: CanvasElement) {
  node.x(el.x);
  node.y(el.y);
  node.rotation(el.rotation || 0);
  node.scaleX(el.scaleX ?? 1);
  node.scaleY(el.scaleY ?? 1);
  node.opacity(el.opacity ?? 1);
  node.draggable(!el.isLocked);
  node.visible(el.isVisible !== false);

  if (el.type === 'text') {
    const textNode = node as Konva.Text;
    const textEl = el as TextElement;
    textNode.text(textEl.text);
    textNode.fontSize(textEl.fontSize || 32);
    textNode.fontFamily(textEl.fontFamily || 'Inter');
    textNode.fill(textEl.fill || '#ffffff');
    textNode.align(textEl.align || 'left');
    textNode.letterSpacing(textEl.letterSpacing || 0);
    textNode.lineHeight(textEl.lineHeight || 1.2);
    textNode.fontStyle(`${textEl.fontStyle || 'normal'} ${textEl.fontWeight || 'normal'}`);
  } else if (el.type === 'rect') {
    const rectNode = node as Konva.Rect;
    const shapeEl = el as ShapeElement;
    rectNode.width(shapeEl.width);
    rectNode.height(shapeEl.height);
    rectNode.fill(shapeEl.fill);
    rectNode.stroke(shapeEl.stroke);
    rectNode.strokeWidth(shapeEl.strokeWidth || 0);
    rectNode.cornerRadius(shapeEl.cornerRadius || 0);
  } else if (el.type === 'circle') {
    const circleNode = node as Konva.Circle;
    const shapeEl = el as ShapeElement;
    circleNode.radius((shapeEl.width || 100) / 2);
    circleNode.fill(shapeEl.fill);
    circleNode.stroke(shapeEl.stroke);
    circleNode.strokeWidth(shapeEl.strokeWidth || 0);
  } else if (el.type === 'image') {
    const imgNode = node as Konva.Image;
    const imgEl = el as ImageElement;
    imgNode.width(imgEl.width);
    imgNode.height(imgEl.height);
    imgNode.cornerRadius(imgEl.cornerRadius || 0);
  }
}
