---
title: "Distributing Python Packages on PyPI"
date: 2023-11-29
tags:
  - python
type: til
---
I ran through [Packaging Python Projects](https://packaging.python.org/en/latest/tutorials/packaging-projects/)
today to get [Clipea](https://github.com/dave1010/clipea) installable with `pip install clipea-cli`.

(I originally wrote Clipea in PHP to get it working quickly but someone kindly [ported it](https://github.com/dave1010/clipea/pull/16) to Python.)

`pip` packages are hosted by the [Python Package Index (PyPI)](https://pypi.org/).

Here's the overview of the steps I took.

## Building

First you need to use a supported package format.
There's a few ways to do this but `setuptools` and `setup.py` is really simple. Here's Clipea's:

```python
"""Setup file for clipea
"""
from setuptools import setup, find_packages

with open('README.md', encoding='utf-8') as f:
    long_description = f.read()

setup(
    name="clipea-cli",
    version="0.1.0",
    description=" 📎🟢 Like Clippy but for the CLI. A blazing fast AI helper for your command line ",
    url="https://github.com/dave1010/clipea/",
    long_description=long_description,
    long_description_content_type='text/markdown',
    author="Dave Hulbert",
    author_email="dave1010@gmail.com",
    keywords='cli, ai, assistant, automation',
    license="MIT",
    packages=find_packages(),
    install_requires=["llm"],
    python_requires=">=3.10",
    package_data={"clipea": ["*.txt", "clipea.zsh"]},
    entry_points={"console_scripts": ["clipea = clipea.__main__:clipea_main"]},
)
```

You can see I had to use the name "clipea-cli" as "clipea" was taken (actually clip-ea was taken but PyPI normalises names when comparing).

You can then install it in development mode. This allows you to edit the package but also does all the normal setup like adding it to your path:

```bash
pip install -e .
```

## Packaging

If you're happy with `setup.py` then you can start packaging it:

```bash
python3 setup.py sdist
```

This will result in a file like `dist/clipea-0.1.0.tar.gz`. This is what's going to be hosted on PyPI.

### Checking your package with a Virtual Environment

Ensure your the packge installs by creating a new Python virtual environment with `venv`.

```bash
mkdir clipea-test
cd clipea-test
python3 -m venv .
source bin/activate
```

Then you can install your package with pip:

```bash
pip install path/to/dist/clipea-0.1.0.tar.gz
```

Ideally test it in different environments.

## Set up PyPI

There's 2 separate versions of PyPI: the [test one](https://test.pypi.org/) and the [live one](https://pypi.org/).
Sign up to them both (they have separate logins and auth). There's a few steps to set up MFA and confirm
your email address.

Set up an API token in [your PyPI account](https://pypi.org/manage/account/#api-tokens) and save the secret key.

## Upload to test.pypi.org

Use `twine` to upload packages:

```bash
python3 -m twine upload --repository testpypi dist/clipea-0.1.0.tar.gz
```

Use `__token__` as the username and your API key as the password.
Note that as soon as you upload a version of a package, you can't replace it, you have to bump the version number.

## Test installing from test.pypi.org

OK, assuming you successfully uploaded your package, you should now be able to install it with `pip`.
Delete and remake your virtual environment, just to be sure.

Then install with something like this:

```bash
python3 -m pip install --index-url https://test.pypi.org/simple/ --no-deps --no-build-isolation clipea
```

Note that test.pypi.org won't have your dependencies (`llm` in my case), so you may need to install them
normally with pip yourself first. Double check they're in your `setup.py` too.

You may also need `wheel` and `setuptools`:

```bash
python3 -m pip install wheel setuptools
```

## Check the test PyPI page and final checks

At this point PyPI should will made a page for your package. You can see
[Clipea's test package page here](https://test.pypi.org/project/clipea/).
It took a couple of attempts to get the info right on the page.

Also check things like version numbers in `setup.py`, Git tags, README.md, licence, security, etc.

## Upload to pypi.org

Make sure the package is well tested, as this is the point of no return:

```bash
python3 -m twine upload dist/clipea-0.1.0.tar.gz
```

(Remember to use your API key for pypi.org, note test.pypi.org!)

## Installing

If everything above worked then you should now be able to install your package with:

```bash
pip install clipea-cli
```

## Automating updates

You'll need to go through the build, test, distribute steps manually whenever you make a change.
Use Github Actions to automate this. (One for another day)
