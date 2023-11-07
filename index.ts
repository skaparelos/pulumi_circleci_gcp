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
const branchName = config.require('branch')
const commitSHA = config.require('commitsha')
const stack = pulumi.getStack();
console.log("branch name=", branchName)
console.log("commit sha=", commitSHA)
console.log("Stack =", stack)
const backendChanged = process.env.BACKEND_CHANGED === 'true';

const previewDefaultRepository = new gcp.artifactregistry.Repository(
  "preview-default-artifact-registry",
  {
    dockerConfig: {
      immutableTags: false,
    },
    description: 'Contains the images built for to be used by the default preview services',
    format: 'DOCKER',
    location,
    repositoryId: "preview-default-repository",
  },
)

if (stack == "preview") {

  customRuntimeEnvironmentRegistry = `preview-artifact-registry`
  customRuntimeEnvironmentName = `${prefix}-image`
  customRuntimeRepositoryName = `preview-repository`

  const repository = new gcp.artifactregistry.Repository(
    customRuntimeEnvironmentRegistry,
    {
      dockerConfig: {
        immutableTags: false,
      },
      description: 'Contains the preview repository',
      format: 'DOCKER',
      location,
      repositoryId: customRuntimeRepositoryName,
    },
  )

  if (backendChanged) {
    // Get registry info (creds and endpoint).
    const renderFaasDockerImageName = repository.name.apply(
      (name) =>
        `${location}-docker.pkg.dev/${projectId}/${name}/${customRuntimeEnvironmentName}:${branchName}`,
    )

    const image = new docker.Image(customRuntimeEnvironmentName, {
      build: {
        context: "./backend1/",
        platform: 'linux/amd64',
      },
      imageName: renderFaasDockerImageName,
      // ...branchName === "main" && { additionalTagNames: ["latest"] },
      // ...branchName !== "main" && { additionalTagNames: [branchName] },
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
    exports.url = service.statuses[0].url;
  } else {

  }
}

if (stack == "production") {
  const repository = new gcp.artifactregistry.Repository(
    customRuntimeEnvironmentRegistry,
    {
      dockerConfig: {
        immutableTags: true,
      },
      description: 'Contains the image repository',
      format: 'DOCKER',
      location,
      repositoryId: customRuntimeRepositoryName,
    },
  )
}



