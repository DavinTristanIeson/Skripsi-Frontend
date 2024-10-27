import {
  ToggleDispatcher,
  useSetupToggleDispatcher,
} from "@/hooks/dispatch-action";
import { Modal } from "@mantine/core";
import React from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  ProjectConfigDefaultValues,
  ProjectConfigFormSchema,
  ProjectConfigFormType,
  ProjectConfigFormType2Input,
} from "./form-type";
import { useForm } from "react-hook-form";
import { ProjectConfigModel } from "@/api/project/config.model";
import {
  ConfigureProjectFlow_CheckDataset,
  ConfigureProjectFlow_CheckProjectId,
} from "./phases";
import ProjectConfigFormBody from "./form-body";
import FormWrapper from "@/components/utility/form/wrapper";
import { useCreateProject, useUpdateProject } from "@/api/project/mutation";
import { showNotification } from "@mantine/notifications";
import Colors from "@/common/constants/colors";
import { handleFormSubmission } from "@/common/utils/form";
import { useRouter } from "next/router";
import NavigationRoutes from "@/common/constants/routes";

interface ProjectConfigModalProps {
  data?: ProjectConfigModel;
}

function ProjectConfigModalBody(props: ProjectConfigModalProps) {
  const { data } = props;
  const [phase, setPhase] = React.useState(0);
  const resolver = yupResolver(ProjectConfigFormSchema);
  const form = useForm({
    mode: "onChange",
    resolver,
    defaultValues: ProjectConfigDefaultValues(),
  });

  const onContinue = () => setPhase((phase) => phase + 1);
  const onBack = () => setPhase((phase) => phase - 1);

  const { mutateAsync: create } = useCreateProject();
  const { mutateAsync: update } = useUpdateProject();
  const router = useRouter();

  const handleSubmit = handleFormSubmission(
    async (values: ProjectConfigFormType) => {
      const input = ProjectConfigFormType2Input(values);
      const res = data
        ? await update({
            id: data.projectId,
            body: input,
          })
        : await create(input);

      if (res.message) {
        showNotification({
          color: Colors.sentimentSuccess,
          message: res.message,
        });
      }

      if (!data) {
        router.push({
          pathname: NavigationRoutes.Project,
          query: {
            id: res.data.id,
          },
        });
      }
    },
    form.setError
  );

  return (
    <FormWrapper form={form} onSubmit={handleSubmit}>
      {phase === 0 && (
        <ConfigureProjectFlow_CheckProjectId onContinue={onContinue} />
      )}
      {phase === 1 && (
        <ConfigureProjectFlow_CheckDataset
          onContinue={onContinue}
          onBack={onBack}
          hasData={!!data}
        />
      )}
      {phase === 2 && <ProjectConfigFormBody onBack={onBack} />}
    </FormWrapper>
  );
}

const ProjectConfigModal = React.forwardRef<
  ToggleDispatcher | undefined,
  ProjectConfigModalProps
>((props, ref) => {
  const [opened, setOpened] = useSetupToggleDispatcher(ref);
  return (
    <Modal
      opened={opened}
      onClose={() => {
        setOpened(false);
      }}
      size={1200}
      centered
      closeOnClickOutside={false}
    >
      <Modal.Body>{opened && <ProjectConfigModalBody {...props} />}</Modal.Body>
    </Modal>
  );
});
ProjectConfigModal.displayName = "CreateProjectModal";

export default ProjectConfigModal;
