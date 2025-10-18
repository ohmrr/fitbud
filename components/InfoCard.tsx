import { LucideIcon } from "lucide-react-native";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { View } from "react-native";
import { Text } from "./ui/text";

interface InfoCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
}

export function InfoCard({ name, description, icon: Icon }: InfoCardProps) {
  return (
    <Card className="w-full rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm bg-background">
      <View className="items-center justify-center mt-4">
        <View className="rounded-full border border-gray-300 dark:border-gray-600 p-4 bg-muted">
          <Icon className="text-foreground dark:text-muted-foreground" size={28} />
        </View>
      </View>

      <CardHeader className="mt-4 px-4">
        <CardTitle className="text-center text-lg font-semibold text-foreground">
          {name}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        <Text className="text-center text-sm text-muted-foreground">{description}</Text>
      </CardContent>
    </Card>
  );
}
