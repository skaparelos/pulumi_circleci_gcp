// import * as pulumi from "@pulumi/pulumi";
// import * as docker from "@pulumi/docker";
import * as gcp from "@pulumi/gcp";

// Get the GCP project config
// const projectId = 'deleteme-403817'
const location = 'us-central1'
// const prefix = 'test'


const repository = new gcp.artifactregistry.Repository(
  "preview-artifact-registry",
  {
    dockerConfig: {
      immutableTags: false,
    },
    description: 'Contains the preview repository',
    format: 'DOCKER', 
    location,
    repositoryId: "preview-repository",
  },
)

exports.repositoryName = repository.name










