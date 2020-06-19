import Project from "../resources/Project";

export function findProjectById(projects: Project[], id: number): Project {
  const proj = projects.filter(function (project) {
    // project.id and id are not considered equal by ===, but are equal 
    // according to ==
    // eslint-disable-next-line eqeqeq
    return project.id === id;
  });
  return proj[0];
};