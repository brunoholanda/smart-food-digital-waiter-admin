import { Layout, Menu, Dropdown, Avatar, Typography, Button, theme } from 'antd';
import {
  LayoutDashboard,
  Store,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SiteFooter } from '../components/SiteFooter';
import { useAuth } from '../hooks/useAuth';
import { brandColors } from '../theme';

const { Header, Sider, Content } = Layout;

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { token } = theme.useToken();

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith('/finance')) return 'finance';
    if (location.pathname.startsWith('/restaurants')) return 'restaurants';
    return 'dashboard';
  }, [location.pathname]);

  return (
    <Layout className="admin-shell">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={248}
        trigger={null}
        className="admin-sider"
      >
        <div className={`brand-block ${collapsed ? 'collapsed' : ''}`}>
          <div className="brand-mark">
            <ShieldCheck size={20} />
          </div>
          {!collapsed ? (
            <div>
              <div className="brand-name">SmartFood</div>
              <div className="brand-sub">Admin</div>
            </div>
          ) : null}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={[
            {
              key: 'dashboard',
              icon: <LayoutDashboard size={18} />,
              label: 'Dashboard',
              onClick: () => navigate('/'),
            },
            {
              key: 'restaurants',
              icon: <Store size={18} />,
              label: 'Restaurantes',
              onClick: () => navigate('/restaurants'),
            },
            {
              key: 'finance',
              icon: <Wallet size={18} />,
              label: 'Financeiro',
              onClick: () => navigate('/finance'),
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header className="admin-header" style={{ background: token.colorBgContainer }}>
          <Button
            type="text"
            className="collapse-btn"
            icon={
              collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />
            }
            onClick={() => setCollapsed((v) => !v)}
          />

          <div className="header-right">
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'logout',
                    icon: <LogOut size={16} />,
                    label: 'Sair',
                    onClick: () => {
                      logout();
                      navigate('/login');
                    },
                  },
                ],
              }}
            >
              <button type="button" className="user-chip">
                <Avatar
                  size={36}
                  style={{
                    background: brandColors.emerald600,
                    fontWeight: 600,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() ?? 'A'}
                </Avatar>
                <div className="user-meta">
                  <Typography.Text strong>{user?.name}</Typography.Text>
                  <Typography.Text type="secondary" className="user-role">
                    Administrador
                  </Typography.Text>
                </div>
              </button>
            </Dropdown>
          </div>
        </Header>

        <Content className="admin-content">
          <Outlet />
        </Content>
        <SiteFooter />
      </Layout>
    </Layout>
  );
}
