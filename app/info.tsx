import { InfoCard } from '@/components/InfoCard';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { Camera, ChartNetwork, MoonStarIcon, SunIcon, Upload } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_OPTIONS = {
  title: 'Information',
  headerTransparent: true,
  headerRight: () => <ThemeToggle />,
};

const infoSteps = [
  {
    name: 'Record Yourself Working Out',
    description:
      'Position your camera so your entire body is visible and you\'re the only person in the frame. Use your preferred camera app to record.',
    icon: Camera,
  },
  {
    name: 'Upload Your Video',
    description: 'Go to the upload page and select the video you just recorded.',
    icon: Upload,
  },
  {
    name: 'Get Your Results',
    description: 'Receive your results and personalized tips to improve your form.',
    icon: ChartNetwork,
  },
];

export default function InfoScreen() {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <SafeAreaView className="flex-1">
        <ScrollView
          className="bg-background"
          contentContainerClassName="gap-6 p-4"
          showsVerticalScrollIndicator={true}>
          <View className="items-center gap-2 mt-10">
            <Text className="text-xl font-bold text-foreground">How it Works</Text>
            <Text className="text-muted-foreground">Get Started with 3 Easy Steps</Text>
          </View>

          {infoSteps.map((step, index) => (
            <InfoCard
              key={index}
              name={step.name}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}
