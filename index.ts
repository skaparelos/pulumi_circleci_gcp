import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import * as gcp from "@pulumi/gcp";

// Get the GCP project config
const gcpConfig = pulumi.output(gcp.config.project);

// Create a Google Artifact Registry repository to store Docker images
const repository = new gcp.artifactregistry.Repository("app-repository", {
    location: "us-central1",
    repositoryId: "app-repository",
    format: "DOCKER",
});

// Get registry info (creds and endpoint).
const imageName = pulumi.interpolate`${repository.location}-docker.pkg.dev/${gcpConfig}/app-repository/myapp`;

// Build and publish the app image.
const image = new docker.Image("node-app-image", {
    imageName: imageName,
    build: {
        context: "./",  // assuming Dockerfile and app source are in the same directory
    },
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
export const url = service.status.url;
