import { handlerRegister, handlerLogin, handlerAddTransactions, handlerSummaryTransactions, handlerChatBot, handlerDetailTransactions } from "./service/handler.js";

const routes = [
  {
    method: "POST",
    path: "/register",
    options: {
      auth: false,
    },
    handler: handlerRegister,
  },
  {
    method: "POST",
    path: "/login",
    options: {
      auth: false,
    },
    handler: handlerLogin,
  },
  {
    method: "POST",
    path: "/transactions",
    handler: handlerAddTransactions,
  },
  {
    method: "GET",
    path: "/transactions/summary",
    handler: handlerSummaryTransactions
  },
  {
    method: "GET",
    path: "/transactions/detail",
    handler: handlerDetailTransactions
  },
  {
    method: "POST",
    path: "/chatbot",
    handler: handlerChatBot
  },
];

export default routes