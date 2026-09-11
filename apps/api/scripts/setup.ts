import { execSync } from "child_process";

function run(cmd: string) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: process.cwd() });
}

async function waitForDb() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  for (let i = 0; i < 30; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  await prisma.$disconnect().catch(() => undefined);
  throw new Error("Postgres did not become ready in 30s. Run `pnpm db:up` first.");
}

async function main() {
  console.log("Waiting for Postgres...");
  await waitForDb();
  run("pnpm prisma migrate dev --name init --skip-seed");
  run("pnpm prisma db seed");
  console.log("\nAPI database is ready.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
