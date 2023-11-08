import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import * as gcp from "@pulumi/gcp";

// Get the GCP project config
const projectId = 'deleteme-403817'
const location = 'us-central1'
const prefix = 'test'
let customRuntimeEnvironmentName = `${prefix}-image`

const sharedStack = new pulumi.StackReference("skaparelos/pulumi-tests/shared");
const repositoryName = sharedStack.getOutput("repositoryName");

const renderFaasDockerImageName = pulumi.all([repositoryName, "us-central1", projectId])
  .apply(([repoName, repoLocation, projId]) =>
    `${repoLocation}-docker.pkg.dev/${projId}/${repoName}/${customRuntimeEnvironmentName}:default-preview`
  );

const image = new docker.Image(customRuntimeEnvironmentName, {
  build: {
    context: "../../backend1/",
    platform: 'linux/amd64',
  },
  imageName: renderFaasDockerImageName,
});

// Create a Cloud Run service that uses the Docker image
const service = new gcp.cloudrun.Service(`${prefix}-service-default-preview`, {
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



