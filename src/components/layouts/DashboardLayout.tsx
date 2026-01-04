import { type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  Settings,
  ExpandLess,
  ExpandMore,
  Home,
  Search,
  Notifications,
  Person,
  TrendingUp,
  BarChart,
  PieChart,
  Help,
} from '@mui/icons-material';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface NavItemWithCollapse extends NavItem {
  subItems?: NavItem[];
}

interface NavGroup {
  label: string;
  items: NavItemWithCollapse[];
}

interface DashboardLayoutProps {
  headerContent?: ReactNode;
  children: ReactNode;
}

// Example sidebar navigation groups
const sidebarGroups: NavGroup[] = [
  {
    label: 'Dashboard',
    items: [
      {
        label: 'Overview',
        icon: <Dashboard />,
        href: '/app',
      },
    ],
  },
  {
    label: 'Content',
    items: [
      {
        label: 'Reports',
        icon: <TrendingUp />,
        href: '#',
        subItems: [
          {
            label: 'Bar Chart',
            icon: <BarChart />,
            href: '/app/reports/bar',
          },
          {
            label: 'Pie Chart',
            icon: <PieChart />,
            href: '/app/reports/pie',
          },
        ],
      },
      {
        label: 'Analytics',
        icon: <Search />,
        href: '/app/analytics',
      },
    ],
  },
  {
    label: 'Settings',
    items: [
      {
        label: 'General',
        icon: <Settings />,
        href: '/app/settings',
      },
      {
        label: 'Help',
        icon: <Help />,
        href: '/app/help',
      },
    ],
  },
];

// Example bottom navigation items for mobile
const bottomNavItems: NavItem[] = [
  {
    label: 'Home',
    icon: <Home />,
    href: '/app',
  },
  {
    label: 'Search',
    icon: <Search />,
    href: '/app',
  },
  {
    label: 'Notifications',
    icon: <Notifications />,
    href: '/app',
  },
  {
    label: 'Profile',
    icon: <Person />,
    href: '/app',
  },
];

const SidebarNavigation = () => {
  const navigate = useNavigate();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupLabel: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupLabel)) {
      newExpanded.delete(groupLabel);
    } else {
      newExpanded.add(groupLabel);
    }
    setExpandedGroups(newExpanded);
  };

  const handleNavClick = (href: string) => {
    if (href !== '#') {
      navigate(href);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {sidebarGroups.map((group) => (
        <Box key={group.label}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              padding: '12px 16px',
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
            }}
          >
            {group.label}
          </Typography>
          <List disablePadding>
            {group.items.map((item) => (
              <Box key={item.label}>
                <ListItemButton
                  onClick={() =>
                    item.subItems
                      ? toggleGroup(item.label)
                      : handleNavClick(item.href)
                  }
                  sx={{
                    px: 2,
                    py: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                  {item.subItems &&
                    (expandedGroups.has(item.label) ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    ))}
                </ListItemButton>
                {item.subItems && (
                  <Collapse
                    in={expandedGroups.has(item.label)}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem) => (
                        <ListItemButton
                          key={subItem.label}
                          onClick={() => handleNavClick(subItem.href)}
                          sx={{
                            pl: 4,
                            py: 0.75,
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText primary={subItem.label} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </Box>
            ))}
          </List>
        </Box>
      ))}
    </Box>
  );
};

const BottomMobileNavigation = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState(0);

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  return (
    <BottomNavigation
      value={value}
      onChange={(_, newValue) => {
        setValue(newValue);
        handleNavigation(bottomNavItems[newValue].href);
      }}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      {bottomNavItems.map((item) => (
        <BottomNavigationAction
          key={item.label}
          label={item.label}
          icon={item.icon}
          sx={{
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
            },
          }}
        />
      ))}
    </BottomNavigation>
  );
};

export const DashboardLayout = ({
  headerContent,
  children,
}: DashboardLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Box
        sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        {/* Mobile Header - Non-elevated */}
        <Box
          sx={{
            padding: 2,
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {headerContent ? (
            headerContent
          ) : (
            <Typography variant="h6">Dashboard</Typography>
          )}
        </Box>

        {/* Mobile Content - Full width with bottom padding to avoid overlap */}
        <Box
          sx={{
            backgroundColor: 'background.paper',
            flex: 1,
            padding: 2,
            paddingBottom: '70px',
            overflow: 'auto',
          }}
        >
          {children}
        </Box>

        {/* Mobile Bottom Navigation - Fixed */}
        <BottomMobileNavigation />
      </Box>
    );
  }

  // Desktop Layout
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', gap: 2, padding: 2 }}>
      {/* Desktop Sidebar - Left Panel (Elevated) */}
      <Paper
        elevation={3}
        sx={{
          width: 280,
          backgroundColor: 'background.paper',
          overflow: 'auto',
          flexShrink: 0,
          borderRadius: 4,
          padding: 1,
        }}
      >
        <Box sx={{ mt: 2 }}>
          <SidebarNavigation />
        </Box>
      </Paper>

      {/* Desktop Right Panel - Contains Header and Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 2 }}>
        {/* Header - Right Panel Top (Elevated) */}
        <Paper
          elevation={3}
          sx={{
            padding: 2,
            backgroundColor: 'background.paper',
            flexShrink: 0,
            borderRadius: 4,
          }}
        >
          {headerContent ? (
            headerContent
          ) : (
            <Typography variant="h6">Dashboard</Typography>
          )}
        </Paper>

        {/* Content - Right Panel Bottom (Elevated) */}
        <Paper
          elevation={3}
          sx={{
            padding: 2,
            backgroundColor: 'background.paper',
            flex: 1,
            overflow: 'auto',
            borderRadius: 4,
          }}
        >
          {children}
        </Paper>
      </Box>
    </Box>
  );
};

export type { DashboardLayoutProps };
