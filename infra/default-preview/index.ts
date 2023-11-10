import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import * as gcp from "@pulumi/gcp";

const config = new pulumi.Config()
const serviceName = config.require('serviceName')?.toLowerCase() ?? 'test'

// Get the GCP project config
const projectId = 'deleteme-403817'
const location = 'us-central1'
let customRuntimeEnvironmentName = `${serviceName}-image`

// gets repository from 'shared' stack
const sharedStack = new pulumi.StackReference("skaparelos/pulumi-tests/shared");
const repositoryName = sharedStack.getOutput("repositoryName");

const renderFaasDockerImageName = pulumi.all([repositoryName, "us-central1", projectId])
  .apply(([repoName, repoLocation, projId]) =>
    `${repoLocation}-docker.pkg.dev/${projId}/${repoName}/${customRuntimeEnvironmentName}:default-preview`
  );

const image = new docker.Image(customRuntimeEnvironmentName, {
  build: {
    context: `../../${serviceName}/`,
    platform: 'linux/amd64',
  },
  imageName: renderFaasDockerImageName,
});

// Create a Cloud Run service that uses the Docker image
const service = new gcp.cloudrunv2.Service(`${serviceName}-service-default-preview`, {
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



