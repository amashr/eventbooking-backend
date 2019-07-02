const Query = {
  async events(root, args, ctx) {
    const events = await ctx.prisma.events();
    return events;
  },
  async user(root, args, ctx) {
    // Check if there is current User
    if (ctx.request.userId) {
      const user = await ctx.prisma.user({
        where: { id: ctx.request.userId }
      });
      return user;
    }
    return null;
  }
};

module.exports = Query;
