import { PropsWithChildren, ReactElement, useState } from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { HapticTab } from './HapticTab';
import { router } from 'expo-router';

type Props = PropsWithChildren<{
  title: string;
  image: ReactElement;
  id: string;
}>;

export function ExerciseCard({
  children,
  title,
  image,
  id,
}: Props) {
  const theme = useColorScheme() ?? 'light';

  const cardColor = {
    light: "#00000016",
    dark: "#ffffff08"
  }

  return (
    <ThemedView style={[styles.card, {backgroundColor: cardColor[theme]}]}>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => {router.push(`/history/${id}`)}}
        activeOpacity={0.8}>
        {image}
        
        <ThemedText type="title">{title}</ThemedText>
      </TouchableOpacity>
      
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    marginTop: 6,
    backgroundColor: "transparent",
  },
  card: {
    padding: 24,
    borderRadius: 12,
  },
});
