import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { Context } from "hono";
import { getPrisma } from "../configs/db-config";

export const getChatHistory = async (c: Context, tableId: string) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const chatHistory = await prisma.chatMessage.findMany({
    where: {
      tableId: tableId,
    },
    orderBy: {
      timestamp: "asc",
    },
  });

  return chatHistory.map((message) => {
    return message.sender === "user"
      ? new HumanMessage(message.message)
      : new AIMessage(message.message);
  });
};

export const saveChatMessage = async (
  c: Context,
  tableId: string,
  sender: "user" | "ai",
  message: string
) => {
  const prisma = getPrisma(c.env.DATABASE_URL);

  await prisma.chatMessage.create({
    data: {
      tableId,
      sender,
      message,
      timestamp: new Date(),
    },
  });
};
