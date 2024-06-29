import { Context } from "hono";
import { getPrisma } from "../configs/db-config";
import { chatWithPdf } from "../helpers/chat-with-pdf";
import { getChatHistory, saveChatMessage } from "../libs/utils";
export const createProject = async (c: Context | any) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];
    const name = body["name"];
    const description = body["description"];

    if (!file) {
      return c.json({ msg: "Please upload a file" }, 400);
    }
  } catch (error: any) {
    console.error("Error:", error);
    return c.json(
      {
        msg: "An error occurred while uploading file",
        error: error.message,
      },
      500
    );
  }
};

export const getProjects = async (c: Context | any) => {
  try {
    console.log("User id :", c.req.user.id);
    const prisma = getPrisma(c.env.DATABASE_URL);
    const projects = await prisma.project.findMany({
      where: {
        user: {
          id: c.req.user.id,
        },
      },
    });
    return c.json({ projects });
  } catch (error: any) {
    console.error("Error:", error);
    return c.json(
      {
        msg: "An error occurred while fetching projects",
        error: error.message,
      },
      500
    );
  }
};

export const chatWithProject = async (c: Context) => {
  try {
    const table_id = c.req.param("table_id");
    const { message } = await c.req.json();
    const chat_history = await getChatHistory(c, table_id);

    const response = await chatWithPdf(c, table_id, message, chat_history);
    // chat_history = chat_history.concat(response);
    const aiResponseText = response.text;
    await saveChatMessage(c, table_id, "user", message);
    await saveChatMessage(c, table_id, "ai", aiResponseText);

    return c.json({ response });
  } catch (error) {
    console.log(error);
  }
};

export const getChatHistoryByTableId = async (c: Context) => {
  try {
    const table_id = c.req.param("table_id");
    const prisma = getPrisma(c.env.DATABASE_URL);
    const chatHistory = await prisma.chatMessage.findMany({
      where: {
        tableId: table_id,
      },
      orderBy: {
        timestamp: "asc",
      },
    });
    return c.json({ chatHistory });
  } catch (error) {
    console.log(error);
  }
};
