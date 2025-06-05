import type React from "react";
import { useState, useRef, useEffect } from "react";
import "./DraggablePanel.css";

interface DraggablePanelProps {
  id: string;
  children: React.ReactNode;
  gridPosition: { x: number; y: number; width: number; height: number };
  onPositionChange: (
    id: string,
    position: { x: number; y: number; width: number; height: number }
  ) => void;
  gridSize: { cols: number; rows: number };
  isVisible: boolean;
}

const DraggablePanel: React.FC<DraggablePanelProps> = ({
  id,
  children,
  gridPosition,
  onPositionChange,
  gridSize,
  isVisible,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if ((e.target as HTMLElement).classList.contains("resize-handle")) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - gridPosition.x * 100,
      y: e.clientY - gridPosition.y * 100,
    });

    document.body.classList.add("dragging-active");
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: gridPosition.width,
      height: gridPosition.height,
    });

    document.body.classList.add("resizing-active");
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.round((e.clientX - dragStart.x) / 100);
        const newY = Math.round((e.clientY - dragStart.y) / 100);

        const clampedX = Math.max(
          0,
          Math.min(newX, gridSize.cols - gridPosition.width)
        );
        const clampedY = Math.max(
          0,
          Math.min(newY, gridSize.rows - gridPosition.height)
        );

        onPositionChange(id, {
          x: clampedX,
          y: clampedY,
          width: gridPosition.width,
          height: gridPosition.height,
        });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        const newWidth = Math.max(
          1,
          Math.min(
            resizeStart.width + Math.round(deltaX / 100),
            gridSize.cols - gridPosition.x
          )
        );
        const newHeight = Math.max(
          1,
          Math.min(
            resizeStart.height + Math.round(deltaY / 100),
            gridSize.rows - gridPosition.y
          )
        );

        onPositionChange(id, {
          x: gridPosition.x,
          y: gridPosition.y,
          width: newWidth,
          height: newHeight,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);

      document.body.classList.remove("dragging-active");
      document.body.classList.remove("resizing-active");
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.classList.remove("dragging-active");
      document.body.classList.remove("resizing-active");
    };
  }, [
    isDragging,
    isResizing,
    dragStart,
    resizeStart,
    gridPosition,
    gridSize,
    id,
    onPositionChange,
  ]);

  if (!isVisible) return null;

  return (
    <div
      ref={panelRef}
      className={`draggable-panel ${isDragging ? "dragging" : ""} ${
        isResizing ? "resizing" : ""
      }`}
      style={{
        gridColumn: `${gridPosition.x + 1} / span ${gridPosition.width}`,
        gridRow: `${gridPosition.y + 1} / span ${gridPosition.height}`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="panel-content">{children}</div>
      <div className="resize-handle" onMouseDown={handleResizeMouseDown}>
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M12 0L0 12h12V0z" fill="currentColor" opacity="0.3" />
          <path d="M8 0v4h4L8 0zM4 8v4h4l-4-4z" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
};

export default DraggablePanel;
