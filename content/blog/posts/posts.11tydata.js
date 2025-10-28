export default {
  layout: "post.njk",
  tags: ["blog"],
  eleventyComputed: {
    permalink: (data) => {
      const slug = (data.page.fileSlug || "")
        .replace(/^\d{4}-\d{2}-\d{2}-/, "")
        .replace(/\/+$/, "");
      return `/blog/${slug || data.page.fileSlug}/`;
    }
  }
};
