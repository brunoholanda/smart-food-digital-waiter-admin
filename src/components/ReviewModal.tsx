import { Form, Input, Modal, Radio, Space } from 'antd';
import { useEffect } from 'react';
import type { RestaurantStatus } from '../types';

export type ReviewAction = Extract<
  RestaurantStatus,
  'APPROVED' | 'REJECTED' | 'SUSPENDED'
>;

interface ReviewModalProps {
  open: boolean;
  loading?: boolean;
  defaultStatus?: ReviewAction;
  onCancel: () => void;
  onSubmit: (values: {
    status: ReviewAction;
    rejectionReason?: string;
  }) => Promise<void> | void;
}

export function ReviewModal({
  open,
  loading,
  defaultStatus = 'APPROVED',
  onCancel,
  onSubmit,
}: ReviewModalProps) {
  const [form] = Form.useForm<{
    status: ReviewAction;
    rejectionReason?: string;
  }>();

  const status = Form.useWatch('status', form);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        status: defaultStatus,
        rejectionReason: undefined,
      });
    }
  }, [open, defaultStatus, form]);

  return (
    <Modal
      title="Revisar restaurante"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Confirmar"
      cancelText="Cancelar"
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{ status: defaultStatus }}
      >
        <Form.Item
          name="status"
          label="Decisão"
          rules={[{ required: true, message: 'Selecione uma decisão' }]}
        >
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="APPROVED">Aprovar</Radio>
              <Radio value="REJECTED">Rejeitar</Radio>
              <Radio value="SUSPENDED">Suspender</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        {status === 'REJECTED' || status === 'SUSPENDED' ? (
          <Form.Item
            name="rejectionReason"
            label="Motivo"
            rules={[
              {
                required: status === 'REJECTED',
                message: 'Informe o motivo da rejeição',
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Descreva o motivo para o restaurante"
              maxLength={500}
              showCount
            />
          </Form.Item>
        ) : null}
      </Form>
    </Modal>
  );
}
