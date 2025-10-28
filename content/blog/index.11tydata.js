export default {
  eleventyComputed: {
    posts: (data) => {
      const posts = Array.isArray(data.collections?.blog) ? data.collections.blog : [];
      return [...posts].reverse();
    },
  },
};
