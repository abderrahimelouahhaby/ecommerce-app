/** Turns a "page/limit" pair into the skip/take values Prisma needs. */
export function paginate(page: number, limit: number) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));

  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
}
