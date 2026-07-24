import { Link } from "expo-router";
import { View } from "react-native";

import { AppText } from "@/components/ui/app-text";

export default function NotFoundScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <AppText variant="title">Página no encontrada</AppText>
      <Link href="/">
        <AppText variant="body" style={{ marginTop: 12, color: "#007AFF" }}>
          Volver al inicio
        </AppText>
      </Link>
    </View>
  );
}
