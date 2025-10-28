export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ public: "." });

  return {
    dir: {
      input: "content",
      layouts: "../src/layouts"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md"]
  };
}
