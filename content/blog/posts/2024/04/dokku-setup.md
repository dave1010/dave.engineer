---
title: "Dokku Setup"
date: 2024-04-16
tags:
  - docker
type: til
---
This is an overview of how to get a server set up running Dokku, with wildcard domains.

Out the box Dokku image from DigitalOcean: https://marketplace.digitalocean.com/apps/dokku

## Locally

Git setup:

```bash
DOKKU_HOST=ssh.example.com
APP_NAME=amazing-app

git remote add dokku dokku@$DOKKU_HOST:$APP_NAME
```

## Project structure

### PHP

Symfony defaults to `./public`.

```bash
composer require symfony/apache-pack
echo 'web: heroku-php-apache2 public/' > Procfile
```

## Deployment

```bash
git push dokku main
```

## Setting up a Dokku host

### Prerequesits

1. Install Dokku on a server. Eg [DigitalOcean 1-click](https://marketplace.digitalocean.com/apps/dokku).
2. Add a wildcard A record domain. If you're using Cloudflare then add proxying.

```bash
ssh root@$DOKKU_HOST
YOUR_NAME=dave
DOMAIN=example.com

# add your ssh key
dokku ssh-keys:add admin_$YOUR_NAME

# enable wildcard subdomains on $DOMAIN
dokku domains:set-global $DOMAIN

# postgres support
dokku plugin:install https://github.com/dokku/dokku-postgres.git

```

### Creating and managing a new app

```bash
APP_NAME=amazing-app

dokku apps:create $APP_NAME

# shouldn't be needed
dokku domains:add $APP_NAME $APP_NAME.$DOMAIN

# DB
dokku postgres:create db_$APP_NAME
dokku postgres:link db_$APP_NAME $APP_NAME
# check env is set
dokku config:get $APP_NAME DATABASE_URL

# set env vars
dokku config:set $APP_NAME APP_ENV=prod
```

Once deployed, you may need to set up the app

```bash
dokku enter $APP_NAME doctrine:schema:create
```

## Debugging

```bash
# interactive shell
dokku enter $APP_NAME

# tail logs
dokku logs -t $APP_NAME
```
