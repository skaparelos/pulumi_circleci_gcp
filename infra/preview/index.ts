import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import * as gcp from "@pulumi/gcp";

// Get the GCP project config
const projectId = 'deleteme-403817'
const location = 'us-central1'
const prefix = 'test'

let customRuntimeEnvironmentName = `${prefix}-image`

const config = new pulumi.Config()
const branchName = config.require('branch')?.toLowerCase()
console.log("branch name=", branchName)

// gets repository from 'shared' stack
const sharedStack = new pulumi.StackReference("skaparelos/pulumi-tests/shared");
const repositoryName = sharedStack.getOutput("repositoryName");


const renderFaasDockerImageName = pulumi.all([repositoryName, "us-central1", projectId, branchName])
  .apply(([repoName, repoLocation, projId, branch]) =>
    `${repoLocation}-docker.pkg.dev/${projId}/${repoName}/${customRuntimeEnvironmentName}:${branchName ? branch : "latest"}`
  );

const image = new docker.Image(customRuntimeEnvironmentName, {
  build: {
    context: "../../backend1/",
    platform: 'linux/amd64',
  },
  imageName: renderFaasDockerImageName,
});

// Create a Cloud Run service that uses the Docker image
const service = new gcp.cloudrunv2.Service(`${prefix}-service-${branchName}-preview`, {
  ingress: "INGRESS_TRAFFIC_ALL",
  location: "us-central1",
  template: {
    containers: [{
      image: image.imageName,
    }],
  },
});

// Export the URL of the deployed service
exports.url = service.uri



