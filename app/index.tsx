import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, View } from 'react-native';

const LOGO = {
  light: require('@/assets/images/fitbud-dark.png'),
  dark: require('@/assets/images/fitbud-light.png'),
};

const SCREEN_OPTIONS = {
  title: 'FitBud',
  headerTransparent: true,
  headerRight: () => <ThemeSwitcher />,
};

const IMAGE_STYLE: ImageStyle = {
  height: 276,
  width: 276,
};

export default function Screen() {
  const { colorScheme } = useColorScheme();

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 items-center justify-center gap-8 p-4">
        <Image source={LOGO[colorScheme ?? 'light']} style={IMAGE_STYLE} resizeMode="contain" />
        <View className="gap-2 p-4">
          <Text className="ios:text-foreground font-mono text-sm text-muted-foreground">
            1. Upload videos of your form
          </Text>
          <Text className="ios:text-foreground font-mono text-sm text-muted-foreground">
            2. Explanation of how it works
          </Text>
        </View>
        <View className="flex-row items-center justify-center gap-2">
          <Link href="/camera" asChild>
            <Button>
              <Text>Get Started</Text>
            </Button>
          </Link>
          <Link href="/info" asChild>
            <Button variant="secondary">
              <Text>More Info</Text>
            </Button>
          </Link>
        </View>
      </View>
    </>
  );
}
