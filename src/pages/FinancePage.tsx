import { Button, Col, Input, Row, Space, Table, Tabs, message } from 'antd';
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  Eye,
  Search,
  Send,
  Wallet,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as adminApi from '../api/admin';
import { getErrorMessage } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { SettlementTag } from '../components/StatusTag';
import { StatCard } from '../components/StatCard';
import type { FinanceDashboard, Payment, SettlementStatus } from '../types';
import {
  formatCurrency,
  formatDate,
  paymentMethodLabels,
} from '../utils/labels';

type FinanceTab =
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'RECTIFIED'
  | 'AWAITING_PAYOUT'
  | 'TRANSFERRED'
  | 'DISPUTED';

const TAB_KEYS: FinanceTab[] = [
  'PENDING_REVIEW',
  'VERIFIED',
  'RECTIFIED',
  'AWAITING_PAYOUT',
  'TRANSFERRED',
  'DISPUTED',
];

function isFinanceTab(value: string | null): value is FinanceTab {
  return !!value && (TAB_KEYS as string[]).includes(value);
}

async function fetchPaymentsForTab(tab: FinanceTab): Promise<Payment[]> {
  if (tab === 'AWAITING_PAYOUT') {
    const [verified, rectified] = await Promise.all([
      adminApi.listPayments({ status: 'VERIFIED' }),
      adminApi.listPayments({ status: 'RECTIFIED' }),
    ]);
    return [...verified, ...rectified].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  return adminApi.listPayments({ status: tab as SettlementStatus });
}

export function FinancePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('status');
  const activeTab: FinanceTab = isFinanceTab(tabParam)
    ? tabParam
    : 'PENDING_REVIEW';

  const [dashboard, setDashboard] = useState<FinanceDashboard | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [stats, list] = await Promise.all([
          adminApi.getFinanceDashboard(),
          fetchPaymentsForTab(activeTab),
        ]);
        setDashboard(stats);
        setPayments(list);
      } catch (error) {
        message.error(getErrorMessage(error, 'Falha ao carregar financeiro'));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [activeTab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((p) =>
      [
        p.restaurant?.tradeName,
        p.order?.code,
        p.paymentRef,
        p.transferRef,
        p.restaurant?.slug,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [payments, query]);

  return (
    <div>
      <PageHeader
        title="Financeiro"
        subtitle="Verifique, retifique e repasse pagamentos aos restaurantes"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Pendentes"
            value={dashboard?.pendingReview ?? '—'}
            hint="Aguardando verificação"
            icon={<Wallet size={22} />}
            tone="warning"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Aguardando repasse"
            value={dashboard?.awaitingPayoutCount ?? '—'}
            hint={formatCurrency(dashboard?.awaitingPayoutTotal)}
            icon={<Send size={22} />}
            tone="info"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Transferidos"
            value={dashboard?.transferred ?? '—'}
            hint={formatCurrency(dashboard?.payoutsTotal)}
            icon={<BadgeCheck size={22} />}
            tone="success"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Disputas"
            value={dashboard?.disputed ?? '—'}
            hint={`Bruto ${formatCurrency(dashboard?.grossTotal)} · Taxas ${formatCurrency(dashboard?.feesTotal)}`}
            icon={<AlertTriangle size={22} />}
          />
        </Col>
      </Row>

      <div className="section-block">
        <PageHeader
          title="Pagamentos"
          subtitle="Filtre por status e abra o detalhe para agir"
        />

        <Tabs
          activeKey={activeTab}
          onChange={(key) => setSearchParams({ status: key })}
          items={[
            {
              key: 'PENDING_REVIEW',
              label: `Pendentes (${dashboard?.pendingReview ?? 0})`,
            },
            {
              key: 'VERIFIED',
              label: `Verificados (${dashboard?.verified ?? 0})`,
            },
            {
              key: 'RECTIFIED',
              label: `Retificados (${dashboard?.rectified ?? 0})`,
            },
            {
              key: 'AWAITING_PAYOUT',
              label: `Aguardando repasse (${dashboard?.awaitingPayoutCount ?? 0})`,
            },
            {
              key: 'TRANSFERRED',
              label: `Transferidos (${dashboard?.transferred ?? 0})`,
            },
            {
              key: 'DISPUTED',
              label: `Disputas (${dashboard?.disputed ?? 0})`,
            },
          ]}
        />

        <div className="list-toolbar">
          <Input
            allowClear
            prefix={<Search size={16} />}
            placeholder="Buscar restaurante, pedido, referência..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ maxWidth: 360 }}
          />
        </div>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={filtered}
          pagination={{ pageSize: 12, showSizeChanger: false }}
          locale={{ emptyText: 'Nenhum pagamento neste filtro' }}
          columns={[
            {
              title: 'Data',
              dataIndex: 'createdAt',
              width: 140,
              render: (value: string) => formatDate(value),
            },
            {
              title: 'Restaurante',
              render: (_: unknown, row: Payment) => (
                <div>
                  <Link
                    to={`/restaurants/${row.restaurantId}`}
                    className="table-link"
                  >
                    {row.restaurant?.tradeName ?? '—'}
                  </Link>
                  <div className="table-sub">
                    /{row.restaurant?.slug ?? '—'}
                  </div>
                </div>
              ),
            },
            {
              title: 'Pedido',
              render: (_: unknown, row: Payment) => (
                <div>
                  <div className="item-name">{row.order?.code ?? '—'}</div>
                  <div className="table-sub">
                    {row.order?.customerName || 'Cliente não informado'}
                  </div>
                </div>
              ),
            },
            {
              title: 'Método',
              dataIndex: 'paymentMethod',
              width: 100,
              render: (value: Payment['paymentMethod']) =>
                paymentMethodLabels[value],
            },
            {
              title: 'Bruto',
              dataIndex: 'grossAmount',
              align: 'right' as const,
              render: (value: string | number) => formatCurrency(value),
            },
            {
              title: 'Taxa',
              dataIndex: 'platformFeeAmount',
              align: 'right' as const,
              render: (value: string | number) => formatCurrency(value),
            },
            {
              title: 'Repasse',
              dataIndex: 'payoutAmount',
              align: 'right' as const,
              render: (value: string | number) => (
                <strong>{formatCurrency(value)}</strong>
              ),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (value: SettlementStatus) => (
                <SettlementTag status={value} />
              ),
            },
            {
              title: '',
              key: 'actions',
              width: 110,
              render: (_: unknown, row: Payment) => (
                <Space>
                  <Button
                    icon={<Eye size={16} />}
                    onClick={() => navigate(`/finance/payments/${row.id}`)}
                  >
                    Ver
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </div>

      <div className="finance-footnote">
        <Banknote size={16} />
        <span>
          Verificados e retificados entram na fila de repasse. Use a aba
          &quot;Aguardando repasse&quot; para liquidar.
        </span>
      </div>
    </div>
  );
}
