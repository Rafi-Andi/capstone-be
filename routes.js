import { handlerRegister, handlerLogin, handlerTransactions, handlerTotalTransactions, handlerChatBot, handlerDetailTransactions } from "./service/handler.js";

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
    method: "GET",
    path: "/protected",
    handler: (request, h) => {
      return h
        .response({ message: "Access granted", user: request.auth.credentials })
        .code(200);
    },
  },
  {
    method: "POST",
    path: "/transactions/{user_id}",
    handler: handlerTransactions,
  },
  {
    method: "GET",
    path: "/transactions/{user_id}",
    handler: handlerTotalTransactions
  },
  {
    method: "GET",
    path: "/transactions/detail/{user_id}",
    handler: handlerDetailTransactions
  },
  {
    method: "POST",
    path: "/chatbot/{user_id}",
    handler: handlerChatBot
  },
];

export default routes