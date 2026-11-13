import { Col, Row, Table, message } from 'antd';
import {
  BadgeCheck,
  ClipboardList,
  Clock3,
  Store,
  Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as adminApi from '../api/admin';
import { getErrorMessage } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { StatusTag } from '../components/StatusTag';
import type { DashboardStats, FinanceDashboard, Restaurant } from '../types';
import { cuisineLabels, formatCurrency, formatDate } from '../utils/labels';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [finance, setFinance] = useState<FinanceDashboard | null>(null);
  const [pending, setPending] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [dashboard, list, financeStats] = await Promise.all([
          adminApi.getDashboard(),
          adminApi.listRestaurants('PENDING'),
          adminApi.getFinanceDashboard().catch(() => null),
        ]);
        setStats(dashboard);
        setPending(list.slice(0, 8));
        setFinance(financeStats);
      } catch (error) {
        message.error(getErrorMessage(error, 'Falha ao carregar dashboard'));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da operação SmartFood"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Restaurantes"
            value={stats?.total ?? '—'}
            hint="Total cadastrado"
            icon={<Store size={22} />}
            tone="info"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Pendentes"
            value={stats?.pending ?? '—'}
            hint="Aguardando revisão"
            icon={<Clock3 size={22} />}
            tone="warning"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Aprovados"
            value={stats?.approved ?? '—'}
            hint="Aptos a publicar"
            icon={<BadgeCheck size={22} />}
            tone="success"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Itens de cardápio"
            value={stats?.items ?? '—'}
            hint="No ecossistema"
            icon={<ClipboardList size={22} />}
          />
        </Col>
        {finance ? (
          <Col xs={24} sm={12} xl={6}>
            <Link to="/finance?status=PENDING_REVIEW" className="stat-card-link">
              <StatCard
                title="Pagamentos pendentes"
                value={finance.pendingReview}
                hint={
                  finance.awaitingPayoutCount > 0
                    ? `${finance.awaitingPayoutCount} aguardando repasse · ${formatCurrency(finance.awaitingPayoutTotal)}`
                    : 'Ir para o financeiro'
                }
                icon={<Wallet size={22} />}
                tone="warning"
              />
            </Link>
          </Col>
        ) : null}
      </Row>

      <div className="section-block">
        <PageHeader
          title="Fila de verificação"
          subtitle="Restaurantes aguardando aprovação"
          extra={
            <Link to="/restaurants?status=PENDING" className="text-link">
              Ver todos
            </Link>
          }
        />
        <Table
          rowKey="id"
          loading={loading}
          dataSource={pending}
          pagination={false}
          locale={{ emptyText: 'Nenhuma solicitação pendente' }}
          columns={[
            {
              title: 'Restaurante',
              dataIndex: 'tradeName',
              render: (value: string, row: Restaurant) => (
                <div>
                  <Link to={`/restaurants/${row.id}`} className="table-link">
                    {value}
                  </Link>
                  <div className="table-sub">{row.email}</div>
                </div>
              ),
            },
            {
              title: 'Culinária',
              dataIndex: 'cuisineType',
              render: (value: Restaurant['cuisineType']) =>
                cuisineLabels[value],
            },
            {
              title: 'Cidade',
              render: (_: unknown, row: Restaurant) =>
                [row.city, row.state].filter(Boolean).join(' / ') || '—',
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (value: Restaurant['status']) => (
                <StatusTag status={value} />
              ),
            },
            {
              title: 'Criado em',
              dataIndex: 'createdAt',
              render: (value: string) => formatDate(value),
            },
          ]}
        />
      </div>
    </div>
  );
}
