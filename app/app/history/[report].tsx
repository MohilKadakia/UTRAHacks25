import { Image, StyleSheet, Platform, PermissionsAndroid, TextInput } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { useEffect, useState } from 'react';
import { HapticTab } from '@/components/HapticTab';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import Graph from '@/components/Graph';

export default function HomeScreen() {

  const [number, setNumber] = useState('');

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>

      {/* <Graph></Graph> */}
      
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">TEST PAGE</ThemedText>
      </ThemedView>
      <HapticTab 
        onPress={() => {}}
        style={styles.confirmButton}
        ><ThemedText>Confirm: {number}</ThemedText></HapticTab>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  confirmButton: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#457f35',
    borderRadius: 12,
    maxWidth: 480,
  }
});
