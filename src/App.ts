import * as venom from "venom-bot";
import { Message, Whatsapp } from "venom-bot";

const WEEKDAY_SOCIAL_CHAT_ID = "61411527010-1612698201@g.us";
const PBA_REDCLIFFE_ID = "61411527010@c.us";
const MIKE_TAN_ID = "61423965711@c.us";

venom
  .create("LiamWilburn")
  .then((client) => start(client))
  .catch((error) => {
    console.error("Error in client: ", error);
  });

const start = (client: Whatsapp) => {
  let lastSentMessageTimestamp = 0;
  client.onAnyMessage((message: Message) => {
    console.info("========== Message received ==========");
    console.info("Body: ", message.body);
    console.info("");
    console.info("Is valid sender: ", isSentByValidSender(message.sender.id));
    console.info("Is group chat: ", isFromValidChat(message.chat.id));
    console.info("Is initial message: ", isValidInitialMessage(message.body));
    console.info(
      "Has been 12hrs: ",
      lastSentMessageTimestamp + 1000 * 60 * 60 * 12 < Date.now()
    );
    console.info("======================================");

    if (
      isInitialMessage(message) &&
      lastSentMessageTimestamp + 1000 * 60 * 60 * 12 < Date.now()
    ) {
      const newMessage = addNameToInitialMessage(message);
      client
        .sendText(message.chat.id, newMessage)
        .then(() => {
          lastSentMessageTimestamp = Date.now();
        })
        .catch((error) => {
          console.error("Error sending message: ", error);
        });
    }
  });

  client.onStateChange((state) => {
    if ("CONFLICT".includes(state)) {
      client.useHere();
    }
    if ("UNPAIRED".includes(state)) {
      console.info("Logout");
    }
  });

  let time: NodeJS.Timeout;
  client.onStreamChange((state) => {
    clearTimeout(time);
    if (state === "DISCONNECTED" || state === "SYNCING") {
      time = setTimeout(() => {
        client.close();
      }, 80000);
    }
  });
};

const isInitialMessage = (message: Message) =>
  isSentByValidSender(message.sender.id) &&
  isFromValidChat(message.chatId) &&
  isValidInitialMessage(message.body);

const isValidInitialMessage = (body: string) => {
  if (!body) {
    return false;
  }

  const requiredTextRegex = (text: string) =>
    /baddy social @ pba redcliffe.*thursday.*6pm-8pm/is.test(text) ||
    /baddy social @ pba redcliffe.*tuesday.*6pm-8pm/is.test(text);
  const hasRequiredText = requiredTextRegex(body);

  return hasRequiredText && body.split("\n").length <= 20;
};

const isSentByValidSender = (sender: string) =>
  sender === PBA_REDCLIFFE_ID || sender === MIKE_TAN_ID;

const isFromValidChat = (chatId: string) => chatId === WEEKDAY_SOCIAL_CHAT_ID;

const addNameToInitialMessage = (message: Message) => {
  let nameEntered = false;
  return message.body
    .split("\n")
    .map((text) => {
      if (text.startsWith("1.") && !nameEntered) {
        nameEntered = true;
        return text + "Liam W";
      } else {
        return text;
      }
    })
    .join("\n");
};
