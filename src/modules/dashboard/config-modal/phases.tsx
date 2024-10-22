import {
  useProjectCheckDataset,
  useProjectCheckId,
} from "@/api/project/mutation";
import Colors from "@/common/constants/colors";
import {
  Alert,
  Box,
  Flex,
  NumberInput,
  Select,
  TextInput,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import React from "react";
import Text from "@/components/standard/text";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { ArrowLeft, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { ProjectCheckDatasetModel } from "@/api/project/model";
import { DataSourceTypeEnum, EnumList } from "@/common/constants/enum";
import Button from "@/components/standard/button/base";
import { ProjectConfigFormType } from "./form-type";
import { formSetErrors, handleFormSubmission } from "@/common/utils/form";
import EnumSelect from "@/components/widgets/enum-select";

// +------------------+
// | CHECK PROJECT ID |
// +------------------+

interface CreateProjectFlow_CheckProjectIdProps {
  onContinue(): void;
}

export function ProjectIdForm() {
  const { register } = useFormContext<ProjectConfigFormType>();

  return (
    <TextInput
      {...register("projectId")}
      label="Project Name"
      description="The name of the project should be unique."
      required
    />
  );
}

export function CreateProjectFlow_CheckProjectId(
  props: CreateProjectFlow_CheckProjectIdProps
) {
  const { mutateAsync: check } = useProjectCheckId();
  const {
    getValues,
    setError,
    formState: { errors },
  } = useFormContext<ProjectConfigFormType>();
  const handleSubmit = handleFormSubmission(async () => {
    const values = getValues();
    const res = await check({
      projectId: values.projectId,
    });
    if (res.message) {
      showNotification({
        message: res.message,
        color: Colors.sentimentSuccess,
      });
    }
    props.onContinue();
  }, setError);

  return (
    <>
      <Title order={2}>1/3: What&apos;s the name of your project?</Title>
      <Alert>
        First things first, please specify the name of your project. Note that
        your project can be found in the{" "}
        <Text
          style={{
            fontFamily: "monospace",
          }}
        >
          data
        </Text>{" "}
        directory in the same directory as the Wordsmith Project.
      </Alert>

      <Button
        leftSection={<CheckCircle size={20} />}
        onClick={handleSubmit}
        disabled={!!errors.projectId}
      >
        Check Project Name
      </Button>
    </>
  );
}

// +---------------+
// | CHECK DATASET |
// +---------------+
interface ProjectConfigDataSourceFormProps {
  readOnly: boolean;
}

function ProjectConfigDataSourceFormFieldSwitcher(
  props: ProjectConfigDataSourceFormProps
) {
  const { control, register } = useFormContext<ProjectConfigFormType>();
  const type = useWatch({
    name: "source.type",
    control,
  });

  if (type === DataSourceTypeEnum.CSV) {
    return (
      <>
        <TextInput
          {...register("source.delimiter")}
          label="Delimiter"
          placeholder=","
          description="The delimiter used to separate the columns in a CSV file. It's usually , or ;."
          required
        />
        <Controller
          name="source.limit"
          render={({ field }) => {
            return (
              <NumberInput
                value={field.value}
                onChange={(value) => {
                  field.onChange(value === "" ? null : undefined);
                }}
                min={1}
                label="Delimiter"
                placeholder=","
                description="The delimiter used to separate the columns in a CSV file. It's usually , or ;."
                required
              />
            );
          }}
        />
      </>
    );
  }
  if (type === DataSourceTypeEnum.Excel) {
    return (
      <TextInput
        {...register("source.sheetName")}
        label="Sheet Name"
        description="The sheet that contains the data to be analyzed."
        readOnly={props.readOnly}
        required
      />
    );
  }
  return null;
}

export function ProjectConfigDataSourceForm(
  props: ProjectConfigDataSourceFormProps
) {
  const { register, setValue } = useFormContext<ProjectConfigFormType>();
  return (
    <>
      {props.readOnly && (
        <Alert color={Colors.sentimentWarning}>
          <Flex align="center">
            <WarningCircle size={24} />
            Fundamental dataset properties cannot be altered as your existing
            columns will need to be cleared and re-configured. If you want to
            change the dataset, we recommend creating a new project rather than
            modifying this one.
          </Flex>
        </Alert>
      )}
      <Flex gap={24}>
        <TextInput
          {...register("source.path")}
          label="Dataset Path"
          placeholder="path/to/dataset"
          description="Enter the path (preferably absolute) of your dataset. You can also specify the path relative to the directory of the Wordsmith Project, but this is not recommended."
          required
          readOnly={props.readOnly}
          w="100%"
        />
        <EnumSelect
          {...register("source.type")}
          onChange={(value) => {
            setValue("source.type", value as DataSourceTypeEnum);
          }}
          type={EnumList.DataSourceTypeEnum}
          clearable={false}
          label="Dataset Type"
          description="We need to know the type of the dataset so that we can properly parse its contents."
          readOnly={props.readOnly}
          w="100%"
        />
      </Flex>
      <Box w="50%">
        <ProjectConfigDataSourceFormFieldSwitcher {...props} />
      </Box>
    </>
  );
}

interface CreateProjectFlow_CheckDatasetProps {
  onContinue(values: ProjectCheckDatasetModel): void;
  onBack(): void;
}

export function CreateProjectFlow_CheckDataset(
  props: CreateProjectFlow_CheckDatasetProps
) {
  const { mutateAsync: check } = useProjectCheckDataset();
  const { getValues, setError } = useFormContext<ProjectConfigFormType>();
  const handleSubmit = async () => {
    const values = getValues();
    try {
      const res = await check(values.source);
      if (res.message) {
        showNotification({
          message: res.message,
          color: Colors.sentimentSuccess,
        });
      }
      props.onContinue(res.data);
    } catch (e: any) {
      console.error(e);
      if (e.message) {
        showNotification({
          color: Colors.sentimentError,
          message: e.message,
        });
      }
      if (e.errors) {
        formSetErrors(e.errors, (name, error) =>
          setError(`source.${name}` as any, error)
        );
      }
    }
  };

  return (
    <>
      <Alert>
        Next, we need a dataset to get started. Please specify the file path
        (e.g.: /user/path/to/dataset, ../path/to/dataset,
        C:/Users/User/path/to/dataset) so that we can access the dataset. Please
        note that the dataset should be of type CSV, PARQUET, or EXCEL.
      </Alert>

      <ProjectConfigDataSourceForm readOnly={false} />

      <Flex justify="between">
        <Button
          leftSection={<ArrowLeft size={20} />}
          variant="outline"
          onClick={props.onBack}
        >
          Change Project Name?
        </Button>
        <Button leftSection={<CheckCircle size={20} />} onClick={handleSubmit}>
          Verify Dataset
        </Button>
      </Flex>
    </>
  );
}