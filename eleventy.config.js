import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginRss from "@11ty/eleventy-plugin-rss";
import slugify from "./src/slugify.js";

const DEFAULT_TYPE = "post";

const typeMetadata = new Map(
  Object.entries({
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
    external: {
      type: "external",
      label: "Elsewhere",
      description: "Writing published on other platforms like Medium.",
      permalink: "/blog/type/external/",
    },
  }),
);

const normaliseType = (type) => {
  if (typeof type !== "string") {
    return DEFAULT_TYPE;
  }

  const normalised = type.toLowerCase();
  return typeMetadata.has(normalised) ? normalised : DEFAULT_TYPE;
};

const ensureTypeMetadata = (type) =>
  typeMetadata.get(type) ?? typeMetadata.get(DEFAULT_TYPE);

const getTypeGroups = () => {
  const groups = new Map();
  for (const metadata of typeMetadata.values()) {
    groups.set(metadata.type, { ...metadata, items: [] });
  }
  return groups;
};

const sortPostsByDate = (items) =>
  [...items].sort((a, b) => b.date - a.date);

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPassthroughCopy({ public: "." });

  eleventyConfig.addCollection("blogPostsByType", (collectionApi) => {
    const groups = getTypeGroups();

    for (const post of collectionApi.getFilteredByTag("blog")) {
      const type = normaliseType(post.data.type);
      const group = groups.get(type) ?? {
        // Unknown types reuse the "post" metadata so the build stays resilient while we surface the new type label.
        ...ensureTypeMetadata(type),
        type,
        items: [],
      };
      group.items.push(post);
      groups.set(type, group);
    }

    return Array.from(groups.values()).map((group) => ({
      ...group,
      items: sortPostsByDate(group.items),
      count: group.items.length,
    }));
  });

  eleventyConfig.addCollection("blogTags", (collectionApi) => {
    const tagMap = new Map();

    for (const post of collectionApi.getFilteredByTag("blog")) {
      const tags = Array.isArray(post.data.topicTags) ? post.data.topicTags : [];
      for (const tag of tags) {
        const name = String(tag || "").toLowerCase();
        const slug = slugify(name);
        if (!tagMap.has(slug)) {
          tagMap.set(slug, {
            name,
            slug,
            items: [],
            permalink: `/blog/tag/${slug}/`,
          });
        }
        tagMap.get(slug).items.push(post);
      }
    }

    return Array.from(tagMap.values())
      .map((tag) => ({
        ...tag,
        items: sortPostsByDate(tag.items),
        count: tag.items.length,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
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

  eleventyConfig.addCollection("blogFeed", (collectionApi) =>
    sortPostsByDate(collectionApi.getFilteredByTag("blog")).slice(0, 20),
  );

  eleventyConfig.addFilter("take", (items, count = 1) => {
    const limit = Number.isFinite(count) ? Math.max(0, count) : 0;
    if (!Array.isArray(items) || limit === 0) {
      return [];
    }

    return items.slice(0, limit);
  });

  eleventyConfig.addFilter("slugify", slugify);

  return {
    dir: {
      input: "content",
      includes: "../src/layouts",
      layouts: "../src/layouts",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md"],
  };
}
