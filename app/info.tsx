import { InfoCard } from '@/components/InfoCard';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { Camera, ChartNetwork, Upload } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_OPTIONS = {
  title: 'Information',
  headerTransparent: true,
};

const infoSteps = [
  {
    name: 'Record Yourself Working Out',
    description:
      "Position your camera so your entire body is visible and you're the only person in the frame. Use your preferred camera app to record.",
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
          <View className="mt-10 items-center gap-2">
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
