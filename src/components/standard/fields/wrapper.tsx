import Colors from "@/common/constants/colors";
import {
  NumberInput,
  NumberInputProps,
  Select,
  SelectProps,
  Switch,
  SwitchProps,
  TagsInput,
  TagsInputProps,
  TextInput,
  TextInputProps,
} from "@mantine/core";
import { DateTimePicker, DateTimePickerProps } from "@mantine/dates";
import { useController } from "react-hook-form";
import Text from "../text";

interface TextFieldProps extends TextInputProps {
  name: string;
}

export function TextField(props: TextFieldProps) {
  const {
    field,
    fieldState: { error },
    formState: { isSubmitting, disabled },
  } = useController({
    name: props.name,
  });

  return (
    <TextInput
      {...field}
      error={error?.message}
      disabled={isSubmitting || disabled}
      {...props}
    />
  );
}

interface DateTimeFieldProps extends DateTimePickerProps {
  name: string;
}

export function DateTimeField(props: DateTimeFieldProps) {
  const {
    field,
    fieldState: { error },
    formState: { isSubmitting, disabled },
  } = useController({
    name: props.name,
  });

  return (
    <DateTimePicker
      {...field}
      error={error?.message}
      disabled={isSubmitting || disabled}
      {...props}
    />
  );
}

interface NumberFieldProps extends NumberInputProps {
  name: string;
  percentage?: boolean;
}

export function NumberField(props: NumberFieldProps) {
  const { percentage, ...restProps } = props;
  const {
    field,
    fieldState: { error },
    formState: { isSubmitting, disabled },
  } = useController({
    name: props.name,
  });

  return (
    <NumberInput
      {...field}
      value={
        field.value == null ? "" : percentage ? field.value * 100 : field.value
      }
      onChange={(e) => {
        if (e === "" || typeof e === "string") {
          field.onChange(null);
        } else {
          field.onChange(percentage ? e / 100 : e);
        }
      }}
      decimalScale={percentage ? 4 : 0}
      disabled={isSubmitting || disabled}
      error={error?.message}
      rightSection={
        percentage ? <Text c={Colors.foregroundDull}>%</Text> : null
      }
      {...restProps}
    />
  );
}

interface SwitchFieldProps extends SwitchProps {
  name: string;
}

export function SwitchField(props: SwitchFieldProps) {
  const {
    field: { value, ...restField },
    fieldState: { error },
    formState: { disabled, isSubmitting },
  } = useController({
    name: props.name,
  });

  return (
    <Switch
      checked={value}
      {...restField}
      error={error?.message}
      disabled={isSubmitting || disabled}
      {...props}
    />
  );
}

interface TagsFieldProps extends TagsInputProps {
  name: string;
}

export function TagsField(props: TagsFieldProps) {
  const {
    field,
    fieldState: { error },
    formState: { isSubmitting, disabled },
  } = useController({
    name: props.name,
  });

  return (
    <TagsInput
      {...field}
      error={error?.message}
      disabled={isSubmitting || disabled}
      {...props}
    />
  );
}

interface SelectFieldProps extends SelectProps {
  name: string;
}

export function SelectField(props: SelectFieldProps) {
  const {
    field,
    fieldState: { error },
    formState: { isSubmitting, disabled },
  } = useController({
    name: props.name,
  });

  return (
    <Select
      {...field}
      error={error?.message}
      disabled={isSubmitting || disabled}
      {...props}
    />
  );
}
