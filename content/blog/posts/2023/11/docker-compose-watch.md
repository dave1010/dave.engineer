---
title: "Using Docker Compose Watch instead of Bind Mounts"
date: 2023-11-29
tags:
  - docker
type: til
---
## Docker Volumes

The standard way to keep files in sync between a Docker container and your host is using
volumes. These use (normally) use [bind mounts](https://docs.docker.com/storage/bind-mounts/) under the hood.

You can do this on the command line:

```bash
docker run -v /path/to/local/dir:/path/in/container [other-options] [image-name]
```

Or in a `docker-compose.yml` file:

```yaml
version: '3.3'
services:
  your-service:
    image: your-image
    volumes:
      - /path/to/local/dir:/path/in/container
```

## Watch

Docker Compose [v2.22 was released in Sept 2023](https://github.com/docker/compose/releases/tag/v2.22.0) and includes a new
[file watching capability](https://docs.docker.com/compose/file-watch/).

This allows you to easily sync just your source files to the container and then trigger commands when they change.
This is handy as it means you can do `npm install` or `composer install` on your host and in the container and
they can have platform-specific dependencies.

Here it is in the compose file in the [`develop` section](https://docs.docker.com/compose/compose-file/develop/):

```yaml
version: '3.3'
services:
  your-service:
    image: your-image
    volumes:
      - /path/to/local/dir:/path/in/container
    develop:
      watch:
        - path: src/
          target: /app/src/
          action: sync
```

You can also use other actions:

- `rebuild` will make Docker rebuild the container when the files change
- `sync+restart` will make Docker sync and then reboot the container

Once you have this in your compose file, just run the new command:

```bash
docker compose watch
```

and then it will keep the paths in sync, similar to if you had manually set up
[`inotifywait`](https://linux.die.net/man/1/inotifywait) or [`fswatch`](https://github.com/emcrisostomo/fswatch).
