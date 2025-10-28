---
title: "Vector Databases Overview"
date: 2023-11-21
tags:
  - vector-databases
type: til
---
I was having a look around at vector databases to have a play with document search and realised that suddenly there's support all over the place for them, even from the big players.

ELI5: geo databases query 2 dimensional data, vector DBs query data with 1000+ dimensions. That means data can be related in many ways, such as word meaning.

A few months back it seemed like it was just tiny startups and unstable alphas if you wanted vector DBs.

- [MongoDB Atlas last month](https://www.mongodb.com/products/platform/atlas-vector-search)
- [Elastic 2 months ago](https://www.elastic.co/enterprise-search/generative-ai) 
- pgvector has been around for a while but 2 months ago [AWS added it to RDS](https://aws.amazon.com/about-aws/whats-new/2023/05/amazon-rds-postgresql-pgvector-ml-model-integration/)

I had a play with [Chroma](https://www.trychroma.com/) - it's very quick to get started with if you want to hack around with a vector DB and see what's possible now.
