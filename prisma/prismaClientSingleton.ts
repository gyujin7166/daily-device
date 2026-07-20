import { PrismaClient } from '@prisma/client';
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter';

const connectionString = process.env.DATABASE_URL;
const connectionMode = process.env.DATABASE_CONNECTION_MODE ?? 'serverless';

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required.');
}

if (connectionMode !== 'serverless' && connectionMode !== 'direct') {
  throw new Error(
    'DATABASE_CONNECTION_MODE must be either "serverless" or "direct".',
  );
}

const createPrismaClient = () => {
  if (connectionMode === 'direct') {
    return new PrismaClient();
  }

  const adapter = new PrismaTiDBCloud({ url: connectionString });
  return new PrismaClient({ adapter });
};

const prismaClientSingleton = () => {
  if (!globalThis.prismaGlobal) {
    globalThis.prismaGlobal = createPrismaClient();
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
