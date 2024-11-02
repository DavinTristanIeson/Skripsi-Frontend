import { useSendVariableAssociationRequest } from "@/api/association/mutation";
import {
  useGetVariableAssociationStatus,
  VariableAssociationQueryKeys,
} from "@/api/association/query";
import { ProjectModel } from "@/api/project/model";
import { queryClient } from "@/common/api/query-client";
import Colors from "@/common/constants/colors";
import { SchemaColumnTypeEnum } from "@/common/constants/enum";
import ProjectAssociationRenderer from "@/modules/projects/association/renderer";
import AppProjectLayout from "@/modules/projects/common/layout";
import ProcedureStatus, {
  useTriggerProcedure,
} from "@/modules/projects/common/procedure";
import { ProjectColumnSelectInput } from "@/modules/projects/common/select";
import { Group, Stack } from "@mantine/core";
import { ArrowsLeftRight } from "@phosphor-icons/react";
import React from "react";
import { flushSync } from "react-dom";

function ProjectAssociationPageBody(props: ProjectModel) {
  const { config } = props;
  const [column1, setColumn1] = React.useState<string | null>(
    config.dataSchema.columns.find(
      (col) => col.type === SchemaColumnTypeEnum.Textual
    )?.name ?? null
  );
  const [column2, setColumn2] = React.useState<string | null>(null);
  const procedureProps = useTriggerProcedure({
    useGetStatus: useGetVariableAssociationStatus,
    useSendRequest: useSendVariableAssociationRequest,
    keepPreviousData: true,
    input: {
      id: config.projectId,
      column1: column1!,
      column2: column2!,
    },
    enabled: !!column1 && !!column2,
  });
  const data = procedureProps.data?.data;

  const shouldRunProcedure = async () => {
    if (!column1 || !column2) {
      return;
    }
    const cacheState = queryClient.getQueryState(
      VariableAssociationQueryKeys.association({
        id: config.projectId,
        column1,
        column2,
      })
    );
    if (!cacheState?.data || cacheState.isInvalidated) {
      await procedureProps.execute();
      procedureProps.refetch();
    }
  };

  return (
    <Stack>
      <ProcedureStatus
        title="Topic Association"
        description="Find out how closely related the topics that were found by the topic modeling algorithm to the other variables in the dataset."
        BelowDescription={
          <Group>
            <ProjectColumnSelectInput
              value={column1}
              data={config.dataSchema.columns.filter(
                (col) => col.type === SchemaColumnTypeEnum.Textual
              )}
              onChange={(col) => {
                setColumn1(col?.name ?? null);
                flushSync(shouldRunProcedure);
              }}
            />
            <ArrowsLeftRight color={Colors.foregroundDull} />
            <ProjectColumnSelectInput
              value={column2}
              data={config.dataSchema.columns.filter(
                (col) => col.type !== SchemaColumnTypeEnum.Unique
              )}
              onChange={(col) => {
                setColumn2(col?.name ?? null);
                flushSync(shouldRunProcedure);
              }}
            />
          </Group>
        }
        {...procedureProps}
      />
      {data && <ProjectAssociationRenderer {...data} />}
    </Stack>
  );
}

export default function ProjectAssociationPage() {
  return (
    <AppProjectLayout>
      {(project) => <ProjectAssociationPageBody {...project} />}
    </AppProjectLayout>
  );
}
