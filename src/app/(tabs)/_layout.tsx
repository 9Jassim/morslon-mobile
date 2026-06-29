import { Tabs } from 'expo-router';

import { AppHeader } from '@/components/app-header';

export default function TabsLayout() {
  return (
    <Tabs
      // The floating bar is rendered globally (root layout) so it shows on every
      // screen; hide the navigator's own bar here.
      tabBar={() => null}
      screenOptions={{ header: () => <AppHeader /> }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="categories" />
      <Tabs.Screen name="cart" />
      <Tabs.Screen name="wishlist" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
