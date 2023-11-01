import * as gcp from '@pulumi/gcp'

const prefix = 'test'

// -------------------------------------- //
// Deploy a custom container to Cloud Run //
// -------------------------------------- //

const customRuntimeEnvironmentRegistry = `${prefix}-artifact-registry`
const customRuntimeEnvironmentName = `${prefix}-image`
const customRuntimeRepositoryName = `${prefix}-repository`
const currentImageVersion = 'v0.0.1' 


const registryRepository = new gcp.artifactregistry.Repository(
  customRuntimeEnvironmentRegistry,
  {
    dockerConfig: {
      immutableTags: true,
    },
    description: 'Docker repository',
    format: 'DOCKER',
    repositoryId: customRuntimeRepositoryName,
  },
)
