import { ProjectModel } from "@/api/project/model";
import AppProjectLayout from "@/modules/projects/common/layout";

function ProjectTopicsPageBody(props: ProjectModel) {
  return <></>;
}

export default function ProjectTopicsPage() {
  return (
    <AppProjectLayout>
      {(project) => <ProjectTopicsPageBody {...project} />}
    </AppProjectLayout>
  );
}