---
title: "Patching Transitive Dependency Vulnerabilities in PHP Projects with Composer"
date: 2023-11-27
tags:
  - php
type: til
---
We encountered a challenge recently with a security vulnerability in a transitive dependency.
This was where our project depended on a library (let's call it `acme-corp/foo`),  which then depended on another library (let's call it `symfony/http-client`).

So we had this structure:

```
our project
    depends on: acme-corp/foo
        depends on: symfony/http-client
```

When we get a vulnerability report (eg from Packagist, [local-php-security-checker](https://github.com/fabpot/local-php-security-checker) or running `composer audit`)
then our normal step is to do a `composer update` and upgrade to a patched version.

This is normally easy to do but in this case, acme-corp/foo was depending on a specific vulnerable version of symfony/http-client.
acme-corp/foo was crucial to the project, but it hadn't been updated to address the newly discovered vulnerability.
Faced with the need to protect the application while awaiting an official update, we explored several options.

- contribute a fix to acme-corp/foo: not fast enough in our case
- fork acme-corp/foo: an option but maintaining our own fork would be a heavy burden
- use Composer's inline alias feature: our prefered approach
- use Composer Patches

## Composerr Inline Alias Method

The [Inline Alias](https://getcomposer.org/doc/articles/aliases.md#require-inline-alias) feature in Composer was the simplest and most effective solution.

It allows for specifying a different version of a package as if it were another.
This method is particularly useful when needing to upgrade a dependency to a newer, more secure version than what is specified by another package.

Here’s how it worked for us: we needed to use a secure version `4.4.20` of `symfony/http-client` while `acme-corp/foo` was still dependent on the vulnerable version `4.4.10`.
In our `composer.json`, we specified the safe version with an alias to match the version expected by `acme-corp/foo`. It looked something like this:

```json
"require": {
    "symfony/http-client": "4.4.20 as 4.4.10"
}
```

After updating dependencies with `composer update`, Composer treated the secure symfony/http-client version 4.4.20 as if it were the vulnerable 4.4.10.
This approach allowed us to quickly mitigate the security risk without waiting for an update from acme-corp/foo.

The beauty of this solution lies in its simplicity and immediacy. It ensures that your project remains secure while minimizing disruption.
Watch out though: major version changes or significant updates could introduce compatibility issues.

Once acme-corp/foo catches up, we can then drop the symfony/http-client from our composer.json.

## Composer Patches

Another method we looked at was using [Composer Patches](https://docs.cweagans.net/composer-patches/).
This involves applying a patch to the package directly in the vendor directory, using a plugin like [`cweagans/composer-patches`](https://github.com/cweagans/composer-patches).
This approach is useful when specific changes or fixes are needed in a dependency but is harder to maintain than an inline alias.


To get composer patches working, you require the composer-patches plugin, then provide a path to your own patch in the `extras` section of `composer.json`, something like this:

```json
"require": {
    "symfony/http-client": "4.4.10",
    "cweagans/composer-patches": "^1.7"
},
"extra": {
    "patches": {
        "symfony/http-client": {
            "Security fix for HTTP Client": "path/to/http-client-security-fix.patch"
        }
    }
}

```

Although we didn’t opt for this method, it's a viable alternative for situations where an inline alias might not be appropriate and is a useful feature to be aware of.

## Conclusion

This was a reminder of how our own security is so dependent on our vendors' security practices and reinforced the importance of being able to respond quickly to security vulnerabilities, especially when dependent on third-party packages.

There's often lots of hidden features in package management tools like Composer. It's worth reading the [documentation](https://getcomposer.org/doc/) to find out what else it can do.
It turned out that the Inline Alias method was a much simpler way to mitigate the security risk, without the overhead of maintaining a fork or relying on external maintainers.
