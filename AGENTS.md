# n8n community node

## Overview
This is a project containing code for an n8n community node. n8n is a workflow
automation platform where users build workflows with nodes, which are the
building block of a workflow. Nodes can perform a range of actions, such as
starting a workflow (called a "trigger node"), fetching and sending data, or
processing and manipulating it. Besides that there are credentials - entities
that store sensitive information on how to connect to external services and
APIs. A node can require some credentials to be used. Community nodes are a way
for anyone to create such nodes and add them to be used in n8n. All community
nodes are named in a format: `n8n-nodes-<n>` or `@org/n8n-nodes-<n>`.
Community nodes can also be submitted for approval to be used on n8n Cloud
version. In that case there are rules that the node needs to follow in order to
be approved

## Important notes
- Follow the **rules and guidelines in this document and the linked docs
  below** over any code examples.
- All code blocks in these docs are **illustrative and incomplete**.
  They **MUST NOT** be copied verbatim or assumed to be the final desired code.
- Replace example names like `Example`, `Wordpress`, `wordpressApi`, etc.
  with names that match the **actual service / node** you are building.
- When in doubt, **generalize from the patterns**, don't replicate the exact
  structure, fields, or values from the examples.
- Produce the **full implementation** needed for the current project
  (nodes, credentials, tests, etc.), not just fragments similar to examples.
- If an example omits parts (e.g. types, operations, properties), **infer and
  implement the missing parts** based on the real requirements / API docs.
- Never output `Wordpress`-specific code unless the project is actually about
  WordPress.

## Project structure
There are two main folders in this project:
- `nodes` contains all of the nodes in a package (there can be more than 1).
  The code for each node usually lives in its own folder
- `credentials` contains all of the credentials in a package. Usually it's just
  a single file for every credential
So it looks something like this:
.
├── nodes/
│   └── Example/
│       ├── Example.node.ts
│       └── ...
├── credentials/
│   └── Example.credentials.ts
├── package.json
└── ...
It's important to note that `package.json` has a special field `n8n` that have
information about nodes and credentials in a package:
```json
{
  "name": "n8n-nodes-example",
  "version": "1.0.0",
  "n8n": {
    "n8nNodesApiVersion": 1,
    "strict": true,
    "credentials": [
        "dist/credentials/Example.credentials.js"
    ],
    "nodes": [
      "dist/nodes/Example/Example.node.js"
    ]
  }
}
```
`nodes` and `credentials` keys contain paths to transpiled JS files in a `dist`
folder for the nodes and credentials respectively. If you add/remove/rename
nodes and/or credentials, you need to make sure to update `n8n.nodes` and
`n8n.credentials` keys in `package.json` accordingly. Initial files in the
project _may_ contain example nodes and/or credentials that need to be
**removed or renamed** once you start making an actual node.

## Key guidelines
- Use the `n8n-node` CLI tool **whenever possible** for building, dev mode,
  linting, etc.
- **Always** address any lint/typecheck errors/warnings, unless there is a
  **very specific reason** to ignore/disable it
- Make sure to use **proper types whenever possible**
- If you are updating the npm package version, make sure to **update
  CHANGELOG.md** in the root of the repository
- Read `.agents/workflow.md` for more info

## Context-specific docs
Load these before working on the relevant area:

| Working on...                        | Read first                                                          |
|--------------------------------------|---------------------------------------------------------------------|
| Any node file in `nodes/`            | `.agents/nodes.md` and `.agents/properties.md`                      |
| A declarative-style node             | above + `.agents/nodes-declarative.md`                              |
| A programmatic-style node            | above + `.agents/nodes-programmatic.md`                             |
| Files in `credentials/`              | `.agents/credentials.md`                                            |
| Adding a new version to a node       | `.agents/versioning.md`                                             |
| Starting a new task or planning      | `.agents/workflow.md`                                               |

## Additional resources
If you need any extra information, here are links to n8n's official docs
regarding building community nodes:
- https://docs.n8n.io/integrations/community-nodes/build-community-nodes/
- https://docs.n8n.io/integrations/creating-nodes/overview/
- https://docs.n8n.io/integrations/creating-nodes/build/reference/
- https://docs.n8n.io/integrations/creating-nodes/build/reference/ux-guidelines/

