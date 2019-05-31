const Mutation = {
  async createEvent(root, args, ctx) {
    const event = await ctx.prisma.createEvent({
      title: args.title,
      description: args.description,
      image: args.image,
      price: args.price
    });
    return event;
  }
};

module.exports = Mutation;
