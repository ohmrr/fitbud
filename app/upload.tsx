import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

const SCREEN_OPTIONS = {
  title: 'Upload Video',
  headerTransparent: true,
  headerRight: () => <ThemeSwitcher />,
};

export default function Screen() {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 items-center justify-center gap-8 p-4">
        <View style={styles.container}>
          <Button
            style={{ padding: 80, borderRadius: 10 }}
            onPress={() => {
              console.log('Upload button pressed');
            }}>
            <Text>Upload</Text>
          </Button>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    padding: 100,
    fontSize: 90,
  },
  button: {
    paddingVertical: 80, // Increase vertical padding
    paddingHorizontal: 60, // Increase horizontal padding
    borderRadius: 40, // Adjust border radius
  },
});

<Button style={styles.button}>
  <Text>Upload</Text>
</Button>;
