import { Image, StyleSheet} from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { ExerciseCard } from '@/components/ExerciseCard';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Exercises</ThemedText>
      </ThemedView>

      {/* // ADD EXERCISES HERE
      // ADD EXERCISES HERE
      // ADD EXERCISES HERE
      // ADD EXERCISES HERE
      // ADD EXERCISES HERE
      // ADD EXERCISES HERE */}
      <ExerciseCard 
        title="hi"
        image={
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.exercizeIcon}
          />
        }
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  exercizeIcon: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 16,
  }
});
