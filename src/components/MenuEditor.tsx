import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Upload,
  message,
} from 'antd';
import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import * as menuApi from '../api/menu';
import { getErrorMessage, mediaUrl } from '../api/client';
import type {
  CreateItemPayload,
  MenuCategory,
  MenuItem,
  UpdateItemPayload,
} from '../types';
import { formatCurrency } from '../utils/labels';

interface MenuEditorProps {
  restaurantId: string;
  categories: MenuCategory[];
  onChanged: () => Promise<void> | void;
}

export function MenuEditor({
  restaurantId,
  categories,
  onChanged,
}: MenuEditorProps) {
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(
    null,
  );
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [categoryForm] = Form.useForm();
  const [itemForm] = Form.useForm();

  const activeCategoryId = selectedCategoryId ?? categories[0]?.id;
  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeCategoryId),
    [categories, activeCategoryId],
  );

  const openCreateCategory = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    categoryForm.setFieldsValue({ sortOrder: categories.length, isActive: true });
    setCategoryModalOpen(true);
  };

  const openEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    categoryForm.setFieldsValue({
      name: category.name,
      description: category.description ?? undefined,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setCategoryModalOpen(true);
  };

  const saveCategory = async (values: {
    name: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) => {
    setSaving(true);
    try {
      if (editingCategory) {
        await menuApi.updateCategory(editingCategory.id, values);
        message.success('Categoria atualizada');
      } else {
        await menuApi.createCategory(restaurantId, values);
        message.success('Categoria criada');
      }
      setCategoryModalOpen(false);
      await onChanged();
    } catch (error) {
      message.error(getErrorMessage(error, 'Falha ao salvar categoria'));
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (id: string) => {
    try {
      await menuApi.deleteCategory(id);
      message.success('Categoria removida');
      if (selectedCategoryId === id) setSelectedCategoryId(undefined);
      await onChanged();
    } catch (error) {
      message.error(getErrorMessage(error, 'Falha ao remover categoria'));
    }
  };

  const openCreateItem = () => {
    if (!activeCategory) {
      message.warning('Crie uma categoria primeiro');
      return;
    }
    setEditingItem(null);
    itemForm.resetFields();
    itemForm.setFieldsValue({
      categoryId: activeCategory.id,
      basePrice: 0,
      priceType: 'FIXED',
      isAvailable: true,
      isFeatured: false,
      sortOrder: activeCategory.items.length,
    });
    setItemModalOpen(true);
  };

  const openEditItem = (item: MenuItem) => {
    setEditingItem(item);
    itemForm.setFieldsValue({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description ?? undefined,
      basePrice: Number(item.basePrice),
      priceType: item.priceType,
      promotionalPrice: item.promotionalPrice
        ? Number(item.promotionalPrice)
        : undefined,
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
      sortOrder: item.sortOrder,
      prepTimeMin: item.prepTimeMin ?? undefined,
      spicyLevel: item.spicyLevel,
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isGlutenFree: item.isGlutenFree,
    });
    setItemModalOpen(true);
  };

  const saveItem = async (values: CreateItemPayload | UpdateItemPayload) => {
    setSaving(true);
    try {
      if (editingItem) {
        await menuApi.updateItem(editingItem.id, values);
        message.success('Item atualizado');
      } else {
        await menuApi.createItem(values as CreateItemPayload);
        message.success('Item criado');
      }
      setItemModalOpen(false);
      await onChanged();
    } catch (error) {
      message.error(getErrorMessage(error, 'Falha ao salvar item'));
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (id: string) => {
    try {
      await menuApi.deleteItem(id);
      message.success('Item removido');
      await onChanged();
    } catch (error) {
      message.error(getErrorMessage(error, 'Falha ao remover item'));
    }
  };

  const uploadImage = async (
    kind: 'category' | 'item',
    id: string,
    file: File,
  ) => {
    try {
      if (kind === 'category') await menuApi.uploadCategoryImage(id, file);
      else await menuApi.uploadItemImage(id, file);
      message.success('Imagem enviada');
      await onChanged();
    } catch (error) {
      message.error(getErrorMessage(error, 'Falha no upload'));
    }
    return false;
  };

  return (
    <div className="menu-editor">
      <div className="menu-toolbar">
        <Space wrap>
          <Select
            style={{ minWidth: 220 }}
            placeholder="Categoria"
            value={activeCategoryId}
            onChange={setSelectedCategoryId}
            options={categories.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.items.length})`,
            }))}
          />
          <Button icon={<Plus size={16} />} onClick={openCreateCategory}>
            Categoria
          </Button>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={openCreateItem}
          >
            Item
          </Button>
        </Space>
      </div>

      {!activeCategory ? (
        <Empty description="Nenhuma categoria cadastrada" />
      ) : (
        <Card
          className="menu-category-card"
          title={
            <div className="menu-category-title">
              <span>{activeCategory.name}</span>
              {!activeCategory.isActive ? (
                <span className="muted-pill">Inativa</span>
              ) : null}
            </div>
          }
          extra={
            <Space>
              <Upload
                showUploadList={false}
                beforeUpload={(file) =>
                  uploadImage('category', activeCategory.id, file)
                }
                accept="image/*"
              >
                <Button icon={<ImagePlus size={16} />}>Imagem</Button>
              </Upload>
              <Button
                icon={<Pencil size={16} />}
                onClick={() => openEditCategory(activeCategory)}
              >
                Editar
              </Button>
              <Popconfirm
                title="Remover categoria e seus itens?"
                okText="Remover"
                cancelText="Cancelar"
                onConfirm={() => removeCategory(activeCategory.id)}
              >
                <Button danger icon={<Trash2 size={16} />} />
              </Popconfirm>
            </Space>
          }
        >
          {activeCategory.description ? (
            <p className="menu-category-desc">{activeCategory.description}</p>
          ) : null}

          {activeCategory.imageUrl ? (
            <img
              src={mediaUrl(activeCategory.imageUrl)}
              alt={activeCategory.name}
              className="menu-category-image"
            />
          ) : null}

          <Table
            rowKey="id"
            dataSource={activeCategory.items}
            pagination={false}
            locale={{ emptyText: 'Nenhum item nesta categoria' }}
            columns={[
              {
                title: 'Item',
                dataIndex: 'name',
                render: (_: unknown, item: MenuItem) => (
                  <div className="item-cell">
                    {item.imageUrl ? (
                      <img
                        src={mediaUrl(item.imageUrl)}
                        alt={item.name}
                        className="item-thumb"
                      />
                    ) : (
                      <div className="item-thumb placeholder" />
                    )}
                    <div>
                      <div className="item-name">{item.name}</div>
                      <div className="item-meta">
                        {item.isFeatured ? 'Destaque · ' : ''}
                        {item.isAvailable ? 'Disponível' : 'Indisponível'}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                title: 'Preço',
                dataIndex: 'basePrice',
                width: 120,
                render: (value: string | number) => formatCurrency(value),
              },
              {
                title: 'Ordem',
                dataIndex: 'sortOrder',
                width: 80,
              },
              {
                title: 'Ações',
                key: 'actions',
                width: 180,
                render: (_: unknown, item: MenuItem) => (
                  <Space>
                    <Upload
                      showUploadList={false}
                      beforeUpload={(file) =>
                        uploadImage('item', item.id, file)
                      }
                      accept="image/*"
                    >
                      <Button size="small" icon={<ImagePlus size={14} />} />
                    </Upload>
                    <Button
                      size="small"
                      icon={<Pencil size={14} />}
                      onClick={() => openEditItem(item)}
                    />
                    <Popconfirm
                      title="Remover item?"
                      okText="Remover"
                      cancelText="Cancelar"
                      onConfirm={() => removeItem(item.id)}
                    >
                      <Button size="small" danger icon={<Trash2 size={14} />} />
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      )}

      <Modal
        title={editingCategory ? 'Editar categoria' : 'Nova categoria'}
        open={categoryModalOpen}
        onCancel={() => setCategoryModalOpen(false)}
        onOk={() => categoryForm.submit()}
        confirmLoading={saving}
        okText="Salvar"
        cancelText="Cancelar"
        destroyOnHidden
      >
        <Form form={categoryForm} layout="vertical" onFinish={saveCategory}>
          <Form.Item
            name="name"
            label="Nome"
            rules={[{ required: true, message: 'Informe o nome' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="sortOrder" label="Ordem">
            <InputNumber className="full-width" min={0} />
          </Form.Item>
          {editingCategory ? (
            <Form.Item name="isActive" label="Ativa" valuePropName="checked">
              <Switch />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>

      <Modal
        title={editingItem ? 'Editar item' : 'Novo item'}
        open={itemModalOpen}
        onCancel={() => setItemModalOpen(false)}
        onOk={() => itemForm.submit()}
        confirmLoading={saving}
        okText="Salvar"
        cancelText="Cancelar"
        width={640}
        destroyOnHidden
      >
        <Form form={itemForm} layout="vertical" onFinish={saveItem}>
          <Form.Item
            name="categoryId"
            label="Categoria"
            rules={[{ required: true }]}
          >
            <Select
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="Nome"
            rules={[{ required: true, message: 'Informe o nome' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Space size="middle" className="full-width" style={{ display: 'flex' }}>
            <Form.Item
              name="basePrice"
              label="Preço base"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <InputNumber className="full-width" min={0} step={0.01} />
            </Form.Item>
            <Form.Item name="priceType" label="Tipo de preço" style={{ flex: 1 }}>
              <Select
                options={[
                  { value: 'FIXED', label: 'Fixo' },
                  { value: 'FROM', label: 'A partir de' },
                  { value: 'VARIABLE', label: 'Variável' },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="promotionalPrice"
              label="Preço promo"
              style={{ flex: 1 }}
            >
              <InputNumber className="full-width" min={0} step={0.01} />
            </Form.Item>
          </Space>
          <Space size="middle" wrap>
            <Form.Item name="sortOrder" label="Ordem">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="prepTimeMin" label="Preparo (min)">
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="spicyLevel" label="Picância">
              <InputNumber min={0} max={5} />
            </Form.Item>
          </Space>
          <Space size="large" wrap>
            <Form.Item
              name="isAvailable"
              label="Disponível"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="isFeatured"
              label="Destaque"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="isVegetarian"
              label="Vegetariano"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item name="isVegan" label="Vegano" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item
              name="isGlutenFree"
              label="Sem glúten"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
