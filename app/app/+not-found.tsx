import { Link, Stack, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useEffect } from 'react';

export default function NotFoundScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page after 2 seconds
    const timer = setTimeout(() => {
      router.push('/');
    }, 1000);

    // Clean up the timeout if the component unmounts
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">Redirecting to Home Page</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
