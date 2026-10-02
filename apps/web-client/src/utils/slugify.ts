export const slugify = (text: string): string => {
  const cleaned = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special chars but keep spaces/hyphens
    .replace(/[\s_-]+/g, "_"); // Replace spaces, underscores or dashes with single _

  let start = 0;
  let end = cleaned.length;
  while (start < end && cleaned[start] === "_") start++;
  while (end > start && cleaned[end - 1] === "_") end--;
  return cleaned.slice(start, end);
};
