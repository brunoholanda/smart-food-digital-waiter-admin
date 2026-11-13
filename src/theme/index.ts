import type { ThemeConfig } from 'antd';

export const brandColors = {
  slate950: '#020617',
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate700: '#334155',
  slate500: '#64748b',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  slate50: '#f8fafc',
  emerald600: '#059669',
  emerald500: '#10b981',
  emerald50: '#ecfdf5',
  white: '#ffffff',
  danger: '#dc2626',
  warning: '#d97706',
} as const;

export const adminTheme: ThemeConfig = {
  token: {
    colorPrimary: brandColors.emerald600,
    colorInfo: brandColors.emerald600,
    colorSuccess: brandColors.emerald500,
    colorWarning: brandColors.warning,
    colorError: brandColors.danger,
    colorTextBase: brandColors.slate900,
    colorBgBase: brandColors.slate50,
    colorBorder: brandColors.slate200,
    borderRadius: 10,
    fontFamily: '"Source Sans 3", "Segoe UI", sans-serif',
    fontSize: 14,
    controlHeight: 40,
  },
  components: {
    Layout: {
      siderBg: brandColors.slate900,
      headerBg: brandColors.white,
      bodyBg: brandColors.slate50,
      triggerBg: brandColors.slate800,
    },
    Menu: {
      darkItemBg: brandColors.slate900,
      darkSubMenuItemBg: brandColors.slate900,
      darkItemSelectedBg: brandColors.slate800,
      darkItemHoverBg: brandColors.slate800,
      darkItemColor: 'rgba(248,250,252,0.78)',
      darkItemSelectedColor: brandColors.white,
      itemBorderRadius: 8,
    },
    Button: {
      primaryShadow: 'none',
      fontWeight: 600,
    },
    Card: {
      borderRadiusLG: 14,
    },
    Table: {
      headerBg: brandColors.slate100,
      headerColor: brandColors.slate700,
    },
    Tabs: {
      itemSelectedColor: brandColors.emerald600,
      inkBarColor: brandColors.emerald600,
    },
  },
};
