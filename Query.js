const Query = {
  async events(root, args, ctx) {
    const events = await ctx.prisma.events();
    return events;
  }
};

module.exports = Query;
