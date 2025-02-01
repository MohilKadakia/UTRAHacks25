import { PropsWithChildren, ReactElement, useState } from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { HapticTab } from './HapticTab';

type Props = PropsWithChildren<{
  title: string;
  image: ReactElement;
}>;

export function ExerciseCard({
  children,
  title,
  image,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  const cardColor = {
    light: "#00000016",
    dark: "#ffffff08"
  }

  return (
    <ThemedView style={[styles.card, {backgroundColor: cardColor[theme]}]}>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        {image}
        
        <ThemedText type="title">{title}</ThemedText>
      </TouchableOpacity>
      
      {/* Start Exercise Session Button */}
      {isOpen && <ThemedView style={styles.content}> 
        <HapticTab style={styles.startButton}>Start</HapticTab>
      </ThemedView>}
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
  startButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#457f35',
    borderRadius: 12,
    maxWidth: 96,
  },
});
