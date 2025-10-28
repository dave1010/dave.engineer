---
title: "Making API Specifications with Wiretap and AI"
date: 2023-11-27
tags:
  - apis
type: til
---
I work with APIs most days and occasionally come across one without an accurate API specification.
  This happened recently and I thought it would be worth creating a spec before starting to use the API: that way I could make use of existing tools and libraries, rather than manually piecing together `curl` commands.

My journey involved using [Wiretap](https://pb33f.io/wiretap/), an OpenAPI spec tool, in conjunction with ChatGPT and [Vacuum](https://quobix.com/vacuum/).

## OpenAPI Specs
OpenAPI specifications are the backbone of clear, consistent API development.
They serve as a contract between the API and its consumers, ensuring reliability and consistency.
Benefits include automated client generation, AI integration, maintaining backward compatibility, and providing clear documentation for users.
Following the Open API spec also allows you to make use of all sorts of existing tools, which is what I was after.

## Starting with ChatGPT
Initially, I used ChatGPT to generate a basic OpenAPI spec from a handful of sample API responses. ChatGPT was great at this, writing all the standard boiler plate.
After tweaking some assumptions that ChatGPT made and adding necessary details, I needed a robust way to validate and refine this spec. That's where Wiretap came into the picture.

## Setting Up Wiretap
Installing [Wiretap](https://pb33f.io/wiretap/) was straightforward:

```bash
brew install pb33f/taps/wiretap
```

Running Wiretap was just as simple:

```bash
wiretap -s path/to/spec.yaml -u https://api.example.com
```

This set up a local monitor at `http://localhost:9091/` and a proxy at `http://localhost:9090` for API requests.

Then, all you need to do is fire requests to the localhost proxy and watch Wiretap report on any issues.

## Discovering and Fixing Issues with Wiretap and Vacuum
Wiretap proved invaluable by identifying things like an invalid response type and optional parameters in my spec.
This prompted me to validate the spec further using the [Vacuum](https://quobix.com/vacuum/) linter, another useful tool in the API development toolkit.

Once the spec was in place, it then only takes seconds to paste it into [Swagger Editor](https://editor-next.swagger.io/) (or a tool like Postman)
and get a working API client, making it easy to explore the API. No more messing around with `curl` and manually escaped JSON!

The ease and efficiency of using tools like Wiretap and AI for documentation are game-changing - gone are the days of manual labor-intensive documentation.
