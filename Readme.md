* pulumi/circleci integration
* preview-artifact registry
  * contains preview images identified by branch tag. e.g. for service named 'test-graphql' on branch pmbt-722 it would be stored as `test-graphql-image:pmbt-722`. any diff changes will override that image. This is only for preview, and gives ability to easily handle/deal with images
  * saves space by overwriting existing images, instead of creating new ones
* when a PR is created we create a pulumi stack with that branch name which includes all the changes made related to this PR. so we have very clear track of what happened in pmbt-722. e.g. if a cloud run service was created and a few other things pulumi keeps track of these inside the pmbt-722 stack and is easy to delete only that stack later with one command
* deals with 3 cases:
  1. if there’s a change in a service between 2 consequent commits, then deploy this service in preview and use that URL for tests
  2. if there’s NOT a change in a service between 2 consequent commits, but there is a git diff between origin/main in that service, then get the url of the service in preview
  3. if there’s NO change at all for that service, use default preview service URL
* default preview infrastructure created by pulumi with tag 'default-preview'. This is updated whenever there is a PR merge to the main branch by `update-on-pr-merge` at circleci
* On PR merge: Destroy stack resources and delete stack for merged branch
