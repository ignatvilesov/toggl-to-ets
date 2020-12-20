import request from "request-promise-native";

import { askCheckbox, askList } from "./cliClient.js";
import { formatDate } from "./dateUtils.js";

export class TogglApi {
  #apiUrl = "https://api.track.toggl.com";

  constructor({ token }) {
    this.token = token;
  }

  async getWorkspaceId() {
    const workspaces = await this.requestWorkspaces();

    const workspaceIdToNameMatcher = {};

    const workspaceNames = workspaces.map((workspace) => {
      const { id, name } = workspace;

      workspaceIdToNameMatcher[name] = id;

      return name;
    });

    if (workspaces && workspaces.length > 1) {
      const selectedWorkspace = await askList(
        workspaceNames,
        "You have several workspaces. Please select the required workspace to generate report from:"
      );

      return workspaceIdToNameMatcher[selectedWorkspace];
    }

    return workspaces[0].id;
  }

  async getProjects(workspace) {
    const projects = await this.requestProjects(workspace);

    const projectNames = projects.map((project) => {
      return project.name;
    });

    if (projectNames && projectNames.length > 1) {
      const selectedProjects = await askCheckbox(
        projectNames,
        "What projects should be included?"
      );

      if (selectedProjects && selectedProjects.length) {
        return selectedProjects;
      } else {
        return projectNames;
      }
    }

    return projectNames;
  }

  async getTasks({ startDate, endDate }) {
    const workspace = await this.getWorkspaceId();
    const projects = await this.getProjects(workspace);

    const since = formatDate(startDate);
    const until = formatDate(endDate);

    let accumulatedData = [];
    let pageIndex = 1;
    let totalCount = 0;

    do {
      const data = await this.requestDetailedReport({
        since,
        until,
        workspace,
        page: pageIndex,
      });

      totalCount += data.data.length;

      accumulatedData = accumulatedData.concat(data.data || []);

      if (totalCount >= data.total_count) {
        break;
      }

      pageIndex++;
    } while (true);

    return this.filterByProjectNames(accumulatedData, projects);
  }

  filterByProjectNames(tasks, projectNames) {
    if (projectNames && projectNames.length && tasks && tasks.length) {
      return tasks.filter((task) => {
        return projectNames.some((projectName) => {
          return task.project === projectName;
        });
      });
    }

    return tasks;
  }

  async requestDetailedReport({ since, until, workspace, page }) {
    return this.requestTogglApi(this.getDetailsApiUrl(), {
      page,
      since,
      until,
      workspace_id: workspace,
    });
  }

  getDetailsApiUrl() {
    return `${this.#apiUrl}/reports/api/v2/details`;
  }

  async requestWorkspaces() {
    return this.requestTogglApi(this.getWorkspacesApiUrl());
  }

  getWorkspacesApiUrl() {
    return `${this.#apiUrl}/api/v8/workspaces`;
  }

  getProjectsApiUrl(workspace) {
    return `${this.#apiUrl}/api/v8/workspaces/${workspace}/projects`;
  }

  async requestProjects(workspace) {
    return this.requestTogglApi(this.getProjectsApiUrl(workspace));
  }

  async requestTogglApi(uri, queryOptions = {}) {
    const options = {
      uri,
      qs: {
        user_agent: "cli_toggle_to_ets",
        ...queryOptions,
      },
      auth: {
        user: this.token,
        pass: "api_token",
      },
      json: true,
    };

    return request(options);
  }
}
