import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import * as gcp from "@pulumi/gcp";

// Get the GCP project config
const projectId = 'deleteme-403817'
const location = 'us-central1'
const prefix = 'test'
const customRuntimeEnvironmentRegistry = `${prefix}-artifact-registry`
const customRuntimeEnvironmentName = `${prefix}-image`
const customRuntimeRepositoryName = `${prefix}-repository`

// Create a Google Artifact Registry repository to store Docker images
const repository = new gcp.artifactregistry.Repository(
    customRuntimeEnvironmentRegistry,
    {
      dockerConfig: {
        immutableTags: true,
      },
      description: 'Peacock Faas Apps docker repository',
      format: 'DOCKER',
      location,
      repositoryId: customRuntimeRepositoryName,
    },
  )

// Get registry info (creds and endpoint).
const renderFaasDockerImageName = repository.name.apply(
    (name) =>
      `${location}-docker.pkg.dev/${projectId}/${name}/${customRuntimeEnvironmentName}:latest`,
  )

const image = new docker.Image(customRuntimeEnvironmentName, {
    build: {
        context: "./backend1/",
        platform: 'linux/amd64',
    },
    imageName: renderFaasDockerImageName,
});

// Create a Cloud Run service that uses the Docker image
const service = new gcp.cloudrun.Service("app-service", {
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
export const url = service.statuses[0].url;
