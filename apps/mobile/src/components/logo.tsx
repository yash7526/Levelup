import { palette } from "@levelup/tokens";
import { StyleSheet, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

import { AppText } from "@/components/ui/text";

/** LevelUp mark (ascending steps on the forest tile) with the wordmark. */
export function Logo() {
  return (
    <View style={styles.row} accessible accessibilityRole="image" accessibilityLabel="LevelUp">
      <Svg width={36} height={36} viewBox="0 0 32 32">
        <Rect width={32} height={32} rx={9} fill={palette.forest[700]} />
        <Path
          d="M9 22h4.5v-4.5H18V13h4.5V9"
          fill="none"
          stroke={palette.lime[300]}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <AppText style={styles.wordmark}>LevelUp</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  wordmark: { fontFamily: "Manrope_800ExtraBold", fontSize: 21, letterSpacing: -0.4 },
});
