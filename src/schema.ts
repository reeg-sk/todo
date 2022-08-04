import {
  intArg,
  makeSchema,
  nonNull,
  objectType,
  stringArg,
  inputObjectType,
  arg,
  asNexusMethod,
  enumType,
} from "nexus";
import { DateTimeResolver } from "graphql-scalars";
import { Context } from "./context";

export const DateTime = asNexusMethod(
  DateTimeResolver,
  "date"
);

const Query = objectType({
  name: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("allUsers", {
      type: "User",
      resolve: (_parent, _args, context: Context) => {
        return context.prisma.user.findMany();
      },
    });

    t.nullable.field("workspaceById", {
      type: "Workspace",
      args: {
        id: nonNull(intArg()),
      },
      resolve: (_parent, args, context: Context) => {
        return context.prisma.workspace.findUnique({
          where: { id: args.id || undefined },
        });
      },
    });
  },
});

const Mutation = objectType({
  name: "Mutation",
  definition(t) {
    t.nonNull.field("signupUser", {
      type: "User",
      args: {
        data: nonNull(
          arg({
            type: "UserCreateInput",
          })
        ),
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.user.create({
          data: {
            name: args.data.name,
            email: args.data.email,
            password: args.data.password,
            owned: {
              create: {
                title: "Todos",
                color: "#000",
              },
            },
          },
        });
      },
    });

    t.field("createWorkspace", {
      type: "Workspace",
      args: {
        data: nonNull(
          arg({
            type: "WorkspaceCreateInput",
          })
        ),
        authorEmail: nonNull(stringArg()),
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.workspace.create({
          data: {
            title: args.data.title,
            color: args.data.color,
            owner: {
              connect: { email: args.authorEmail },
            },
          },
        });
      },
    });

    t.field("deleteWorkspace", {
      type: "Workspace",
      args: {
        id: nonNull(intArg()),
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.workspace.delete({
          where: { id: args.id },
        });
      },
    });
  },
});

const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.int("id");
    t.string("name");
    t.nonNull.string("email");
    t.string("password");
    t.boolean("verified");
    t.nonNull.list.nonNull.field("owned", {
      type: "Workspace",
      resolve: (parent, _, context: Context) => {
        return context.prisma.user
          .findUnique({
            where: { id: parent.id || undefined },
          })
          .owned();
      },
    });
    t.list.field("shared", {
      type: "Workspace",
      resolve: (parent, _, context: Context) => {
        return context.prisma.user
          .findUnique({
            where: { id: parent.id || undefined },
          })
          .shared();
      },
    });
  },
});

const Item = objectType({
  name: "Item",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.string("name");
    t.nonNull.field("type", {
      type: "TypeEnum",
    });
    t.field("workspace", {
      type: "Workspace",
      resolve: (parent, _, context: Context) => {
        return context.prisma.item
          .findUnique({
            where: { id: parent.id || undefined },
          })
          .workspace();
      },
    });
  },
});

const Workspace = objectType({
  name: "Workspace",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });
    t.nonNull.string("title");
    t.nonNull.string("color");
    t.field("owner", {
      type: "User",
      resolve: (parent, _, context: Context) => {
        return context.prisma.workspace
          .findUnique({
            where: { id: parent.id || undefined },
          })
          .owner();
      },
    });
    t.nonNull.list.field("users", {
      type: "User",
      resolve: (parent, _, context: Context) => {
        return context.prisma.workspace
          .findUnique({
            where: { id: parent.id || undefined },
          })
          .users();
      },
    });
    t.nonNull.list.field("items", {
      type: "Item",
      resolve: (parent, _, context: Context) => {
        return context.prisma.workspace
          .findUnique({
            where: { id: parent.id || undefined },
          })
          .items();
      },
    });
  },
});

const TypeEnum = enumType({
  name: "TypeEnum",
  members: ["TODO", "DONE", "FAIL"],
});

const UserUniqueInput = inputObjectType({
  name: "UserUniqueInput",
  definition(t) {
    t.int("id");
    t.string("email");
  },
});

const WorkspaceCreateInput = inputObjectType({
  name: "WorkspaceCreateInput",
  definition(t) {
    t.nonNull.string("title");
    t.nonNull.string("color");
    // TODO
  },
});

const UserCreateInput = inputObjectType({
  name: "UserCreateInput",
  definition(t) {
    t.nonNull.string("email");
    t.string("name");
    t.nonNull.string("password");
  },
});


export const schema = makeSchema({
  types: [
    Query,
    Mutation,
    Workspace,
    User,
    Item,
    TypeEnum,
    UserUniqueInput,
    UserCreateInput,
    WorkspaceCreateInput,
    DateTime,
  ],
  outputs: {
    schema: __dirname + "/../schema.graphql",
    typegen: __dirname + "/generated/nexus.ts",
  },
  contextType: {
    module: require.resolve("./context"),
    export: "Context",
  },
  sourceTypes: {
    modules: [
      {
        module: "@prisma/client",
        alias: "prisma",
      },
    ],
  },
});
