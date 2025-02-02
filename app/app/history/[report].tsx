import { Image, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { useEffect, useState } from 'react';
import { HapticTab } from '@/components/HapticTab';

import React from 'react';
import Graph from '@/components/Graph';

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

  const { report } = useLocalSearchParams();
  
  const [data, setData] = useState<ExerciseData>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTest = async () => {
      try {
        const response = await fetch(`https://utrahacks25.onrender.com/getWorkout?id=${report}`);
        const json = await response.json();
        setData(json);
      } catch (error) {
      console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getTest();
    }, [report])

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <></>
      }>      
      <ThemedView style={styles.titleContainer}>
        {loading ?
          <ThemedText type="title">Loading...</ThemedText>
          :
          <>
            <ThemedText type="title">Exercise Report</ThemedText>
            <ThemedText type="subtitle">Timestamp: {Date(data?.timestamp)}</ThemedText>
          </>
        }
      </ThemedView>
      <HapticTab 
        onPress={() => {router.push("/history/")}}
        style={styles.backButton}
        ><ThemedText>Go back</ThemedText></HapticTab>
      
      <Graph></Graph>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'columns',
    // alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  input: {
    height: 40,
    marginVertical: 12,
    padding: 10,
    color: "#000000",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    maxWidth: 480,
  },
  backButton: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#ae4535',
    borderRadius: 12,
    maxWidth: 120,
  }
});
