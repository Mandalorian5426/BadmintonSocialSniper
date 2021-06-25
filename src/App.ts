import * as venom from "venom-bot";
import { Message, Whatsapp } from "venom-bot";

const WEEKDAY_SOCIAL_CHAT_ID = "61411527010-1612698201@g.us";

const PBA_REDCLIFFE_ID = "61411527010@c.us";
const MIKE_TAN_ID = "61423965711@c.us";

const THURSDAY_MESSAGE_REGEX =
  /baddy social @ pba redcliffe.*thursday.*6pm-8pm.*(?<!list[ \n]*)1\.[ \n]*[^a-z0-9 ].*/is;
const TUESDAY_MESSAGE_REGEX =
  /baddy social @ pba redcliffe.*tuesday.*6pm-8pm.*(?<!list[ \n]*)1\.[ \n]*[^a-z0-9 ].*/is;

venom
  .create("Liam Wilburn")
  .then((client) => start(client))
  .catch((error) => {
    console.log(error);
  });

const start = (client: Whatsapp) => {
  client.onMessage((message: Message) => {
    if (isInitialMessage(message)) {
      const newMessage = addNameToInitialMessage(message);
      client.sendText(WEEKDAY_SOCIAL_CHAT_ID, newMessage);
    }
  });
};

const isInitialMessage = (message: Message) =>
  (message.chatId as any)["_serialized"] === WEEKDAY_SOCIAL_CHAT_ID &&
  ((message.sender.id as any)["_serialized"] === PBA_REDCLIFFE_ID ||
    (message.sender.id as any)["_serialized"] === MIKE_TAN_ID) &&
  (THURSDAY_MESSAGE_REGEX.test(message.body) ||
    TUESDAY_MESSAGE_REGEX.test(message.body));

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
