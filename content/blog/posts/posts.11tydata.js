export default {
  layout: "post.njk",
  tags: ["blog"],
  eleventyComputed: {
    permalink: (data) => {
      const slug = (data.page.fileSlug || "")
        .replace(/^\d{4}-\d{2}-\d{2}-/, "")
        .replace(/\/+$/, "");
      return `/blog/${slug || data.page.fileSlug}/`;
    },
    isoDate: (data) => {
      const date = data.page?.date instanceof Date
        ? data.page.date
        : data.page?.date
          ? new Date(data.page.date)
          : undefined;
      return date?.toISOString().split("T")[0];
    },
    displayDate: (data) => {
      const date = data.page?.date instanceof Date
        ? data.page.date
        : data.page?.date
          ? new Date(data.page.date)
          : undefined;
      return date?.toLocaleDateString("en-GB", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    },
    topicTags: (data) => {
      const tags = Array.isArray(data.tags)
        ? data.tags
        : typeof data.tags === "string"
          ? [data.tags]
          : [];
      return tags.filter((tag) => tag !== "blog");
    }
  }
};
