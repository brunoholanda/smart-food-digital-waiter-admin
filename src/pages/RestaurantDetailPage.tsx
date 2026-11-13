import {
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Row,
  Space,
  Spin,
  Tabs,
  Tag,
  message,
} from 'antd';
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  CircleX,
  ShieldAlert,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as adminApi from '../api/admin';
import { getErrorMessage, mediaUrl } from '../api/client';
import { MenuEditor } from '../components/MenuEditor';
import { PageHeader } from '../components/PageHeader';
import { RestaurantForm } from '../components/RestaurantForm';
import { ReviewModal, type ReviewAction } from '../components/ReviewModal';
import { StatusTag } from '../components/StatusTag';
import type { Restaurant, UpdateRestaurantPayload } from '../types';
import {
  cuisineLabels,
  dayLabels,
  formatCurrency,
  formatDate,
} from '../utils/labels';

export function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewDefault, setReviewDefault] = useState<ReviewAction>('APPROVED');
  const [reviewing, setReviewing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await adminApi.getRestaurant(id);
      setRestaurant(data);
    } catch (error) {
      message.error(getErrorMessage(error, 'Falha ao carregar restaurante'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const openReview = (status: ReviewAction) => {
    setReviewDefault(status);
    setReviewOpen(true);
  };

  const submitReview = async (values: {
    status: ReviewAction;
    rejectionReason?: string;
  }) => {
    if (!id) return;
    setReviewing(true);
    try {
      await adminApi.reviewRestaurant(id, values);
      message.success('Revisão registrada');
      setReviewOpen(false);
      await load();
    } catch (error) {
      message.error(getErrorMessage(error, 'Falha na revisão'));
    } finally {
      setReviewing(false);
    }
  };

  const saveRestaurant = async (values: UpdateRestaurantPayload) => {
    if (!id) return;
    setSaving(true);
    try {
      const updated = await adminApi.updateRestaurant(id, values);
      setRestaurant((prev) =>
        prev
          ? {
              ...prev,
              ...updated,
              categories: prev.categories,
              openingHours: updated.openingHours ?? prev.openingHours,
            }
          : updated,
      );
      message.success('Dados atualizados');
    } catch (error) {
      message.error(getErrorMessage(error, 'Falha ao salvar'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="full-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!restaurant) {
    return <Empty description="Restaurante não encontrado" />;
  }

  return (
    <div>
      <PageHeader
        title={restaurant.tradeName}
        subtitle={`/${restaurant.slug}`}
        extra={
          <Space wrap>
            <Button
              icon={<ArrowLeft size={16} />}
              onClick={() => navigate('/restaurants')}
            >
              Voltar
            </Button>
            <Button
              type="primary"
              icon={<BadgeCheck size={16} />}
              onClick={() => openReview('APPROVED')}
            >
              Aprovar
            </Button>
            <Button
              danger
              icon={<CircleX size={16} />}
              onClick={() => openReview('REJECTED')}
            >
              Rejeitar
            </Button>
            <Button
              icon={<Ban size={16} />}
              onClick={() => openReview('SUSPENDED')}
            >
              Suspender
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]} className="detail-summary">
        <Col xs={24} lg={16}>
          <Card bordered={false} className="summary-card">
            <div className="summary-hero">
              {restaurant.bannerUrl ? (
                <img
                  src={mediaUrl(restaurant.bannerUrl)}
                  alt="Banner"
                  className="summary-banner"
                />
              ) : (
                <div
                  className="summary-banner placeholder"
                  style={{
                    background: restaurant.coverColor || '#1e293b',
                  }}
                />
              )}
              <div className="summary-identity">
                {restaurant.logoUrl ? (
                  <img
                    src={mediaUrl(restaurant.logoUrl)}
                    alt="Logo"
                    className="summary-logo"
                  />
                ) : (
                  <div className="summary-logo placeholder">
                    {restaurant.tradeName.charAt(0)}
                  </div>
                )}
                <div>
                  <Space wrap>
                    <StatusTag status={restaurant.status} />
                    {restaurant.isPublished ? (
                      <Tag color="green">Publicado</Tag>
                    ) : (
                      <Tag>Não publicado</Tag>
                    )}
                  </Space>
                  <div className="summary-cuisine">
                    {cuisineLabels[restaurant.cuisineType]}
                  </div>
                </div>
              </div>
            </div>

            {restaurant.rejectionReason ? (
              <div className="rejection-box">
                <ShieldAlert size={18} />
                <div>
                  <strong>Motivo registrado</strong>
                  <p>{restaurant.rejectionReason}</p>
                </div>
              </div>
            ) : null}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card bordered={false} title="Resumo">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="E-mail">
                {restaurant.email}
              </Descriptions.Item>
              <Descriptions.Item label="Telefone">
                {restaurant.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Dono">
                {restaurant.owner?.name ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Pedido mín.">
                {formatCurrency(restaurant.minOrderValue)}
              </Descriptions.Item>
              <Descriptions.Item label="Criado em">
                {formatDate(restaurant.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Revisado em">
                {formatDate(restaurant.reviewedAt)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="detail-tabs-card">
        <Tabs
          items={[
            {
              key: 'overview',
              label: 'Visão geral',
              children: (
                <div>
                  <Descriptions
                    bordered
                    size="small"
                    column={{ xs: 1, md: 2 }}
                    title="Dados do estabelecimento"
                  >
                    <Descriptions.Item label="Razão social">
                      {restaurant.legalName || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Documento">
                      {restaurant.document || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="WhatsApp">
                      {restaurant.whatsapp || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tempo estimado">
                      {restaurant.estimatedTime || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Endereço" span={2}>
                      {[
                        restaurant.street,
                        restaurant.number,
                        restaurant.complement,
                        restaurant.neighborhood,
                        restaurant.city,
                        restaurant.state,
                        restaurant.zipCode,
                      ]
                        .filter(Boolean)
                        .join(', ') || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Descrição" span={2}>
                      {restaurant.description || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Delivery">
                      {restaurant.acceptsDelivery ? 'Sim' : 'Não'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Retirada">
                      {restaurant.acceptsPickup ? 'Sim' : 'Não'}
                    </Descriptions.Item>
                    <Descriptions.Item label="No local">
                      {restaurant.acceptsDineIn ? 'Sim' : 'Não'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Taxa entrega">
                      {formatCurrency(restaurant.deliveryFee)}
                    </Descriptions.Item>
                  </Descriptions>

                  <div className="form-section-title" style={{ marginTop: 24 }}>
                    Horários
                  </div>
                  {restaurant.openingHours?.length ? (
                    <Descriptions bordered size="small" column={1}>
                      {restaurant.openingHours.map((hour) => (
                        <Descriptions.Item
                          key={hour.id}
                          label={dayLabels[hour.dayOfWeek]}
                        >
                          {hour.isClosed
                            ? 'Fechado'
                            : `${hour.opensAt} – ${hour.closesAt}`}
                        </Descriptions.Item>
                      ))}
                    </Descriptions>
                  ) : (
                    <Empty description="Sem horários cadastrados" />
                  )}
                </div>
              ),
            },
            {
              key: 'edit',
              label: 'Editar dados',
              children: (
                <RestaurantForm
                  restaurant={restaurant}
                  loading={saving}
                  onSubmit={saveRestaurant}
                />
              ),
            },
            {
              key: 'menu',
              label: `Cardápio (${restaurant.categories?.length ?? 0})`,
              children: (
                <MenuEditor
                  restaurantId={restaurant.id}
                  categories={restaurant.categories ?? []}
                  onChanged={load}
                />
              ),
            },
          ]}
        />
      </Card>

      <ReviewModal
        open={reviewOpen}
        loading={reviewing}
        defaultStatus={reviewDefault}
        onCancel={() => setReviewOpen(false)}
        onSubmit={submitReview}
      />
    </div>
  );
}
