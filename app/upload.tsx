import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Image, type ImageStyle, View } from 'react-native';

const LOGO = {
  light: require('@/assets/images/fitbud-dark.png'),
  dark: require('@/assets/images/fitbud-light.png'),
};

const SCREEN_OPTIONS = {
  title: 'Upload',
  headerTransparent: true,
  headerRight: () => <ThemeSwitcher />,
};

const IMAGE_STYLE: ImageStyle = {
  height: 276,
  width: 276,
};

export default function UploadScreen() {
  const [video, setVideo] = useState<string | null>(null);
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setVideo(result.assets[0].uri);
    }
  };

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 items-center justify-center gap-8 p-4">
          <Button onPress={pickImage}><Text>Upload Video</Text></Button>
          {video && <Image source={{ uri: video }} className="w-[500px] h-[500px]" />}
      </View>
    </>
  );
}
