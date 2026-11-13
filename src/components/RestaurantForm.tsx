import { Button, Col, Form, Input, InputNumber, Row, Select, Switch } from 'antd';
import { useEffect } from 'react';
import type { Restaurant, UpdateRestaurantPayload } from '../types';
import { cuisineLabels } from '../utils/labels';

interface RestaurantFormProps {
  restaurant: Restaurant;
  loading?: boolean;
  onSubmit: (values: UpdateRestaurantPayload) => Promise<void> | void;
}

export function RestaurantForm({
  restaurant,
  loading,
  onSubmit,
}: RestaurantFormProps) {
  const [form] = Form.useForm<UpdateRestaurantPayload>();

  useEffect(() => {
    form.setFieldsValue({
      tradeName: restaurant.tradeName,
      legalName: restaurant.legalName ?? undefined,
      document: restaurant.document ?? undefined,
      phone: restaurant.phone,
      whatsapp: restaurant.whatsapp ?? undefined,
      description: restaurant.description ?? undefined,
      cuisineType: restaurant.cuisineType,
      street: restaurant.street ?? undefined,
      number: restaurant.number ?? undefined,
      complement: restaurant.complement ?? undefined,
      neighborhood: restaurant.neighborhood ?? undefined,
      city: restaurant.city ?? undefined,
      state: restaurant.state ?? undefined,
      zipCode: restaurant.zipCode ?? undefined,
      instagram: restaurant.instagram ?? undefined,
      website: restaurant.website ?? undefined,
      coverColor: restaurant.coverColor ?? undefined,
      estimatedTime: restaurant.estimatedTime ?? undefined,
      minOrderValue: restaurant.minOrderValue
        ? Number(restaurant.minOrderValue)
        : undefined,
      deliveryFee: restaurant.deliveryFee
        ? Number(restaurant.deliveryFee)
        : undefined,
      acceptsDelivery: restaurant.acceptsDelivery,
      acceptsPickup: restaurant.acceptsPickup,
      acceptsDineIn: restaurant.acceptsDineIn,
      isPublished: restaurant.isPublished,
    });
  }, [restaurant, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      className="restaurant-form"
    >
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="tradeName"
            label="Nome fantasia"
            rules={[{ required: true, message: 'Informe o nome fantasia' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="legalName" label="Razão social">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="document" label="CNPJ / Documento">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="phone" label="Telefone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="whatsapp" label="WhatsApp">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="cuisineType" label="Tipo de cozinha">
            <Select
              options={Object.entries(cuisineLabels).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="estimatedTime" label="Tempo estimado">
            <Input placeholder="Ex: 30-45 min" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Col>
      </Row>

      <div className="form-section-title">Endereço</div>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="street" label="Rua">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={12} md={4}>
          <Form.Item name="number" label="Número">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={12} md={8}>
          <Form.Item name="complement" label="Complemento">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="neighborhood" label="Bairro">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="city" label="Cidade">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={12} md={4}>
          <Form.Item name="state" label="UF">
            <Input maxLength={2} />
          </Form.Item>
        </Col>
        <Col xs={12} md={4}>
          <Form.Item name="zipCode" label="CEP">
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <div className="form-section-title">Operação</div>
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item name="minOrderValue" label="Pedido mínimo (R$)">
            <InputNumber className="full-width" min={0} step={0.01} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="deliveryFee" label="Taxa de entrega (R$)">
            <InputNumber className="full-width" min={0} step={0.01} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="coverColor" label="Cor de capa">
            <Input type="color" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="instagram" label="Instagram">
            <Input placeholder="@usuario" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="website" label="Website">
            <Input placeholder="https://" />
          </Form.Item>
        </Col>
        <Col xs={12} md={6}>
          <Form.Item
            name="acceptsDelivery"
            label="Delivery"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={12} md={6}>
          <Form.Item
            name="acceptsPickup"
            label="Retirada"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={12} md={6}>
          <Form.Item
            name="acceptsDineIn"
            label="No local"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={12} md={6}>
          <Form.Item
            name="isPublished"
            label="Publicado"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>

      <Button type="primary" htmlType="submit" loading={loading}>
        Salvar alterações
      </Button>
    </Form>
  );
}
