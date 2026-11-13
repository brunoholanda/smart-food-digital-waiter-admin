import {
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Spin,
  Table,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  PencilLine,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as adminApi from '../api/admin';
import { getErrorMessage } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { SettlementTag } from '../components/StatusTag';
import type { Payment, PaymentOrderItem } from '../types';
import {
  formatCurrency,
  formatDate,
  formatPercent,
  paymentMethodLabels,
} from '../utils/labels';

type ModalKind = 'verify' | 'rectify' | 'transfer' | 'dispute' | null;

export function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await adminApi.getPayment(id);
      setPayment(data);
    } catch (error) {
      message.error(getErrorMessage(error, 'Falha ao carregar pagamento'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const openModal = (kind: Exclude<ModalKind, null>) => {
    form.resetFields();
    if (kind === 'rectify' && payment) {
      form.setFieldsValue({
        payoutAmount: Number(payment.payoutAmount),
      });
    }
    setModal(kind);
  };

  const closeModal = () => {
    setModal(null);
    form.resetFields();
  };

  const submitAction = async (values: Record<string, unknown>) => {
    if (!id || !modal) return;
    setActing(true);
    try {
      let updated: Payment;
      if (modal === 'verify') {
        updated = await adminApi.verifyPayment(id, {
          adminNotes: values.adminNotes as string | undefined,
        });
        message.success('Pagamento verificado');
      } else if (modal === 'rectify') {
        updated = await adminApi.rectifyPayment(id, {
          payoutAmount: Number(values.payoutAmount),
          reason: String(values.reason),
          adminNotes: values.adminNotes as string | undefined,
        });
        message.success('Pagamento retificado');
      } else if (modal === 'transfer') {
        updated = await adminApi.transferPayment(id, {
          transferRef: String(values.transferRef),
          transferNotes: values.transferNotes as string | undefined,
        });
        message.success('Repasse registrado');
      } else {
        updated = await adminApi.disputePayment(id, {
          reason: String(values.reason),
        });
        message.success('Disputa aberta');
      }
      setPayment(updated);
      closeModal();
      await load();
    } catch (error) {
      message.error(getErrorMessage(error, 'Falha ao executar ação'));
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="full-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!payment) {
    return <Empty description="Pagamento não encontrado" />;
  }

  const canVerify =
    payment.status === 'PENDING_REVIEW' || payment.status === 'DISPUTED';
  const canRectify = [
    'PENDING_REVIEW',
    'VERIFIED',
    'RECTIFIED',
    'DISPUTED',
  ].includes(payment.status);
  const canTransfer =
    payment.status === 'VERIFIED' || payment.status === 'RECTIFIED';
  const canDispute = payment.status !== 'TRANSFERRED';

  const modalTitle: Record<Exclude<ModalKind, null>, string> = {
    verify: 'Verificar pagamento',
    rectify: 'Retificar valor de repasse',
    transfer: 'Registrar repasse',
    dispute: 'Abrir disputa',
  };

  return (
    <div>
      <PageHeader
        title={`Pagamento · ${payment.order?.code ?? payment.id.slice(0, 8)}`}
        subtitle="Detalhe da liquidação e ações administrativas"
        extra={
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate('/finance')}
          >
            Voltar
          </Button>
        }
      />

      <Space wrap style={{ marginBottom: 16 }}>
        <SettlementTag status={payment.status} />
        {canVerify ? (
          <Button
            type="primary"
            icon={<BadgeCheck size={16} />}
            onClick={() => openModal('verify')}
          >
            Verificar
          </Button>
        ) : null}
        {canRectify ? (
          <Button
            icon={<PencilLine size={16} />}
            onClick={() => openModal('rectify')}
          >
            Retificar
          </Button>
        ) : null}
        {canTransfer ? (
          <Button
            type="primary"
            icon={<Send size={16} />}
            onClick={() => openModal('transfer')}
          >
            Repassar
          </Button>
        ) : null}
        {canDispute ? (
          <Button
            danger
            icon={<ShieldAlert size={16} />}
            onClick={() => openModal('dispute')}
          >
            Abrir disputa
          </Button>
        ) : null}
      </Space>

      <Row gutter={[16, 16]} className="detail-summary">
        <Col xs={24} lg={14}>
          <Card title="Resumo financeiro" bordered={false}>
            <Descriptions column={{ xs: 1, sm: 2 }} size="small">
              <Descriptions.Item label="Status">
                <SettlementTag status={payment.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Método">
                {paymentMethodLabels[payment.paymentMethod]}
              </Descriptions.Item>
              <Descriptions.Item label="Referência">
                {payment.paymentRef || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Criado em">
                {formatDate(payment.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Bruto">
                {formatCurrency(payment.grossAmount)}
              </Descriptions.Item>
              <Descriptions.Item label="Taxa plataforma">
                {formatCurrency(payment.platformFeeAmount)} (
                {formatPercent(payment.platformFeePercent)})
              </Descriptions.Item>
              <Descriptions.Item label="Líquido">
                {formatCurrency(payment.netAmount)}
              </Descriptions.Item>
              <Descriptions.Item label="Líquido ajustado">
                {payment.adjustedNetAmount != null
                  ? formatCurrency(payment.adjustedNetAmount)
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Valor de repasse">
                <Typography.Text strong>
                  {formatCurrency(payment.payoutAmount)}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Delta retificação">
                {payment.rectificationDelta != null
                  ? formatCurrency(payment.rectificationDelta)
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Verificado em">
                {formatDate(payment.verifiedAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Retificado em">
                {formatDate(payment.rectifiedAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Transferido em">
                {formatDate(payment.transferredAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Ref. transferência">
                {payment.transferRef || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Notas admin" span={2}>
                {payment.adminNotes || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Nota de retificação" span={2}>
                {payment.rectificationNote || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Motivo disputa" span={2}>
                {payment.disputeReason || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Notas do repasse" span={2}>
                {payment.transferNotes || '—'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Dados bancários / PIX" bordered={false}>
            <div className="pix-highlight">
              <div className="pix-highlight-label">
                <Banknote size={16} /> Chave PIX
              </div>
              <div className="pix-highlight-value">
                {payment.restaurant?.bankPixKey || 'Não cadastrada'}
              </div>
            </div>
            <Descriptions column={1} size="small" style={{ marginTop: 16 }}>
              <Descriptions.Item label="Restaurante">
                {payment.restaurant ? (
                  <Link
                    to={`/restaurants/${payment.restaurant.id}`}
                    className="table-link"
                  >
                    {payment.restaurant.tradeName}
                  </Link>
                ) : (
                  '—'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Documento">
                {payment.restaurant?.document || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Titular">
                {payment.restaurant?.bankAccountName || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Doc. titular">
                {payment.restaurant?.bankAccountDoc || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Taxa configurada">
                {formatPercent(payment.restaurant?.platformFeePercent)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Card title="Pedido" bordered={false} className="detail-tabs-card">
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label="Código">
            {payment.order?.code ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Mesa">
            {payment.order?.tableNumber ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Cliente">
            {payment.order?.customerName || '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Telefone">
            {payment.order?.customerPhone || '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Pago em">
            {formatDate(payment.order?.paidAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Total">
            {formatCurrency(payment.order?.total)}
          </Descriptions.Item>
          <Descriptions.Item label="Observações" span={3}>
            {payment.order?.notes || '—'}
          </Descriptions.Item>
        </Descriptions>

        <Table
          style={{ marginTop: 16 }}
          rowKey="id"
          pagination={false}
          dataSource={payment.order?.items ?? []}
          locale={{ emptyText: 'Sem itens no pedido' }}
          columns={[
            {
              title: 'Item',
              render: (_: unknown, row: PaymentOrderItem) => (
                <div>
                  <div className="item-name">{row.name}</div>
                  <div className="item-meta">
                    {[row.variationName, row.notes].filter(Boolean).join(' · ') ||
                      '—'}
                  </div>
                </div>
              ),
            },
            {
              title: 'Qtd',
              dataIndex: 'quantity',
              width: 80,
            },
            {
              title: 'Unit.',
              dataIndex: 'unitPrice',
              align: 'right' as const,
              render: (value: string | number) => formatCurrency(value),
            },
            {
              title: 'Total',
              dataIndex: 'lineTotal',
              align: 'right' as const,
              render: (value: string | number) => formatCurrency(value),
            },
          ]}
        />
      </Card>

      <Modal
        title={modal ? modalTitle[modal] : ''}
        open={modal !== null}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={acting}
        okText="Confirmar"
        cancelText="Cancelar"
        destroyOnHidden
        width={modal === 'transfer' ? 560 : 480}
      >
        {modal === 'transfer' ? (
          <div className="pix-highlight" style={{ marginBottom: 16 }}>
            <div className="pix-highlight-label">
              <Banknote size={16} /> Transferir para PIX
            </div>
            <div className="pix-highlight-value">
              {payment.restaurant?.bankPixKey || 'Chave PIX não cadastrada'}
            </div>
            <div className="table-sub" style={{ marginTop: 8 }}>
              Valor: <strong>{formatCurrency(payment.payoutAmount)}</strong>
              {payment.restaurant?.bankAccountName
                ? ` · ${payment.restaurant.bankAccountName}`
                : ''}
            </div>
          </div>
        ) : null}

        <Form form={form} layout="vertical" onFinish={submitAction}>
          {modal === 'verify' ? (
            <Form.Item name="adminNotes" label="Notas (opcional)">
              <Input.TextArea
                rows={3}
                placeholder="Observações internas"
                maxLength={500}
                showCount
              />
            </Form.Item>
          ) : null}

          {modal === 'rectify' ? (
            <>
              <Form.Item
                name="payoutAmount"
                label="Novo valor de repasse"
                rules={[
                  { required: true, message: 'Informe o valor' },
                  {
                    type: 'number',
                    min: 0,
                    message: 'Valor inválido',
                  },
                ]}
              >
                <InputNumber
                  className="full-width"
                  min={0}
                  step={0.01}
                  precision={2}
                  prefix="R$"
                  decimalSeparator=","
                />
              </Form.Item>
              <Form.Item
                name="reason"
                label="Motivo"
                rules={[
                  { required: true, message: 'Informe o motivo' },
                  { min: 3, message: 'Mínimo de 3 caracteres' },
                ]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Por que o valor foi ajustado?"
                  maxLength={500}
                  showCount
                />
              </Form.Item>
              <Form.Item name="adminNotes" label="Notas (opcional)">
                <Input.TextArea rows={2} maxLength={500} showCount />
              </Form.Item>
            </>
          ) : null}

          {modal === 'transfer' ? (
            <>
              <Form.Item
                name="transferRef"
                label="Referência da transferência"
                rules={[
                  { required: true, message: 'Informe a referência' },
                  { min: 3, message: 'Mínimo de 3 caracteres' },
                ]}
              >
                <Input placeholder="ID / comprovante do PIX" />
              </Form.Item>
              <Form.Item name="transferNotes" label="Notas (opcional)">
                <Input.TextArea
                  rows={3}
                  placeholder="Observações do repasse"
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </>
          ) : null}

          {modal === 'dispute' ? (
            <Form.Item
              name="reason"
              label="Motivo da disputa"
              rules={[
                { required: true, message: 'Informe o motivo' },
                { min: 3, message: 'Mínimo de 3 caracteres' },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Descreva o problema encontrado"
                maxLength={500}
                showCount
              />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </div>
  );
}
