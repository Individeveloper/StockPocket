/**
 * History Screen Wrapper for expo-router
 */

import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { HistoryScreen } from '../screens/HistoryScreen';

export default function HistoryScreenWrapper() {
  const navigation = useNavigation();

  return <HistoryScreen navigation={navigation} />;
}
