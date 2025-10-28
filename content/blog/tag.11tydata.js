export default {
  eleventyComputed: {
    title: (data) => {
      const name = data.tagGroup?.name ?? "Tag";
      return `Dave Hulbert - Posts tagged ${name}`;
    },
    listTitle: (data) => {
      const name = data.tagGroup?.name ?? "Tag";
      return `Posts tagged “${name}”`;
    },
    listDescription: (data) => {
      const count = data.tagGroup?.count ?? 0;
      const name = data.tagGroup?.name ?? "Tag";
      if (!count) {
        return undefined;
      }
      return `${count} ${count === 1 ? "entry" : "entries"} tagged “${name}”.`;
    },
    posts: (data) => {
      const posts = Array.isArray(data.tagGroup?.items) ? data.tagGroup.items : [];
      return [...posts];
    },
    currentTagSlug: (data) => data.tagGroup?.slug,
  },
};
