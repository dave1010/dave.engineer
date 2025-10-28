export default {
  eleventyComputed: {
    title: (data) => {
      const label = data.typeGroup?.label ?? "Blog";
      return `Dave Hulbert - ${label}`;
    },
    listTitle: (data) => data.typeGroup?.label ?? "Blog",
    listDescription: (data) => data.typeGroup?.description,
    posts: (data) => {
      const posts = Array.isArray(data.typeGroup?.items) ? data.typeGroup.items : [];
      return [...posts];
    },
    currentType: (data) => data.typeGroup?.type,
  },
};
