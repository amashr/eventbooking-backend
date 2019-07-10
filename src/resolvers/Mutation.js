const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');

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
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    return user;
  },
  async signin(root, args, ctx) {
    const { email, password } = args;
    const user = await ctx.prisma.user({ email });

    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid password');
    }

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    return user;
  },
  signout(root, args, ctx) {
    ctx.response.clearCookie('token');
    return { message: 'Signout!!!' };
  },
  async requestReset(root, args, ctx) {
    const { email } = args;

    const user = await ctx.prisma.user({ email });

    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }

    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    const res = await ctx.prisma.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    });
    return { message: 'Thanks' };
  },
  async resetPassword(root, args, ctx) {
    if (args.password !== args.confirmPassword) {
      throw new Error("Your passwords don't match");
    }

    const [user] = await ctx.prisma.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });
    if (!user) {
      throw new Error('This token is either invalid or expired');
    }

    const password = await bcrypt.hash(args.password, 10);
    const updatedUser = await ctx.prisma.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    return updatedUser;
  }
};

module.exports = Mutation;
