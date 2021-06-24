import * as venom from "venom-bot";
import { Message, Whatsapp } from "venom-bot";

const WEEKDAY_SOCIAL_CHAT_ID = "61411527010-1612698201@g.us";
const PBA_REDCLIFFE_ID = "61411527010@c.us";
const MIKE_TAN_ID = "61423965711@c.us";
const MESSAGE_REGEX =
  /baddy social @ pba redcliffe.*thursday.*6pm-8pm.*(?<!list[ \n]*)1\.[ \n]*[^a-z0-9 ].*/is;

venom
  .create("Liam Wilburn")
  .then((client) => start(client))
  .catch((error) => {
    console.log(error);
  });

function start(client: Whatsapp) {
  client.onMessage((message: Message) => {
    if (
      (message.chatId as any)["_serialized"] === WEEKDAY_SOCIAL_CHAT_ID &&
      ((message.sender.id as any)["_serialized"] === PBA_REDCLIFFE_ID ||
        (message.sender.id as any)["_serialized"] === MIKE_TAN_ID) &&
      MESSAGE_REGEX.test(message.body)
    ) {
      let nameEntered = false;
      console.info(
        message.body
          .split("\n")
          .map((text) => {
            if (text.startsWith("1.") && !nameEntered) {
              nameEntered = true;
              return text + "Liam W";
            } else {
              return text;
            }
          })
          .join("\n")
      );
    }
  });
}
