---
title: "Deploying a Static Site with Basic Auth on Cloudflare Pages"
date: 2024-12-13
tags:
  - cloudflare
type: til
---
Here's how to deploy a static HTML site on Cloudflare Pages and secure it with Basic Authentication using [middleware](https://developers.cloudflare.com/pages/functions/middleware/).
This is simple to set up and means that people or bots can't access your site without a password.

Note that Basic Authentication is... _basic_. This only provides a single user/pass combo and doesn't protect against things like timing attacks.
Still, it's enough for some needs like preventing people stumbling on something.

**0\. Prerequisits**

You'll need the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated with your Cloudflare account:

```bash
npm install -g wrangler
wrangler login
```

**1\. Prepare the Project**

I'm using `auth-test` for my project here. If you're copy and pasting this then find and replace that.

If you haven't already, create a static site:

```bash
mkdir auth-test
cd auth-test
echo '<h1>Welcome to the Auth Test!</h1>' > index.html
```

Set it up as a Cloudflare Pages site:

```bash
npx wrangler pages project create auth-test
```

**2\. Add Basic Auth**

We need a `_middleware.js` file, which Cloudflare will pick up automatically. 

```bash
mkdir -p functions
touch functions/_middleware.js
```

Paste in the very basic middleware logic:

```js
export const onRequest = async (context) => {
 const { request, env } = context;
 const auth = request.headers.get('Authorization');
 const [user, pass] = [env.BASIC_USER, env.BASIC_PASS];
 if (!auth || !isValid(auth, user, pass)) {
   return new Response('Unauthorized', {
     status: 401,
     headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
   });
 }
 return await context.next();
};

const isValid = (auth, user, pass) => {
 const [scheme, encoded] = auth.split(' ');
 if (scheme !== 'Basic') return false;
 const decoded = atob(encoded).split(':');
 return decoded[0] === user && decoded[1] === pass;
};
```

Cloudflare have an [example Basic Auth Worker](https://developers.cloudflare.com/workers/examples/basic-auth/) that covers
a few more things like timing safe comparison, logging out, caching and error handling.

**3\. Add Secrets for Authentication**

Use Wrangler to set up  added the username and password as secrets:

```bash
npx wrangler pages secret put BASIC_USER
npx wrangler pages secret put BASIC_PASS
```

You'll be prompted to enter the secrets. Use a password manager to generate and save them.

**4\. Deploy the Site**

Finally, deployed the project to Cloudflare Pages:

```bash
npx wrangler pages deploy . --project-name auth-test
```

This example deploys the current directory but you can use a git repo instead.

You'll be given a URL to the site, which should have basic auth working.
