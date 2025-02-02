import { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
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

  const gradientColors = {
    light: ['#FF6B6B', '#4ECDC4'],
    dark: ['#6C63FF', '#4834DF']
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => { router.push(`/history/${id}`) }}
      activeOpacity={0.9}>
      <LinearGradient
        colors={gradientColors[theme]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        <ThemedText type="title" style={styles.title}>{title}</ThemedText>
        <View style={styles.imageContainer}>
          {image}
        </View>
        <ThemedText type="default" style={styles.viewDetails}>View Details</ThemedText>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 200,
  },
  title: {
    fontSize: 30,
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  imageContainer: {
    marginVertical: 15,
    transform: [{ scale: 1.1 }],
  },
  viewDetails: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
    padding: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  }
});