import { classNames } from "@/common/utils/styles";
import { useFormContext } from "react-hook-form";
import { Button, ButtonProps } from "@mantine/core";

export default function SubmitButton(props: ButtonProps) {
  const {
    formState: { isSubmitting },
  } = useFormContext();
  return (
    <Button
      {...props}
      type="submit"
      loading={isSubmitting}
      disabled={props.disabled}
      className={classNames(props.className)}
    />
  );
}
