import { TextField } from "@/components/ui/text-field";

interface CodeFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
  error?: string;
}

/** One-time code input: numeric keyboard and OS code autofill. */
export function CodeField({ value, onChangeText, onSubmitEditing, error }: CodeFieldProps) {
  return (
    <TextField
      label="Code"
      value={value}
      onChangeText={onChangeText}
      placeholder="123456"
      keyboardType="number-pad"
      autoComplete="one-time-code"
      textContentType="oneTimeCode"
      maxLength={12}
      returnKeyType="go"
      onSubmitEditing={onSubmitEditing}
      error={error}
    />
  );
}
