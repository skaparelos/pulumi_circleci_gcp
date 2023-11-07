// import * as pulumi from "@pulumi/pulumi";
// import * as docker from "@pulumi/docker";
// import * as gcp from "@pulumi/gcp";

// // Get the GCP project config
// const projectId = 'deleteme-403817'
// const location = 'us-central1'
// const prefix = 'test'
// let customRuntimeEnvironmentRegistry = `${prefix}-artifact-registry`
// let customRuntimeEnvironmentName = `${prefix}-image`
// let customRuntimeRepositoryName = `${prefix}-repository`

// const config = new pulumi.Config()
// const branchName = config.require('branch')?.toLowerCase()
// // const commitSHA = config.require('commitsha')?.toLowerCase()
// const stack = pulumi.getStack();
// console.log("branch name=", branchName)
// // console.log("commit sha=", commitSHA)
// console.log("Stack =", stack)


// if (stack == "preview") {
//   customRuntimeEnvironmentRegistry = `preview-artifact-registry`
//   customRuntimeEnvironmentName = `${prefix}-image`
//   customRuntimeRepositoryName = `preview-repository`
// }

// const repository = new gcp.artifactregistry.Repository(
//   customRuntimeEnvironmentRegistry,
//   {
//     dockerConfig: {
//       immutableTags: false,
//     },
//     description: 'Contains the preview repository',
//     format: 'DOCKER', 
//     location,
//     repositoryId: customRuntimeRepositoryName,
//   },
// )

// const renderFaasDockerImageName = repository.name.apply(
//   (name) =>
//     `${location}-docker.pkg.dev/${projectId}/${name}/${customRuntimeEnvironmentName}:${stack == "production"? "latest" : branchName}`,
// )

// const image = new docker.Image(customRuntimeEnvironmentName, {
//   build: {
//     context: "./backend1/",
//     platform: 'linux/amd64',
//   },
//   imageName: renderFaasDockerImageName,
// });

// // Create a Cloud Run service that uses the Docker image
// const service = new gcp.cloudrun.Service(`${prefix}-service${stack == "production" ? ""  : "-" + branchName + "-preview"}`, {
//   location: "us-central1",
//   template: {
//     spec: {
//       containers: [{
//         image: image.imageName,
//       }],
//     },
//   },
// });

// // Export the URL of the deployed service
// exports.url = service.statuses[0].url;











//   // if (backendChanged) {
//   //   // Get registry info (creds and endpoint).
    

//   // } else if (initialBackendChanged) {
//   //   // Get the URL from the existing service because there have been changes since the branch diverged from main
//   //   const existingService = gcp.cloudrun.getService({
//   //     // name: `app-service-${branchName}-preview`,
//   //     name: `app-service-pmbt-831-preview`,
//   //     location: "us-central1"
//   //   });
    
//   //   exports.url = existingService.then(s => s?.statuses?.[0].url)
//   // } else {

//   //   // No changes in backend; use the default service URL
//   //   const existingService = gcp.cloudrun.getService({
//   //     name: `app-service-default-preview`,
//   //     location: "us-central1"
//   //   });

//   //   exports.url = existingService.then(s => s.statuses[0].url)

//     // const repository = new gcp.artifactregistry.Repository(
//     //   "preview-default-artifact-registry",
//     //   {
//     //     dockerConfig: {
//     //       immutableTags: false,
//     //     },
//     //     description: 'Contains the images built for to be used by the default preview services',
//     //     format: 'DOCKER',
//     //     location,
//     //     repositoryId: "preview-default-repository",
//     //   },
//     // )

//     // const renderFaasDockerImageName = repository.name.apply(
//     //   (name) =>
//     //     `${location}-docker.pkg.dev/${projectId}/${name}/${customRuntimeEnvironmentName}:preview`,
//     // )

//     // const image = new docker.Image(customRuntimeEnvironmentName, {
//     //   build: {
//     //     context: "./backend1/",
//     //     platform: 'linux/amd64',
//     //   },
//     //   imageName: renderFaasDockerImageName,
//     // });

//     // const service = new gcp.cloudrun.Service(`${prefix}-service-preview`, {
//     //   location: "us-central1",
//     //   template: {
//     //     spec: {
//     //       containers: [{
//     //         image: image.imageName,
//     //       }],
//     //     },
//     //   },
//     // });

//     // exports.url = service.statuses[0].url;
// //   }
// // }


// // if (stack == "production") {
// //   const repository = new gcp.artifactregistry.Repository(
// //     customRuntimeEnvironmentRegistry,
// //     {
// //       dockerConfig: {
// //         immutableTags: true,
// //       },
// //       description: 'Contains the image repository',
// //       format: 'DOCKER',
// //       location,
// //       repositoryId: customRuntimeRepositoryName,
// //     },
// //   )
// // }



