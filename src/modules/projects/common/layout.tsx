import { ProjectModel } from "@/api/project/model";
import { useGetProject } from "@/api/project/query";
import NavigationRoutes from "@/common/constants/routes";
import AppLayout from "@/components/layout/app";
import AppHeader from "@/components/layout/header";
import { AppSidebarLinkRenderer } from "@/components/layout/sidebar";
import { UseQueryWrapperComponent } from "@/components/utility/fetch-wrapper";
import { MaybeFC } from "@/components/utility/maybe";
import {
  ArrowsLeftRight,
  FileMagnifyingGlass,
  Table,
} from "@phosphor-icons/react";
import { useRouter } from "next/router";
import React from "react";

function ProjectNavbar() {
  const id = useRouter().query.id as string;
  return (
    <AppSidebarLinkRenderer
      links={[
        {
          label: "Topics",
          icon: <FileMagnifyingGlass size={24} />,
          url: {
            pathname: NavigationRoutes.Project,
            query: {
              id,
            },
          },
        },
        {
          label: "Table",
          icon: <Table size={24} />,
          url: {
            pathname: NavigationRoutes.ProjectTable,
            query: {
              id,
            },
          },
        },
        {
          label: "Association",
          icon: <ArrowsLeftRight size={24} />,
          url: {
            pathname: NavigationRoutes.ProjectAssociation,
            query: {
              id,
            },
          },
        },
      ]}
    />
  );
}

interface AppProjectLayoutProps {
  children?: React.ReactNode | ((project: ProjectModel) => React.ReactNode);
}

export default function AppProjectLayout(props: AppProjectLayoutProps) {
  const id = useRouter().query.id as string;
  const query = useGetProject({
    id,
  });
  return (
    <AppLayout
      Header={<AppHeader back title={id} />}
      Sidebar={<ProjectNavbar />}
    >
      <UseQueryWrapperComponent query={query}>
        {(data) => <MaybeFC props={data.data} children={props.children} />}
      </UseQueryWrapperComponent>
    </AppLayout>
  );
}