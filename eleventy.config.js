export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ public: "." });

  eleventyConfig.addFilter("readableDate", (dateObj, locale = "en-GB", options = { month: "long", day: "numeric", year: "numeric" }) => {
    if (!(dateObj instanceof Date)) {
      dateObj = new Date(dateObj);
    }
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  });

  eleventyConfig.addFilter("isoDate", (dateObj) => {
    if (!(dateObj instanceof Date)) {
      dateObj = new Date(dateObj);
    }
    return dateObj.toISOString().split("T")[0];
  });

  eleventyConfig.addFilter("split", (value, delimiter = " ") => {
    if (!value && value !== "") {
      return [];
    }
    if (Array.isArray(value)) {
      return value;
    }
    return String(value)
      .split(delimiter)
      .map((item) => item.trim())
      .filter(Boolean);
  });

  return {
    dir: {
      input: "content",
      layouts: "../src/layouts"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "markdown"]
  };
}
