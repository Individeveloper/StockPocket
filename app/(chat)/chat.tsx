/**
 * Chat Screen Wrapper for expo-router
 */

import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { ChatScreen } from '../screens/ChatScreen';

export default function ChatScreenWrapper() {
  const navigation = useNavigation();
  const route = useRoute();

  return <ChatScreen navigation={navigation} route={route} />;
}
