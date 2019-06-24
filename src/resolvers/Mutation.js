const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutation = {
  async createEvent(root, args, ctx) {
    const event = await ctx.prisma.createEvent({
      title: args.title,
      description: args.description,
      image: args.image,
      price: args.price
    });
    return event;
  },
  async signup(root, args, ctx) {
    args.email = args.email.toLowerCase();
    args.password = await bcrypt.hash(args.password, 10);

    const user = await ctx.prisma.createUser({
      name: args.name,
      email: args.email,
      password: args.password
    });
    // Create jwt token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // jwt token as cookie on response
    // ctx.response.cookie('token', token, {
    //   httpOnly: true,
    //   maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    // });
    return user;
  }
};

module.exports = Mutation;
