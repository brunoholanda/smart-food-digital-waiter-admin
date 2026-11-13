import type { ReactNode } from 'react';
import { Card } from 'antd';

interface StatCardProps {
  title: string;
  value: number | string;
  hint?: string;
  icon: ReactNode;
  tone?: 'default' | 'warning' | 'success' | 'info';
}

export function StatCard({
  title,
  value,
  hint,
  icon,
  tone = 'default',
}: StatCardProps) {
  return (
    <Card className={`stat-card tone-${tone}`} bordered={false}>
      <div className="stat-card-body">
        <div>
          <div className="stat-card-title">{title}</div>
          <div className="stat-card-value">{value}</div>
          {hint ? <div className="stat-card-hint">{hint}</div> : null}
        </div>
        <div className="stat-card-icon">{icon}</div>
      </div>
    </Card>
  );
}
