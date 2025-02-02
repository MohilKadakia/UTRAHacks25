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

  const [dataX, setDataX] = useState<{value: number}[]>([])   
  const [dataY, setDataY]= useState<{value: number}[]>([])
  const [maxY, setMaxY]= useState(0);

  useEffect(() => {
    const getTest = async () => {
      try {
        const response = await fetch(`https://utrahacks25.onrender.com/getWorkout?id=${report}`);
        const json = await response.json();
        setData(json);
        let _maxY = 0;
        json.points.map((point : Points) => {
          if(Math.abs(point.y - json.points[0].y) > _maxY) {
            _maxY = Math.abs(point.y - json.points[0].y)
          }

          dataX.push({
            value: point.x - json.points[0].x
          })
          dataY.push({
            value: Math.abs(point.y - json.points[0].y)
          })
          console.log(dataX, dataY)
          setMaxY(_maxY);
        })
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
            {/* <ThemedText type="subtitle">Timestamp: {Date(data?.timestamp)}</ThemedText> */}
            <HapticTab 
              onPress={() => {router.push("/history")}}
              style={styles.backButton}
              ><ThemedText>Go back</ThemedText></HapticTab>
            
            <Graph 
              dataX={dataX}
              dataY={dataY}    
              maxY={maxY}
            />
          </>
        }
      </ThemedView>
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
