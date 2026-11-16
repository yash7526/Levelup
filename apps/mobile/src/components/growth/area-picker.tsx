import type { LifeArea } from "@levelup/types";
import { lifeAreaLabels } from "@levelup/utils";
import { ScrollView, StyleSheet, View } from "react-native";

import { Chip } from "@/components/ui/chip";
import { AppText } from "@/components/ui/text";

const areas = Object.entries(lifeAreaLabels) as [LifeArea, string][];

interface AreaPickerProps {
  value: LifeArea | null;
  onChange: (area: LifeArea | null) => void;
  label?: string;
}

/** Optional life area, as a scrollable row of chips. */
export function AreaPicker({ value, onChange, label = "Area (optional)" }: AreaPickerProps) {
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        accessibilityRole="radiogroup"
        accessibilityLabel={label}
        contentContainerStyle={styles.row}
      >
        <Chip label="None" selected={value === null} onPress={() => onChange(null)} />
        {areas.map(([area, areaLabel]) => (
          <Chip
            key={area}
            label={areaLabel}
            selected={value === area}
            onPress={() => onChange(area)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  row: { gap: 8, paddingRight: 8 },
});
