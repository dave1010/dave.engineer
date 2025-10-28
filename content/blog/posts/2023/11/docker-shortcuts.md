---
title: "Docker Shortcuts"
date: 2023-11-22
tags:
  - docker
type: til
---
Drop into bash on the most recently ran container:

```bash
docker exec -it $(docker ps -ql) bash
```
