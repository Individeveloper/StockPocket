/**
 * Chat Navigation Group Layout
 */

import { Stack } from 'expo-router';
import React from 'react';

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="chat" options={{ animation: 'none' }} />
      <Stack.Screen name="history" options={{ animation: 'default' }} />
    </Stack>
  );
}
