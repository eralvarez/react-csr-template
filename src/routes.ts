import { type RouteConfig, index, route, layout } from '@react-router/dev/routes';

export default [
  layout('components/layouts/PublicLayout.tsx', [
    index('routes/home.tsx'),
    route('register', 'routes/register.tsx'),
  ]),
] satisfies RouteConfig;
