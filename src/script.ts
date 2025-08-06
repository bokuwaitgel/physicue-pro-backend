import { PrismaService } from './prisma/prisma.service';


async function main() {
 
  const prisma = new PrismaService();
  const data = await prisma.courseEnrollment.findMany({});
  // You can use 'data' here
  console.log(data);
}

main().catch(console.error);
