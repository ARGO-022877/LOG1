'use client';

import { KnowledgeGraph } from '@/types/knowledge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Database, GitBranch, FileText, Users } from 'lucide-react';

interface DataStatsProps {
  data: KnowledgeGraph | null;
}

export default function DataStats({ data }: DataStatsProps) {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Database, label: '총 노드', value: 0, color: 'blue' },
          { icon: GitBranch, label: '관계', value: 0, color: 'green' },
          { icon: FileText, label: '문서', value: 0, color: 'purple' },
          { icon: Users, label: '개념', value: 0, color: 'orange' }
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-base border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body font-medium text-text-secondary">{stat.label}</p>
                <p className="text-h2 font-bold text-text-primary">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 text-${stat.color}-500`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const nodesByType = data.nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(nodesByType).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count
  }));

  const stats = [
    { icon: Database, label: '총 노드', value: data.nodes.length, color: 'blue' },
    { icon: GitBranch, label: '관계', value: data.relationships.length, color: 'green' },
    { icon: FileText, label: '문서', value: nodesByType.document || 0, color: 'purple' },
    { icon: Users, label: '개념', value: nodesByType.concept || 0, color: 'orange' }
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-base border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body font-medium text-text-secondary">{stat.label}</p>
                <p className="text-h2 font-bold text-text-primary">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 text-${stat.color}-500`} />
            </div>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-base border border-gray-200">
          <h3 className="text-h3 font-bold text-text-primary mb-4">노드 타입별 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#42A5F5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}