import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Library',
          tabBarIcon: () => null,
        }}
      />
    </Tabs>
  );
}
