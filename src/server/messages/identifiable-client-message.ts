export type IdentifiableClientMessage<MessageName = string> = {
  name: MessageName;
  // oxlint-disable-next-line typescript/no-explicit-any
  payload?: any;
  uuid: string;
};
