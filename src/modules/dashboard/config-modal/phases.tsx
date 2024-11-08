import {
  useProjectCheckDataset,
  useProjectCheckId,
} from "@/api/project/mutation";
import Colors from "@/common/constants/colors";
import {
  Alert,
  Flex,
  LoadingOverlay,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import React from "react";
import Text from "@/components/standard/text";
import { useFormContext, useWatch } from "react-hook-form";
import { ArrowLeft, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { ProjectCheckDatasetModel } from "@/api/project/model";
import { DataSourceTypeEnum } from "@/common/constants/enum";
import Button from "@/components/standard/button/base";
import {
  DefaultProjectSchemaColumnValues,
  ProjectConfigFormType,
} from "./form-type";
import { formSetErrors, handleFormSubmission } from "@/common/utils/form";
import {
  NumberField,
  SelectField,
  TextField,
} from "@/components/standard/fields/wrapper";

// +------------------+
// | CHECK PROJECT ID |
// +------------------+

interface ConfigureProjectFlow_CheckProjectIdProps {
  onContinue(): void;
}

interface ProjectIdFormProps {
  disabled?: boolean;
}

export function ProjectIdForm(props: ProjectIdFormProps) {
  return (
    <TextField
      name="projectId"
      label="Project Name"
      description="The name of the project should be unique."
      required
      disabled={props.disabled}
    />
  );
}

export function ConfigureProjectFlow_CheckProjectId(
  props: ConfigureProjectFlow_CheckProjectIdProps
) {
  const { mutateAsync: check, isPending } = useProjectCheckId();
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
        color: res.data.available
          ? Colors.sentimentSuccess
          : Colors.sentimentError,
      });
    }
    if (!res.data.available) {
      return;
    }

    props.onContinue();
  }, setError);

  return (
    <Stack className="relative">
      <LoadingOverlay
        visible={isPending}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <Title order={2}>1/3: What&apos;s the name of your project?</Title>
      <Text wrap>
        First things first, please specify the name of your project. Note that
        your project can be found in the{" "}
        <Text c={Colors.foregroundPrimary} span>
          data
        </Text>{" "}
        directory in the same directory as the Wordsmith Project.
      </Text>
      <ProjectIdForm disabled={isPending} />
      <Flex direction="row-reverse" w="100%">
        <Button
          leftSection={<CheckCircle size={20} />}
          onClick={handleSubmit}
          disabled={!!errors.projectId}
          loading={isPending}
        >
          Check Project Name
        </Button>
      </Flex>
    </Stack>
  );
}

// +---------------+
// | CHECK DATASET |
// +---------------+
interface ProjectConfigDataSourceFormProps {
  disabled: boolean;
}

function ProjectConfigDataSourceFormFieldSwitcher(
  props: ProjectConfigDataSourceFormProps
) {
  const { control } = useFormContext<ProjectConfigFormType>();
  const type = useWatch({
    name: "source.type",
    control,
  });

  if (type === DataSourceTypeEnum.CSV) {
    return (
      <Flex gap={24}>
        <TextInput
          name="source.delimiter"
          label="Delimiter"
          placeholder=","
          description="The delimiter used to separate the columns in a CSV file. It's usually , or ;."
          required
          w="100%"
        />
        <NumberField
          name="source.limit"
          min={1}
          label="Rows Limit"
          description="The maximum number of rows to be loaded from the file. Leave this as blank to load every single row."
          w="100%"
        />
      </Flex>
    );
  }
  if (type === DataSourceTypeEnum.Excel) {
    return (
      <TextField
        name="source.sheetName"
        label="Sheet Name"
        description="The sheet that contains the data to be analyzed."
        readOnly={props.disabled}
        required
      />
    );
  }
  return null;
}

export function ConfigureDataSourceForm(
  props: ProjectConfigDataSourceFormProps
) {
  return (
    <>
      <Flex gap={24}>
        <TextField
          name="source.path"
          label="Dataset Path"
          placeholder="path/to/dataset"
          description="Enter the absolute file path or relative file path (relative to the directory of the Wordsmith Project) to your dataset."
          required
          disabled={props.disabled}
          w="100%"
        />
        <SelectField
          name="source.type"
          data={[
            {
              label: "CSV",
              value: DataSourceTypeEnum.CSV,
            },
            {
              label: "Excel",
              value: DataSourceTypeEnum.Excel,
            },
            {
              label: "Parquet",
              value: DataSourceTypeEnum.Parquet,
            },
          ]}
          clearable={false}
          label="Dataset Type"
          description="We need to know the type of the dataset so that we can properly parse its contents. If you specify the wrong type, we won't be able to read the file."
          disabled={props.disabled}
          w="100%"
        />
      </Flex>
      <ProjectConfigDataSourceFormFieldSwitcher {...props} />
    </>
  );
}

interface ConfigureProjectFlow_CheckDatasetProps {
  onContinue(values: ProjectCheckDatasetModel): void;
  onBack(): void;
  hasData: boolean;
}

export function ConfigureProjectFlow_CheckDataset(
  props: ConfigureProjectFlow_CheckDatasetProps
) {
  const { mutateAsync: check, isPending } = useProjectCheckDataset();
  const { getValues, setError, setValue } =
    useFormContext<ProjectConfigFormType>();
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

      setValue(
        "columns",
        res.data.columns.map((column) => {
          return DefaultProjectSchemaColumnValues(column);
        })
      );
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
    <Stack className="relative">
      <Title order={2}>2/3: Where&apos;s the location of your dataset?</Title>
      <Text>
        Next, we need a dataset to get started. Please specify the file path
        (e.g.: /user/path/to/dataset, ../path/to/dataset,
        C:/Users/User/path/to/dataset) so that we can access the dataset. Please
        note that the dataset should be of type CSV, PARQUET, or EXCEL.
      </Text>
      {props.hasData && (
        <Alert color={Colors.sentimentWarning}>
          <Flex align="center" gap={16} py={8}>
            <WarningCircle size={24} />
            Note that once your dataset has been changed, any existing columns
            will need to be re-configured. Perhaps you should create a new
            project instead if you want to keep the column configurations.
          </Flex>
        </Alert>
      )}
      <LoadingOverlay visible={isPending} />
      <ConfigureDataSourceForm disabled={false} />
      <Flex justify="space-between" w="100%">
        <Button
          leftSection={<ArrowLeft size={20} />}
          variant="outline"
          onClick={props.onBack}
        >
          Change Project Name?
        </Button>
        <Button
          leftSection={<CheckCircle size={20} />}
          onClick={handleSubmit}
          loading={isPending}
        >
          Verify Dataset
        </Button>
      </Flex>
    </Stack>
  );
}
