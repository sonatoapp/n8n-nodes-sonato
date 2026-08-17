# n8n-nodes-sonato

This is an n8n community node. It lets you use [sona.to](https://sona.to) in your n8n workflows.

sona.to is a social media management and SEO platform. Schedule posts across your connected channels, upload media, run site audits and generate fixes for the issues they find.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### sona.to

- **Account**
    - Get the account and plan this token belongs to
- **Analytics**
    - Get metrics for one connected channel
- **Channel**
    - Get many connected channels
- **File**
    - Upload an image or video and get a URL to use in a post
- **Post**
    - Create a post
    - Get a post
    - Get many posts
    - Update a post
    - Cancel a post
- **SEO Project**
    - Create an SEO project
    - Get an SEO project
    - Get many SEO projects
    - Get issues for an SEO project
    - Get pages for an SEO project
    - Run an audit on an SEO project
- **SEO Issue**
    - Generate a fix for an SEO issue

### sona.to Trigger

Starts a workflow when one of these happens in your account:

- A post was published
- A post failed to publish
- A site audit finished
- A site audit failed to complete

Publishing a workflow registers a webhook on your sona.to account. Unpublishing it removes the webhook again.

Each delivery is signed by sona.to, and the trigger checks that signature before starting the workflow. A request with a missing, malformed, stale or incorrect signature is rejected.

## Credentials

Authentication uses an API token.

1. Sign in to your [sona.to](https://sona.to) account.
2. Open the API section of your dashboard.
3. Create a token and give it a name, for example n8n.
4. Choose the scopes. Read is enough to list and retrieve. Write is required to create, change or delete anything, including uploading files and starting audits.
5. Copy the token. It is shown once.
6. In n8n, create a new sona.to API credential and paste the token in.

Use Test connection to check the token before saving.

## Compatibility

Requires n8n 1.60.0 or later.

The SEO operations need the SEO product on your sona.to plan, on top of API access. Without it those operations return a permission error, and the rest of the node still works.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [sona.to API documentation](https://developers.sona.to)
