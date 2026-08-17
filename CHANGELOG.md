# Changelog

All notable changes to this package are documented here.

## 1.0.0

First release.

### sona.to node

- Account: get the account and plan a token belongs to
- Analytics: get metrics for one connected channel, listing only networks that report analytics
- Channel: get many connected channels, with search
- File: upload an image or video and get a URL to use in a post
- Post: create, get, get many, update, cancel, with search, status and channel filters
- SEO Project: create, get, get many, get issues, get pages, run audit
- SEO Issue: generate a fix

### sona.to Trigger node

- Post published
- Post failed
- SEO audit completed
- SEO audit failed

Deliveries are verified against the HMAC SHA-256 signature sona.to sends with
each request, using the signing secret captured when the webhook is registered.
A delivery with a missing, malformed, stale or incorrect signature does not
start the workflow.
