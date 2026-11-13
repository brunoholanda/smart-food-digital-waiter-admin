import { Button, Input, Space, Table, Tabs, message } from 'antd';
import { Search, Eye } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as adminApi from '../api/admin';
import { getErrorMessage } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatusTag } from '../components/StatusTag';
import type { Restaurant, RestaurantStatus } from '../types';
import { cuisineLabels, formatDate, statusLabels } from '../utils/labels';

const ALL = 'ALL';

export function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const statusParam = searchParams.get('status');
  const activeTab =
    statusParam && statusParam in statusLabels ? statusParam : ALL;

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await adminApi.listRestaurants(
          activeTab === ALL ? undefined : (activeTab as RestaurantStatus),
        );
        setRestaurants(data);
      } catch (error) {
        message.error(getErrorMessage(error, 'Falha ao listar restaurantes'));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [activeTab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter((r) =>
      [r.tradeName, r.email, r.city, r.owner?.name, r.slug]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [restaurants, query]);

  return (
    <div>
      <PageHeader
        title="Restaurantes"
        subtitle="Filtre, revise e gerencie estabelecimentos"
      />

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          if (key === ALL) setSearchParams({});
          else setSearchParams({ status: key });
        }}
        items={[
          { key: ALL, label: 'Todos' },
          { key: 'PENDING', label: statusLabels.PENDING },
          { key: 'APPROVED', label: statusLabels.APPROVED },
          { key: 'REJECTED', label: statusLabels.REJECTED },
          { key: 'SUSPENDED', label: statusLabels.SUSPENDED },
        ]}
      />

      <div className="list-toolbar">
        <Input
          allowClear
          prefix={<Search size={16} />}
          placeholder="Buscar por nome, e-mail, cidade..."
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
        columns={[
          {
            title: 'Restaurante',
            dataIndex: 'tradeName',
            render: (value: string, row: Restaurant) => (
              <div>
                <Link to={`/restaurants/${row.id}`} className="table-link">
                  {value}
                </Link>
                <div className="table-sub">/{row.slug}</div>
              </div>
            ),
          },
          {
            title: 'Dono',
            render: (_: unknown, row: Restaurant) => (
              <div>
                <div>{row.owner?.name ?? '—'}</div>
                <div className="table-sub">{row.owner?.email}</div>
              </div>
            ),
          },
          {
            title: 'Culinária',
            dataIndex: 'cuisineType',
            render: (value: Restaurant['cuisineType']) => cuisineLabels[value],
          },
          {
            title: 'Local',
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
            title: 'Categorias',
            render: (_: unknown, row: Restaurant) =>
              row._count?.categories ?? '—',
          },
          {
            title: 'Criado em',
            dataIndex: 'createdAt',
            render: (value: string) => formatDate(value),
          },
          {
            title: '',
            key: 'actions',
            width: 100,
            render: (_: unknown, row: Restaurant) => (
              <Space>
                <Button
                  icon={<Eye size={16} />}
                  onClick={() => navigate(`/restaurants/${row.id}`)}
                >
                  Ver
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
}
