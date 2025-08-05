'use client';

import { useEffect, useRef } from 'react';
import { KnowledgeGraph as KnowledgeGraphType } from '@/types/knowledge';

interface KnowledgeGraphProps {
  data: KnowledgeGraphType | null;
}

export default function KnowledgeGraph({ data }: KnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas 크기 설정
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 간단한 네트워크 그래프 시각화
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.3;

    // 노드 그리기
    data.nodes.forEach((node, index) => {
      const angle = (index / data.nodes.length) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // 노드 타입별 색상
      const colors = {
        concept: '#3B82F6',
        entity: '#10B981',
        relationship: '#F59E0B',
        document: '#8B5CF6'
      };

      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = colors[node.type] || '#6B7280';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 라벨 그리기
      ctx.fillStyle = '#1F2937';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, x, y + 35);
    });

    // 관계 그리기
    data.relationships.forEach((rel) => {
      const startIndex = data.nodes.findIndex(n => n.id === rel.startNode);
      const endIndex = data.nodes.findIndex(n => n.id === rel.endNode);
      
      if (startIndex >= 0 && endIndex >= 0) {
        const startAngle = (startIndex / data.nodes.length) * 2 * Math.PI;
        const endAngle = (endIndex / data.nodes.length) * 2 * Math.PI;
        
        const startX = centerX + Math.cos(startAngle) * radius;
        const startY = centerY + Math.sin(startAngle) * radius;
        const endX = centerX + Math.cos(endAngle) * radius;
        const endY = centerY + Math.sin(endAngle) * radius;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#9CA3AF';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  }, [data]);

  if (!data) {
    return (
      <div className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">질문을 입력하면 지식 그래프가 여기에 표시됩니다</p>
      </div>
    );
  }

  return (
    <div className="w-full border border-gray-300 rounded-lg bg-white">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">지식 그래프 시각화</h3>
        <p className="text-sm text-gray-600">
          노드: {data.nodes.length}개, 관계: {data.relationships.length}개
        </p>
      </div>
      <div className="p-4">
        <canvas
          ref={canvasRef}
          className="w-full h-96 border border-gray-200 rounded"
        />
      </div>
    </div>
  );
}