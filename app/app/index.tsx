import { Image, StyleSheet, TextInput } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { useEffect, useState } from 'react';
import { HapticTab } from '@/components/HapticTab';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';

export default function HomeScreen() {

  const router = useRouter();
  
  useEffect(() => {
    // Redirect to home page after 2 seconds
    const timer = setTimeout(() => {
      router.push('/history');
    }, 1000);

    // Clean up the timeout if the component unmounts
    return () => clearTimeout(timer);
  }, [router]);

  // const [number, setNumber] = useState('');

  // Store IP Address so it doesn't have to be typed each time
  // const storeData = async (value : string) => {
  //   try {
  //     await AsyncStorage.setItem('ipaddr', value);
  //     router.push('/history')
  //   } catch (e) {
  //     return false;
  //   }
  // };

  // Get IP Address from storage if exists
  // useEffect(() => {
  //   const getData = async () => {
  //     try {
  //       const value = await AsyncStorage.getItem('ipaddr');
  //       if (value !== null) {
  //         setNumber(value);
  //       }
  //     } catch (e) {
  //       // error reading value
  //     }
  //   };

  //   getData();
  // }, [])

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <></>
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Home Page</ThemedText>
      </ThemedView>
      {/* <TextInput
        style={styles.input}
        onChangeText={setNumber}
        value={number}
        placeholder="IP Address"
        keyboardType="numeric"
      /> */}
      <HapticTab 
        onPress={() => {router.push('/history')}}
        style={styles.confirmButton}
        ><ThemedText>Login</ThemedText></HapticTab>
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
