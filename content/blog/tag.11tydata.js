const PAGE_SIZE = 25;

const paginateTagGroups = (groups) => {
  if (!Array.isArray(groups)) {
    return [];
  }

  return groups.flatMap((group) => {
    const items = Array.isArray(group?.items) ? group.items : [];
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const basePermalink = group?.permalink ?? (group?.slug ? `/blog/tag/${group.slug}/` : "/blog/tag/");

    return Array.from({ length: totalPages }, (_, index) => {
      const pageUrl = index === 0 ? basePermalink : `${basePermalink}page-${index + 1}/`;
      const pages = Array.from({ length: totalPages }, (_, pageIndex) => {
        const number = pageIndex + 1;
        const url = pageIndex === 0 ? basePermalink : `${basePermalink}page-${pageIndex + 1}/`;
        return {
          number,
          url,
          isCurrent: pageIndex === index,
        };
      });

      return {
        ...group,
        items: items.slice(index * PAGE_SIZE, (index + 1) * PAGE_SIZE),
        pageNumber: index,
        pageUrl,
        listingPagination: {
          currentPage: index + 1,
          totalPages,
          previous: index > 0 ? { url: pages[index - 1].url } : undefined,
          next: index < totalPages - 1 ? { url: pages[index + 1].url } : undefined,
          pages,
        },
      };
    });
  });
};

export default {
  pagination: {
    data: "collections.blogTags",
    size: 1,
    alias: "tagPage",
    before: paginateTagGroups,
  },
  permalink: (data) => data.tagPage?.pageUrl ?? "/blog/tag/",
  eleventyComputed: {
    title: (data) => {
      const name = data.tagPage?.name ?? "Tag";
      return `Dave Hulbert - Posts tagged ${name}`;
    },
    listTitle: (data) => {
      const name = data.tagPage?.name ?? "Tag";
      return `Posts tagged “${name}”`;
    },
    listDescription: (data) => {
      const count = data.tagPage?.count ?? 0;
      const name = data.tagPage?.name ?? "Tag";
      if (!count) {
        return undefined;
      }
      const baseDescription = `${count} ${count === 1 ? "entry" : "entries"} tagged “${name}”.`;
      const paginationInfo = data.tagPage?.listingPagination;
      if (paginationInfo?.totalPages > 1) {
        return `${baseDescription} Page ${paginationInfo.currentPage} of ${paginationInfo.totalPages}.`;
      }
      return baseDescription;
    },
    posts: (data) => {
      const posts = Array.isArray(data.tagPage?.items) ? data.tagPage.items : [];
      return [...posts];
    },
    currentTagSlug: (data) => data.tagPage?.slug,
    listingPagination: (data) => data.tagPage?.listingPagination,
  },
};
