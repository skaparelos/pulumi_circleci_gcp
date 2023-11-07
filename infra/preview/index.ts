import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import * as gcp from "@pulumi/gcp";

// Get the GCP project config
const projectId = 'deleteme-403817'
const location = 'us-central1'
const prefix = 'test'
let customRuntimeEnvironmentRegistry = `${prefix}-artifact-registry`
let customRuntimeEnvironmentName = `${prefix}-image`
let customRuntimeRepositoryName = `${prefix}-repository`

const config = new pulumi.Config()
const branchName = config.require('branch')?.toLowerCase()
// const commitSHA = config.require('commitsha')?.toLowerCase()
const stack = pulumi.getStack();
console.log("branch name=", branchName)
// console.log("commit sha=", commitSHA)
console.log("Stack =", stack)


if (stack == "preview") {
  customRuntimeEnvironmentRegistry = `preview-artifact-registry`
  customRuntimeEnvironmentName = `${prefix}-image`
  customRuntimeRepositoryName = `preview-repository`
}

const sharedStack = new pulumi.StackReference("skaparelos/pulumi-tests/shared");
// const repository = sharedStack.getOutput("previewRepository")
const repositoryName = sharedStack.getOutput("repositoryName");


const renderFaasDockerImageName = pulumi.all([repositoryName, "us-central1", projectId, branchName])
  .apply(([repoName, repoLocation, projId, branch]) =>
    `${repoLocation}-docker.pkg.dev/${projId}/${repoName}/${customRuntimeEnvironmentName}:${branchName ? branch : "latest"}`
  );

const image = new docker.Image(customRuntimeEnvironmentName, {
  build: {
    context: "./backend1/",
    platform: 'linux/amd64',
  },
  imageName: renderFaasDockerImageName,
});

// Create a Cloud Run service that uses the Docker image
const service = new gcp.cloudrun.Service(`${prefix}-service${stack == "production" ? ""  : "-" + branchName + "-preview"}`, {
  location: "us-central1",
  template: {
    spec: {
      containers: [{
        image: image.imageName,
      }],
    },
  },
});

// Export the URL of the deployed service
exports.url = service.statuses[0].url;



