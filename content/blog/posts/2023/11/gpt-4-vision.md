---
title: "Exploring OpenAI's GPT-4 Vision API and a handy shell script to query it"
date: 2023-11-22
tags:
  - openai
type: til
---
OpenAI recently made their GPT-4-backed vision capabilities available to API developers. Here's [OpenAI's Vision API Guide](https://platform.openai.com/docs/guides/vision).

After seeing this [demo on Twitter](https://twitter.com/charliebholtz/status/1724815159590293764) and examining the code [here](https://github.com/cbh123/narrator/blob/main/narrator.py), I decided to experiment with it myself.

It's incredibly simple to use...

The OpenAI docs provide an example with the following content:

```json
{
  "type": "text",
  "text": "What’s in this image?"
},
{
  "type": "image_url",
  "image_url": {
    "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
  }
}
```

This is encapsulated within their standard `messages` object, used across all their chat APIs.

To use this, you need to select the `gpt-4-vision-preview` model, which is available if you have GPT-4 API access.

## `gptv` shell script

I created a simple shell script that calls the API with a user-provided image URL and query.

First, you'll need an API key set in your shell environment. [Get your API key here](https://platform.openai.com/api-keys).

```bash
export OPENAI_API_KEY="your-secret-key"
```

Then, **[download the gptv script from this Gist](https://gist.github.com/dave1010/64332d1ede5d7e11e45d93570d973bde)**.

```bash
curl https://gist.githubusercontent.com/dave1010/64332d1ede5d7e11e45d93570d973bde/raw/789bd70a8f9b02913e61e7cd0b706481d8c9ee19/gptv -o gptv && chmod +x gptv
```

You'll also need `jq` installed (`sudo apt-get install jq` on Ubuntu or `brew install jq` on macOS).

Run it by providing a prompt and a public URL to an image:

```bash
gptv 'give me some basic html and css for this web page menu' 'https://i.imgur.com/VDirZDf.png'
```

The script formats the input, calls OpenAI's API, and then displays the relevant output. It takes about 10 seconds at the moment.

Here's the rendered HTML and CSS that it generated:

![Generated Code Image](https://i.imgur.com/MJIadjB.png)

## Future improvements

- Support for uploading images directly.
- Resize images and use the `detail` option for better analysis.

## More examples

`gptv 'explain this xkcd' https://imgs.xkcd.com/comics/rebuttals.png`

![xkcd](https://imgs.xkcd.com/comics/rebuttals.png)

    This comic is from the webcomic "xkcd" by Randall Munroe and is typically known for its satirical take on science, technology, mathematics, and relationships.
    
    The comic is addressing a situation that often arises in scientific and academic fields. It starts by discussing how it has become common for there to be a backlash against the prevailing consensus in a field. This dissenting view can sometimes lead researchers to ignore new evidence that does not fit with their preconceived ideas or the current contrarian viewpoint (which has itself become a kind of new 'conventional wisdom').
    
    The punchline of the comic, "In a field that’s been around for a while, it can be hard to figure out how many levels of rebuttal deep you are," humorously points out that in longstanding fields of study, the debates and rebuttals can become so layered and complex that it's difficult to keep track of the current state of accepted wisdom. The idea is that there's a rebuttal to the original theory, then there's a rebuttal to that rebuttal, and potentially many more layers as new evidence comes to light and new interpretations are made, creating a confusing intellectual landscape. This reflects the complexity of scientific discourse where multiple generations of theories and counter-theories can coexist.
    
    The image shows a chart with arrows pointing back and forth between "evidence" and a figure representing a researcher or academic, indicating the back-and-forth nature of arguments and counterarguments in a well-established field.

`gptv 'which 1 should i buy?' https://i.imgur.com/ApuSMfv.png`

    In terms of value per 100 grams, the 910g bottle at full price offers the best deal at 43.8p per 100g, totalling £3.99 for the entire bottle.
    ...
