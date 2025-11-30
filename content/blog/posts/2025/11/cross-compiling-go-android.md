---
title: "Cross-compiling Go for Android (Termux) With Working DNS"
date: 2025-11-30
tags:
  - golang
  - coding
  - android
  - coding-agents
---

Go makes cross-compilation easy. Set `GOOS` and `GOARCH`, run `go build`, then you get a binary that Just Works. This means you can use Linux to build your project and get Windows, macOS and Android executables, across different CPU architectures too.

Today I learned that this completely breaks down the moment you try to run a Go binary on **Android** (specifically **Termux**).

**tl:dr;** use **CGO** with the **Android NDK**. Otherwise you end up with broken DNS and misleading errors.

This post walks through the whole lot, starting with the original failure, through the debugging steps, to the final fully-working Github Actions CI configuration. If you’re a Go beginner who’s never touched CGO or Android cross-compilation, this should hopefully explain things.

Full working CI config here:  
[https://github.com/dave1010/jorin/blob/main/.github/workflows/ci.yml](https://github.com/dave1010/jorin/blob/main/.github/workflows/ci.yml)

* * *

## Background

The background to this is that I'm making (yet another) coding agent, called _Jorin_. Most of the coding is being done on my phone in Termux, by the agent itself. The build chain works fine when completely on my phone: running tests, building and running.

I wanted to set up a Github Action workflow to do the build and also cross compile to other platforms and architectures.

## The symptom: DNS fails only on Termux

I got a matrix workflow set up, so Github would make a number of builds when I push a tag and save them as assets in a release.

The build ran fine and the executable even ran on my phone, outputting version and help information. The issue came when I tried to make an HTTP request:

```
ERR: Post "https://api.openai.com/v1/chat/completions":
 dial tcp: lookup api.openai.com on [::1]:53: read udp [::1]:60100->[::1]:53: connection refused
```

This is a DNS lookup error:

*   The Go runtime is trying to resolve `api.openai.com`
*   It’s sending the DNS query to `::1:53` (IPv6 localhost)
*   Nothing is listening on that port → connection refused

The obvious question is:

> Why does Go think my DNS server is at `::1` on Android?

Especially when my local Termux build worked perfectly, but the CI-built binary did not.

## First clue: Go’s DNS resolver

Go has _two_ DNS resolvers:

### 1\. **netgo** — the pure Go DNS resolver

Used when:

*   You compile with `CGO_ENABLED=0`, or
*   You build statically

It reads `/etc/resolv.conf` and makes raw UDP DNS queries.

### 2\. **cgo/libc** — the system resolver

Used when:

*   `CGO_ENABLED=1`, and
*   The OS has libc resolver support

This uses the OS’s own DNS logic.

Android’s DNS is _not_ based on `/etc/resolv.conf` — it uses system APIs. Termux **does not have a writable or meaningful `/etc/resolv.conf`**, so `netgo` has no config and falls back to “best guess”, often `::1`.

So the difference between “works locally” and “fails from CI” was simply:

*   **Local build:** `GOOS=android`, native Termux → `CGO_ENABLED=1` → Android system resolver
*   **CI build:** `GOOS=android`, but `CGO_ENABLED=0` → pure Go resolver → `/etc/resolv.conf` missing → fallback to `::1` → failure

That alone explains the problem. But fixing it requires an actual Android toolchain.

## Why you need to use CGO for Android

Termux gives you a normal `go` compiler, but when you cross-compile on Linux you are building a binary for an OS with:

*   no glibc
*   no standard UNIX headers
*   no `/etc/resolv.conf`
*   no `/usr/include`

So if you tell Go “compile for `GOOS=android`, `CGO_ENABLED=1`”, it needs:

*   a C compiler that targets Android
*   a sysroot with Android headers
*   libc stubs
*   Bionic’s include files

This means:

> **To build a real Android binary, you need the Android NDK.**

This is true regardless of language.

## Debugging Go’s DNS behaviour

Along the way, ChatGPT pointed out a handy Go feature: the `GODEBUG=netdns=` flag.

On the failing binary:

```
GODEBUG=netdns=go+1 ./jorin
```

Output:

```
go package net: built with netgo build tag; using Go's DNS resolver
lookup api.openai.com on [::1]:53
```

This confirmed:

*   **It's using netgo** (pure Go resolver)
*   **It is querying `::1`** → bad fallback

On the working binary:

```
GODEBUG=netdns=cgo+1 ./jorin
```

Result:

```
go package net: using cgo DNS resolver
```

Exactly what I needed.

## The fix: proper Android cross-compilation in CI

### Requirements

*   Install the Android NDK in Linux (Github Actions)
*   Use the NDK's toolchain clang wrapper:
    *   `aarch64-linux-android21-clang`
*   Set `CGO_ENABLED=1` for Android builds only
*   Point `CC` at the NDK compiler
*   Let Go use CGO → libc resolver → working DNS on Android

### Why the NDK clang works

The NDK toolchain clang...

*   selects the correct sysroot
*   includes Android’s headers
*   uses Android’s Bionic libc
*   sets correct ABI, API level, and linker flags

There may be ways to do this without the NDK but that sounds painful.

## The complete working CI snippet

(From the linked repo)

```yaml
- name: Setup Android NDK
  if: matrix.goos == 'android'
  id: setup-ndk
  uses: nttld/setup-ndk@v1
  with:
    ndk-version: r26d
    add-to-path: false

- name: Build
  env:
    GOOS: ${{ matrix.goos }}
    GOARCH: ${{ matrix.goarch }}
    CGO_ENABLED: ${{ matrix.cgo }}
    ANDROID_API: ${{ matrix.api }}
    ANDROID_NDK_HOME: ${{ steps.setup-ndk.outputs.ndk-path }}
  run: |
    if [ "$GOOS" = "android" ]; then
      TOOLCHAIN_BIN="$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin"
      export CC="$TOOLCHAIN_BIN/aarch64-linux-android${ANDROID_API}-clang"
      echo "Using Android NDK CC=$CC"
    fi

    go build -o "dist/jorin-${GOOS}-${GOARCH}" ./cmd/jorin
```

This produces actual Android binaries, with working DNS.

## Verifying the fix on Termux

Download the artifact:

```
chmod +x jorin-android-arm64
GODEBUG=netdns=cgo+1 ./jorin-android-arm64
```

You should see:

```
go package net: using cgo DNS resolver
```

## What I learned

(And seems obvious in hindsight.)

1.  **Go cross-compilation “just works”—until you need CGO.**  
    When you need CGO, you need an actual toolchain for the target OS.
    
2.  **Termux is not Linux.**  
    It’s Android with a Linux-like userland. `/etc/resolv.conf` is meaningless. A Debian `proot` might have been a better option.
    
3.  **Go’s pure DNS resolver cannot work on Android.**  
    It depends on POSIX filesystem layout; Android doesn’t provide it.
    
4.  **The Android NDK is needed for real Android targets.**  
    Nothing else gives you Bionic headers, the correct sysroot, and proper API-level selection.
    
5.  **Use `GODEBUG=netdns=go+1` to debug DNS.**  
    It instantly shows whether you're using netgo or cgo.

## Final thoughts

If you’re distributing Go binaries and expect them to run on Android (Termux or otherwise), save yourself the pain:

> **If you want DNS, HTTPS, or anything network-y to work on Android, build with CGO and the NDK.**

Hopefully the next person who hits `[::1]:53` will find this in time.
