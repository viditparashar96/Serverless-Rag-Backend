import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";

import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Context } from "hono";
import { PoolConfig } from "pg";
export const chatWithPdf = async (
  c: Context,
  tablename: any,
  message: any,
  chat_history: any
) => {
  const config = {
    postgresConnectionOptions: {
      type: "postgres",
      host: c.env.PGHOST,
      user: c.env.PGUSER,
      password: c.env.PGPASSWORD,
      database: c.env.PGDATABASE,
      ssl: {
        rejectUnauthorized: false,
      },
    } as PoolConfig,
    tableName: tablename,
    columns: {
      idColumnName: "id",
      vectorColumnName: "vector",
      contentColumnName: "content",
      metadataColumnName: "metadata",
    },
  };

  const open_ai_Embedding = new OpenAIEmbeddings({
    openAIApiKey: c.env.OPENAI_API_KEY,
  });
  const pgvectorStore = await PGVectorStore.initialize(
    open_ai_Embedding,
    config
  );
  const retriever = pgvectorStore.asRetriever();
  //   const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");

  const llm = new ChatOpenAI({
    model: "gpt-3.5-turbo",
    temperature: 0,
    openAIApiKey: c.env.OPENAI_API_KEY,
    maxTokens: 100,
  });

  const contextualizeQSystemPrompt = `Given a chat history and the latest user question
which might reference context in the chat history, formulate a standalone question
which can be understood without the chat history. Do NOT answer the question,
just reformulate it if needed and otherwise return it as is.`;
  const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
    ["system", contextualizeQSystemPrompt],
    new MessagesPlaceholder("chat_history"),
    ["human", "{question}"],
  ]);

  const contextualizeQChain = contextualizeQPrompt
    .pipe(llm)
    .pipe(new StringOutputParser());

  const qaSystemPrompt = `You are an assistant for question-answering tasks.
Use the following pieces of retrieved context to answer the question.
If you don't know the answer, just say that you don't know.
 keep the answer concise.

{context}`;

  const qaPrompt = ChatPromptTemplate.fromMessages([
    ["system", qaSystemPrompt],
    new MessagesPlaceholder("chat_history"),
    ["human", "{question}"],
  ]);

  const contextualizedQuestion = (input: Record<string, unknown>) => {
    if ("chat_history" in input) {
      return contextualizeQChain;
    }
    return input.question;
  };

  const ragChain = RunnableSequence.from([
    RunnablePassthrough.assign({
      context: (input: Record<string, unknown>) => {
        if ("chat_history" in input) {
          const chain: any = contextualizedQuestion(input);
          return chain.pipe(retriever).pipe(formatDocumentsAsString);
        }
        return "";
      },
    }),
    qaPrompt,
    llm,
  ]);

  const question = message;
  const aiMsg = await ragChain.invoke({ question, chat_history });
  console.log("ai msg ====>", aiMsg);
  console.log("chat_history===>", chat_history);
  //   chat_history = chat_history.concat(aiMsg);
  return aiMsg;
};
