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
const repository = new gcp.artifactregistry.Repository(customRuntimeEnvironmentRegistry, {
    location,
    repositoryId: customRuntimeRepositoryName,
    format: "DOCKER",
});


// console.log("repository name=")
// console.log(repository.name)

// // Get registry info (creds and endpoint).
// const renderFaasDockerImageName = repository.name.apply(
//     (name) =>
//       `${location}-docker.pkg.dev/${projectId}/${name}/${customRuntimeEnvironmentName}:latest`,
//   )

// console.log("renderFaasDockerImageName=")
// console.log(renderFaasDockerImageName)

// Build and publish the app image.
// const image = new docker.Image(customRuntimeEnvironmentName, {
//     imageName: renderFaasDockerImageName,
//     build: {
//         context: "./backend1/",  // assuming Dockerfile and app source are in the same directory
//     },
// });

const demoImage = new docker.Image("demo-image", {
    build: {
        context: "./backend1/",
    },
    imageName: `${location}-docker.pkg.dev/${projectId}/${customRuntimeRepositoryName}/${customRuntimeEnvironmentName}`,
    // skipPush: true,
});

// Create a Cloud Run service that uses the Docker image
// const service = new gcp.cloudrun.Service("app-service", {
//     location: "us-central1",
//     template: {
//         spec: {
//             containers: [{
//                 image: image.imageName,
//             }],
//         },
//     },
// });

// Export the URL of the deployed service
// export const url = service.statuses[0].url;
