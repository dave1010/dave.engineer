const PAGE_SIZE = 25;

const paginateTypeGroups = (groups) => {
  if (!Array.isArray(groups)) {
    return [];
  }

  return groups.flatMap((group) => {
    const items = Array.isArray(group?.items) ? group.items : [];
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const basePermalink = group?.permalink ?? "/blog/";

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
    data: "collections.blogPostsByType",
    size: 1,
    alias: "typePage",
    before: paginateTypeGroups,
  },
  permalink: (data) => data.typePage?.pageUrl ?? "/blog/",
  eleventyComputed: {
    title: (data) => {
      const label = data.typePage?.label ?? "Blog";
      return `Dave Hulbert - ${label}`;
    },
    listTitle: (data) => data.typePage?.label ?? "Blog",
    listDescription: (data) => {
      const description = data.typePage?.description;
      const paginationInfo = data.typePage?.listingPagination;
      if (paginationInfo?.totalPages > 1) {
        const pageDetails = `Page ${paginationInfo.currentPage} of ${paginationInfo.totalPages}.`;
        return description ? `${description} ${pageDetails}` : pageDetails;
      }
      return description;
    },
    posts: (data) => {
      const posts = Array.isArray(data.typePage?.items) ? data.typePage.items : [];
      return [...posts];
    },
    currentType: (data) => data.typePage?.type,
    listingPagination: (data) => data.typePage?.listingPagination,
  },
};
