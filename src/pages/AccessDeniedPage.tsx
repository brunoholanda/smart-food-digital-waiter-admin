import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SiteFooter } from '../components/SiteFooter';
import { useAuth } from '../hooks/useAuth';

export function AccessDeniedPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="full-center access-denied">
      <Result
        status="403"
        title="Acesso negado"
        subTitle={
          user
            ? `A conta ${user.email} não possui perfil de administrador.`
            : 'Você não tem permissão para acessar o console admin.'
        }
        extra={
          <Button
            type="primary"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Voltar ao login
          </Button>
        }
      />
      <SiteFooter />
    </div>
  );
}
