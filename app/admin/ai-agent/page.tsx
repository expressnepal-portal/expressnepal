import { prisma } from "@/lib/prisma";
import AiNewsAgent from "./AiNewsAgent";

export const metadata = {
  title: "AI News Agent | Express Nepal Admin",
};

export default async function AiAgentPage() {
  const categories = await prisma.category.findMany({
    orderBy: { menuOrder: "asc" },
  });

  return <AiNewsAgent categories={categories} />;
}
