import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { SiteFooter } from '../components/SiteFooter';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { login, isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && isAuthenticated && isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (!loading && isAuthenticated && !isAdmin) {
    return <Navigate to="/acesso-negado" replace />;
  }

  const onFinish = async (values: { email: string; password: string }) => {
    setSubmitting(true);
    setError(null);
    try {
      const user = await login(values.email, values.password);
      if (user.role !== 'ADMIN') {
        navigate('/acesso-negado');
        return;
      }
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Falha no login'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-backdrop" />
      <Card className="login-card" bordered={false}>
        <div className="login-brand">
          <div className="brand-mark large">SF</div>
          <Typography.Title level={2} className="login-title">
            SmartFood Admin
          </Typography.Title>
          <Typography.Paragraph type="secondary">
            Console operacional para verificação e gestão de restaurantes.
          </Typography.Paragraph>
        </div>

        {error ? (
          <Alert
            type="error"
            showIcon
            message={error}
            style={{ marginBottom: 20 }}
          />
        ) : null}

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="email"
            label="E-mail"
            rules={[
              { required: true, message: 'Informe o e-mail' },
              { type: 'email', message: 'E-mail inválido' },
            ]}
          >
            <Input
              size="large"
              prefix={<Mail size={16} />}
              placeholder="admin@smartfood.com"
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Senha"
            rules={[{ required: true, message: 'Informe a senha' }]}
          >
            <Input.Password
              size="large"
              prefix={<LockKeyhole size={16} />}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={submitting}
          >
            Entrar
          </Button>
        </Form>
      </Card>
      <SiteFooter tone="dark" className="login-site-footer" />
    </div>
  );
}
