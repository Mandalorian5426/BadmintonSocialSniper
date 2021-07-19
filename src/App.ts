import * as R from "ramda";
import * as venom from "venom-bot";
import { Message, Whatsapp } from "venom-bot";
import { Sender } from "venom-bot/dist/api/model/message";

const WEEKDAY_SOCIAL_CHAT_ID = "61411527010-1612698201@g.us";

const PBA_REDCLIFFE_ID = "61411527010@c.us";
const MIKE_TAN_ID = "61423965711@c.us";

venom
  .create("LiamWilburn")
  .then((client) => start(client))
  .catch((error) => {
    console.info(error);
  });

const start = (client: Whatsapp) => {
  client.onAnyMessage((message: Message) => {
    console.log("Message received: ", message.body);

    if (isInitialMessage(message)) {
      const newMessage = addNameToInitialMessage(message);
      client
        .sendText(WEEKDAY_SOCIAL_CHAT_ID, newMessage)
        .then((result) => {
          console.log("Result: ", result);
        })
        .catch((error) => {
          console.info("Error when sending: ", error);
        });
    }
  });

  client.onStateChange((state) => {
    console.log("State changed: ", state);
    if ("CONFLICT".includes(state)) {
      client.useHere();
    }
    if ("UNPAIRED".includes(state)) {
      console.log("logout");
    }
  });

  let time: NodeJS.Timeout;
  client.onStreamChange((state) => {
    console.log("State Connection Stream: " + state);
    clearTimeout(time);
    if (state === "DISCONNECTED" || state === "SYNCING") {
      time = setTimeout(() => {
        client.close();
      }, 80000);
    }
  });

  // client
  //   .loadAndGetAllMessagesInChat(WEEKDAY_SOCIAL_CHAT_ID, false, false)
  //   .then((messages) =>
  //     console.info(
  //       messages
  //         .filter((message) => isInitialMessage(message))
  //         .map((message) => addNameToInitialMessage(message))
  //     )
  //   );
};

const isInitialMessage = (message: Message) =>
  isSentByValidSender(message.sender) &&
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

  const emptyNumberOneSpot = (text: string) => /^1\.[ \n\t]*$/.test(text);
  const endOfMainListRegex = (text: string) =>
    /max[ ]*[0-9][0-9]/i.test(text) || /(?<!black[ ]*)list/i.test(text);

  const strings = body.split("\n");

  const indexOfEmptyNumberOneSpot = R.findIndex(emptyNumberOneSpot, strings);

  const hasEmptyNumberOneSpot =
    indexOfEmptyNumberOneSpot !== -1 &&
    indexOfEmptyNumberOneSpot < R.findIndex(endOfMainListRegex, strings);

  return hasRequiredText && hasEmptyNumberOneSpot;
};

const isSentByValidSender = (sender: Sender) =>
  sender &&
  ((sender.id as any)["_serialized"] === PBA_REDCLIFFE_ID ||
    (sender.id as any)["_serialized"] === MIKE_TAN_ID);

const isFromValidChat = (chatId: string) =>
  chatId && (chatId as any)["_serialized"] === WEEKDAY_SOCIAL_CHAT_ID;

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
