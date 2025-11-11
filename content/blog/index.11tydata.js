const PAGE_SIZE = 25;

const buildListingPagination = (pagination) => {
  const hrefs = Array.isArray(pagination?.hrefs) ? pagination.hrefs : [];

  if (!hrefs.length) {
    return undefined;
  }

  const rawIndex = Number.isFinite(pagination?.pageNumber) ? pagination.pageNumber : 0;
  const totalPages = hrefs.length;

  if (totalPages <= 1) {
    return undefined;
  }

  const currentIndex = Math.min(Math.max(rawIndex, 0), totalPages - 1);
  const pages = hrefs.map((url, index) => ({
    number: index + 1,
    url,
    isCurrent: index === currentIndex,
  }));
  const previousPage = currentIndex > 0 ? pages[currentIndex - 1] : undefined;
  const nextPage = currentIndex < totalPages - 1 ? pages[currentIndex + 1] : undefined;

  return {
    currentPage: currentIndex + 1,
    totalPages,
    previous: previousPage ? { url: previousPage.url } : undefined,
    next: nextPage ? { url: nextPage.url } : undefined,
    pages,
  };
};

export default {
  pagination: {
    data: "collections.blog",
    size: PAGE_SIZE,
    alias: "posts",
    reverse: true,
  },
  permalink: (data) => {
    const pageNumber = Number.isFinite(data.pagination?.pageNumber)
      ? data.pagination.pageNumber
      : 0;
    if (pageNumber === 0) {
      return "/blog/";
    }
    return `/blog/page-${pageNumber + 1}/`;
  },
  eleventyComputed: {
    posts: (data) => {
      const pageItems = Array.isArray(data.pagination?.items) ? data.pagination.items : [];
      if (pageItems.length) {
        return pageItems;
      }
      const posts = Array.isArray(data.collections?.blog) ? data.collections.blog : [];
      return [...posts].reverse().slice(0, PAGE_SIZE);
    },
    listingPagination: (data) => buildListingPagination(data.pagination),
  },
};
