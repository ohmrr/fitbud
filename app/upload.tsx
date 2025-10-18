import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { MoonStarIcon, StarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, View } from 'react-native';
import { buttonVariants, buttonTextVariants } from "@/components/ui/button"
import { StyleSheet } from 'react-native';


const LOGO = {
  light: require('@/assets/images/fitbud-dark.png'),
  dark: require('@/assets/images/fitbud-light.png'),
};

const SCREEN_OPTIONS = {
  title: 'Upload Video',
  headerTransparent: true,
  headerRight: () => <ThemeToggle />,
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
            <View style={styles.container}>
                <Button style={{ padding: 80, borderRadius: 10 }}
                onPress={() => {
                    console.log("Upload button pressed");
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
</Button>

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
