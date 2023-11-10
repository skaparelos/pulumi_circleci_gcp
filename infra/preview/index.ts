import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import * as gcp from "@pulumi/gcp";


// Get the GCP project config
const projectId = 'deleteme-403817'
const location = 'us-central1'

const config = new pulumi.Config()
const serviceName = process.env.BACKEND ?? 'test'
const branchName = config.require('branch')?.toLowerCase()
console.log("branch name=", branchName)
console.log("serviceName=", serviceName)

const customRuntimeEnvironmentName = `${serviceName}-image`

// gets repository from 'shared' stack
const sharedStack = new pulumi.StackReference("skaparelos/pulumi-tests/shared");
const repositoryName = sharedStack.getOutput("repositoryName");


const renderFaasDockerImageName = pulumi.all([repositoryName, "us-central1", projectId, branchName])
  .apply(([repoName, repoLocation, projId, branch]) =>
    `${repoLocation}-docker.pkg.dev/${projId}/${repoName}/${customRuntimeEnvironmentName}:${branchName ? branch : "latest"}`
  );

const getImageName = (service: string) => {
  return `${location}-docker.pkg.dev/${projectId}/${repositoryName}/${service}-image:${branchName ? branchName : "latest"}`
}

const imageBackend1 = new docker.Image(customRuntimeEnvironmentName, {
  build: {
    context: `../../backend1/`,
    platform: 'linux/amd64',
  },
  imageName: getImageName("backend1"),
});

// Create a Cloud Run service that uses the Docker image
const service1 = new gcp.cloudrunv2.Service(`backend1-service-${branchName}-preview`, {
  ingress: "INGRESS_TRAFFIC_ALL",
  location: "us-central1",
  template: {
    containers: [{
      image: imageBackend1.imageName,
    }],
  },
});


const imageBackend2 = new docker.Image(customRuntimeEnvironmentName, {
  build: {
    context: `../../backend2/`,
    platform: 'linux/amd64',
  },
  imageName: getImageName("backend2"),
});

const service2 = new gcp.cloudrunv2.Service(`backend2-service-${branchName}-preview`, {
  ingress: "INGRESS_TRAFFIC_ALL",
  location: "us-central1",
  template: {
    containers: [{
      image: imageBackend2.imageName,
    }],
  },
});

// Export the URL of the deployed service
exports.urlBackend1 = service1.uri
exports.urlBackend2 = service2.uri



