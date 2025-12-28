import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowRightLeft,
    ArrowUpDown,
    RotateCcw,
    X,
} from 'lucide-react';

interface FullPagePanelProps {
    onClose: () => void;
    onFlipX: () => void;
    onFlipY: () => void;
    onRotate: (degrees: number) => void;
    onReset: () => void;
    currentRotation: number;
    position: { x: number; y: number };
}

const FullPagePanel: React.FC<FullPagePanelProps> = ({
    onClose,
    onFlipX,
    onFlipY,
    onRotate,
    onReset,
    currentRotation,
    position
}) => {
    const dialRef = useRef<HTMLDivElement>(null);

    // Rotation Dial Logic
    const handleDialMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const handleDialMove = (moveEvent: MouseEvent) => {
            if (!dialRef.current) return;
            const rect = dialRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const angleRad = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
            let angleDeg = angleRad * (180 / Math.PI) + 90; // +90 to make top 0
            if (angleDeg < 0) angleDeg += 360;

            // Snap to 45 degrees
            const snappedAngle = Math.round(angleDeg / 45) * 45;
            onRotate(snappedAngle);
        };

        const handleDialUp = () => {
            document.removeEventListener('mousemove', handleDialMove);
            document.removeEventListener('mouseup', handleDialUp);
        };

        document.addEventListener('mousemove', handleDialMove);
        document.addEventListener('mouseup', handleDialUp);
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: position.y,
                left: position.x,
                zIndex: 2147483647,
                backgroundColor: '#222222',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                color: '#e5e7eb',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                width: '260px',
                userSelect: 'none',
                overflow: 'hidden',
                border: '1px solid #333'
            }}
        >
            <style>{`
        .panel-btn {
          background: #333333;
          border: none;
          color: #9ca3af;
          width: 42px;
          height: 42px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.1s;
        }
        .panel-btn:hover {
          background: #444444;
          color: white;
        }
        .panel-btn:active {
          transform: scale(0.95);
        }
      `}</style>

            {/* Header */}
            <div
                style={{
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#2a2a2a',
                    borderBottom: '1px solid #333'
                }}
            >
                <span style={{ fontWeight: 600, fontSize: '13px', color: '#fff' }}>Full Page</span>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex'
                    }}
                >
                    <X size={16} />
                </button>
            </div>

            {/* Controls */}
            <div style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="panel-btn" onClick={onFlipX} title="Flip Horizontal">
                    <ArrowRightLeft size={18} />
                </button>

                <button className="panel-btn" onClick={onFlipY} title="Flip Vertical">
                    <ArrowUpDown size={18} />
                </button>

                {/* Rotation Dial */}
                <div
                    ref={dialRef}
                    onMouseDown={handleDialMouseDown}
                    title="Drag to Rotate"
                    style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: '#333',
                        position: 'relative',
                        cursor: 'pointer',
                        border: '2px solid #444'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '4px',
                        height: '14px',
                        background: '#3b82f6',
                        borderRadius: '2px',
                        transformOrigin: 'bottom center',
                        transform: `translate(-50%, -100%) rotate(${currentRotation}deg)`
                    }} />
                </div>

                <button className="panel-btn" onClick={onReset} title="Reset All">
                    <RotateCcw size={18} />
                </button>
            </div>
        </div>
    );
};

export default FullPagePanel;