---

# This project: n8n-nodes-sonato

Wraps the sona.to REST API. sona.to is a social media management and SEO
platform. One npm package, two nodes, one credential.

## The API

Base URL `https://api.sona.to/v1`. Docs at `https://developers.sona.to`, and the
OpenAPI spec is the contract: check it before adding or changing an operation
rather than inferring the shape from an existing node file.

Auth is a bearer token, sent as `Authorization: Bearer <token>`. Users create
tokens in their sona.to account. Tokens carry scopes, `read` and `write`, and
write is required for anything that creates, changes or deletes.

OAuth was considered and rejected. sona.to issues public OAuth clients with no
client secret, and n8n's `oAuth2Api` base credential is built around a client id
and secret. A single token field is also less friction for self-hosted users who
already have one in their dashboard.

## Hard constraints

**Zero runtime dependencies.** Required for n8n verification. `package.json` has
no `dependencies` block and must not gain one. File upload uses the global
`FormData` and `Blob` from Node 18+, not the `form-data` package.

**No environment variable or filesystem access.** Also a verification rule.

**MIT licence, public repo, published from GitHub Actions with provenance.**
Publishing from a laptop is not accepted for verified nodes.

## Response shapes

Every endpoint wraps its payload in `data`. Every operation therefore needs
`postReceive` with `rootProperty` set to `data`, or users get the envelope
instead of the records. This is easy to forget on single-record operations.

List endpoints add `meta` with `total`, `limit` and `offset`. Pagination is
offset based, `limit` capped at 200 server side. There are no `Link` headers.

`GET /posts` and `GET /accounts` accept `q` for free-text search: post captions
for the former, channel name or handle for the latter. `GET /seo/projects` does
not. That is why the post resource locator is `searchable: true` and the SEO
project one is not.

## Node inventory

`Sonato.node.ts` is declarative. Resources: Account, Analytics, Channel, File,
Post, SEO Issue, SEO Project.

`SonatoTrigger.node.ts` is programmatic, because webhook lifecycle methods
cannot be expressed declaratively. It registers an endpoint via
`POST /webhooks` on publish and deletes it on unpublish, storing the id and the
signing secret in workflow static data.

Four events: `post.published`, `post.failed`, `seo.audit.completed`,
`seo.audit.failed`.

## Delivery signatures

Each delivery carries `Sona-Signature: t=<unix seconds>,v1=<hex>`, where the
hex is `hmac_sha256(timestamp + "." + rawBody, secret)`. The trigger verifies
it before emitting anything.

Two things make this work and both are easy to break. The secret is returned
only in the `POST /webhooks` response, so `create` has to store it. And the
HMAC must be computed over the raw request bytes from
`getRequestObject().rawBody`, never over a re-serialised body, because
JavaScript will not reproduce the server's exact JSON output.

## Payload shape

The delivered body is an envelope, `{ id, event, created_at, data }`, and the
record sits inside `data`, wrapped again under `post` or `project` depending on
the event. The trigger flattens both levels and renames the envelope fields to
`event`, `event_id` and `event_created_at` so they cannot collide with the
record's own `created_at`.

## Things that will bite

**SEO operations require a plan that includes SEO.** A user whose plan does not
include it gets a 403 rather than an empty result, and reconnecting the
credential will not change that.

**Webhook endpoints are capped per team.** Every published trigger workflow
consumes one, so a user with several can hit the ceiling.

**Multipart needs the JSON `Content-Type` removed.** `requestDefaults` sets
`application/json`, and leaving it in place sends a multipart body without a
boundary. The `preSend` hook in `resources/file/index.ts` deletes it.

**Posts cannot be retargeted.** `accounts` is accepted on create and not on
update.

**Creating a post with several channels returns one record per channel.**

**SEO issue ids are plain integers**, unlike the opaque string ids used
everywhere else in the API.

## Repo hygiene

This repo is public. No real account ids, post ids, project ids, tokens, emails
or customer domains anywhere, including in examples, samples and placeholder
values. Use the `example01` pattern and `example.com`, matching the OpenAPI
spec. Read files in full before pushing rather than grepping for credential
patterns.
