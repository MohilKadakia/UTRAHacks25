import { Image, StyleSheet} from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { ExerciseCard } from '@/components/ExerciseHistoryCard';
import { useEffect, useState } from 'react';
import React from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { HapticTab } from '@/components/HapticTab';

interface Points {
  x: number,
  y: number,
}

interface ExerciseData {
  _id : string,
  points: Points[],
  timestamp: string,
  type: string,
}

export default function HomeScreen() {
  const [data, setData] = useState<ExerciseData[]>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTest = async () => {
      try {
        const response = await fetch('https://utrahacks25.onrender.com/getWorkouts');
        const json = await response.json();
        setData(json);
      } catch (error) {
      console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getTest();
  }, [])

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
    {loading ? 
      <ThemedText>Loading...</ThemedText>
      :
      data?.map(item => {
        return (
          <ExerciseCard 
            title={item.timestamp}
            id={item._id}
            image={
              <Image
                source={require('@/assets/images/partial-react-logo.png')}
                style={styles.exercizeIcon}
              />
            }
          >
            <HapticTab style={styles.startButton}><ThemedText>Expand</ThemedText></HapticTab>
          </ExerciseCard>
        )
      })
    }
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
