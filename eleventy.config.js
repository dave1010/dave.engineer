import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import slugify from "./scripts/slugify.js";

const typeMetadata = {
  post: {
    type: "post",
    label: "Blog Posts",
    description: "Long-form writing, essays, and updates.",
    permalink: "/blog/type/post/",
  },
  til: {
    type: "til",
    label: "Today I Learned",
    description: "Short notes capturing day-to-day learnings.",
    permalink: "/blog/type/til/",
  },
};

const normaliseType = (type) => {
  if (typeof type !== "string") {
    return "post";
  }

  const value = type.toLowerCase();
  return value === "til" ? "til" : "post";
};

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPassthroughCopy({ public: "." });

  eleventyConfig.addCollection("blogPostsByType", (collectionApi) => {
    const posts = collectionApi.getFilteredByTag("blog");
    const groups = new Map();

    for (const metadata of Object.values(typeMetadata)) {
      groups.set(metadata.type, { ...metadata, items: [] });
    }

    for (const post of posts) {
      const type = normaliseType(post.data.type);
      if (!groups.has(type)) {
        groups.set(type, { ...typeMetadata.post, type, items: [] });
      }
      groups.get(type).items.push(post);
    }

    for (const group of groups.values()) {
      group.items.sort((a, b) => b.date - a.date);
      group.count = group.items.length;
    }

    return Array.from(groups.values());
  });

  eleventyConfig.addCollection("blogTags", (collectionApi) => {
    const posts = collectionApi.getFilteredByTag("blog");
    const tagMap = new Map();

    for (const post of posts) {
      const tags = Array.isArray(post.data.topicTags) ? post.data.topicTags : [];
      for (const tag of tags) {
        const slug = slugify(tag);
        if (!tagMap.has(slug)) {
          tagMap.set(slug, {
            name: tag,
            slug,
            items: [],
            permalink: `/blog/tag/${slug}/`,
          });
        }
        tagMap.get(slug).items.push(post);
      }
    }

    const tags = Array.from(tagMap.values()).map((tag) => ({
      ...tag,
      items: tag.items.sort((a, b) => b.date - a.date),
    }));

    for (const tag of tags) {
      tag.count = tag.items.length;
    }

    return tags.sort((a, b) => a.name.localeCompare(b.name));
  });

  eleventyConfig.addCollection("workItems", (collectionApi) => {
    const items = collectionApi.getFilteredByTag("work");

    items.sort((a, b) => {
      const orderA = Number.isFinite(a.data.order) ? a.data.order : Number.MAX_SAFE_INTEGER;
      const orderB = Number.isFinite(b.data.order) ? b.data.order : Number.MAX_SAFE_INTEGER;

      if (orderA === orderB) {
        return a.data.title.localeCompare(b.data.title);
      }

      return orderA - orderB;
    });

    return items;
  });

  eleventyConfig.addFilter("slugify", slugify);

  return {
    dir: {
      input: "content",
      layouts: "../src/layouts",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md"],
  };
}
