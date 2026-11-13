import { Tag } from 'antd';
import type { RestaurantStatus, SettlementStatus } from '../types';
import {
  settlementColors,
  settlementLabels,
  statusColors,
  statusLabels,
} from '../utils/labels';

export function StatusTag({ status }: { status: RestaurantStatus }) {
  return <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>;
}

export function SettlementTag({ status }: { status: SettlementStatus }) {
  return (
    <Tag color={settlementColors[status]}>{settlementLabels[status]}</Tag>
  );
}
