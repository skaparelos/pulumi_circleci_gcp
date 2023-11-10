import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import * as gcp from "@pulumi/gcp";

// Get the GCP project config
const projectId = 'deleteme-403817'
const location = 'us-central1'

// gets repository from 'shared' stack
const sharedStack = new pulumi.StackReference("skaparelos/pulumi-tests/shared");
const repositoryName = sharedStack.getOutput("repositoryName");

const getImageName = (service: string) => pulumi.all([repositoryName, location, projectId])
  .apply(([repoName, repoLocation, projId]) =>
   `${repoLocation}-docker.pkg.dev/${projId}/${repoName}/${service}-image:default-preview`
  );

const image1 = new docker.Image(`backend1-service-default-preview`, {
  build: {
    context: `../../backend/backend1/`,
    platform: 'linux/amd64',
  },
  imageName: getImageName("backend1"),
});


const image2 = new docker.Image(`backend2-service-default-preview`, {
  build: {
    context: `../../backend/backend2/`,
    platform: 'linux/amd64',
  },
  imageName: getImageName("backend2"),
});


// Create a Cloud Run service that uses the Docker image

const service1 = new gcp.cloudrunv2.Service(`backend1-service-default-preview`, {
  ingress: "INGRESS_TRAFFIC_ALL",
  location: "us-central1",
  template: {
    containers: [{
      image: image1.imageName,
    }],
  },
});

const service2 = new gcp.cloudrunv2.Service(`backend2-service-default-preview`, {
  ingress: "INGRESS_TRAFFIC_ALL",
  location: "us-central1",
  template: {
    containers: [{
      image: image2.imageName,
    }],
  },
});

// Export the URL of the deployed service
exports.url1 = service1.uri
exports.url2 = service2.uri



