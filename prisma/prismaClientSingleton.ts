import { PrismaClient } from '@prisma/client';
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required.');
}

const prismaClientSingleton = () => {
  if (!globalThis.prismaGlobal) {
    const adapter = new PrismaTiDBCloud({ url: connectionString });
    globalThis.prismaGlobal = new PrismaClient({ adapter });
  }
  return globalThis.prismaGlobal;
};

// Declare global variable prismaGlobal
declare global {
  var prismaGlobal: PrismaClient | undefined;
}

// Export the Prisma Client instance
const prisma = prismaClientSingleton();

// if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

export default prisma;

// import { connect } from '@tidbcloud/serverless';
// import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter';
// import { PrismaClient } from '@prisma/client';

// const connectionString = `${process.env.DATABASE_URL}`;

// const PrismaClientSingleton = () => {
//   const connection = connect({ url: connectionString });
//   const adapter = new PrismaTiDBCloud(connection);
//   const prisma = new PrismaClient({ adapter });

//   return prisma;
// };

// declare global {
//   var prismaGlobal: undefined | ReturnType<typeof PrismaClientSingleton>;
// }

// const prisma = globalThis.prismaGlobal ?? PrismaClientSingleton();

// if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

// export default PrismaClientSingleton;
