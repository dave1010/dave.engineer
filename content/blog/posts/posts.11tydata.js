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

const getDate = (data) => {
  const value =
    data.page?.date instanceof Date
      ? data.page.date
      : data.page?.date
        ? new Date(data.page.date)
        : undefined;

  if (!value || Number.isNaN(value.getTime?.())) {
    throw new Error(`Blog posts must have a valid date: ${data.page?.inputPath}`);
  }

  return value;
};

export default {
  tags: ["blog"],
  eleventyComputed: {
    layout: (data) => (normaliseType(data.type) === "external" ? "external-post.njk" : "post.njk"),
    permalink: (data) => {
      const slug = (data.page.fileSlug || "")
        .replace(/^\d{4}-\d{2}-\d{2}-/, "")
        .replace(/\/+$/, "");
      const date = getDate(data);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");

      return `/blog/${year}/${month}/${slug || data.page.fileSlug}/`;
    },
    isoDate: (data) => getDate(data).toISOString().split("T")[0],
    displayDate: (data) =>
      getDate(data).toLocaleDateString("en-GB", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    year: (data) => String(getDate(data).getUTCFullYear()),
    month: (data) => String(getDate(data).getUTCMonth() + 1).padStart(2, "0"),
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
