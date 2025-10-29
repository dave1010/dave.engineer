import slugify from "../../../scripts/slugify.js";

const normaliseType = (type) => {
  if (typeof type !== "string") {
    return "post";
  }

  const value = type.toLowerCase();
  if (value === "til") {
    return "til";
  }
  if (value === "external") {
    return "external";
  }

  return "post";
};

const getTypeLabel = (type) => {
  switch (normaliseType(type)) {
    case "til":
      return "Today I Learned";
    case "external":
      return "Elsewhere";
    default:
      return "Blog Post";
  }
};

const getTopicTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.filter((tag) => tag !== "blog");
  }

  if (typeof tags === "string") {
    return tags === "blog" ? [] : [tags];
  }

  return [];
};

export default {
  tags: ["blog"],
  eleventyComputed: {
    layout: (data) => (normaliseType(data.type) === "external" ? "external-post.njk" : "post.njk"),
    permalink: (data) => {
      const slug = (data.page.fileSlug || "")
        .replace(/^\d{4}-\d{2}-\d{2}-/, "")
        .replace(/\/+$/, "");
      const date =
        data.page?.date instanceof Date
          ? data.page.date
          : data.page?.date
            ? new Date(data.page.date)
            : undefined;
      const year = date?.getUTCFullYear();
      const month = date ? String(date.getUTCMonth() + 1).padStart(2, "0") : undefined;
      const type = normaliseType(data.type);

      if (type === "external") {
        if (year) {
          return `/blog/external/${year}/${slug || data.page.fileSlug}/`;
        }
        return `/blog/external/${slug || data.page.fileSlug}/`;
      }

      if (year && month) {
        return `/blog/${year}/${month}/${slug || data.page.fileSlug}/`;
      }

      return `/blog/${slug || data.page.fileSlug}/`;
    },
    isoDate: (data) => {
      const date =
        data.page?.date instanceof Date
          ? data.page.date
          : data.page?.date
            ? new Date(data.page.date)
            : undefined;
      return date?.toISOString().split("T")[0];
    },
    displayDate: (data) => {
      const date =
        data.page?.date instanceof Date
          ? data.page.date
          : data.page?.date
            ? new Date(data.page.date)
            : undefined;
      return date?.toLocaleDateString("en-GB", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    },
    type: (data) => normaliseType(data.type),
    typeLabel: (data) => getTypeLabel(data.type),
    topicTags: (data) => getTopicTags(data.tags),
    topicTagLinks: (data) => {
      const tags = getTopicTags(data.tags);
      return tags.map((tag) => {
        const slug = slugify(tag);
        return {
          name: tag,
          slug,
          url: `/blog/tag/${slug}/`,
        };
      });
    },
  },
};
