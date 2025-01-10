export const formatDate = (timestamp: number) => {
  // Output: "today", "yesterday", "3 days ago", "Apr 15", "Apr 15, 2023"
  const dateObj = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.round((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};