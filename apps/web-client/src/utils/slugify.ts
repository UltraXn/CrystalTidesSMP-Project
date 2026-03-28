export const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')       // Remove special chars but keep spaces/hyphens
        .replace(/[\s_-]+/g, '_')       // Replace spaces, underscores or dashes with single _
        .replace(/^_+|_+$/g, '');       // Remove leading/trailing underscores
};
