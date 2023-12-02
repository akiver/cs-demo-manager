export type IdentifiableClientMessage<MessageName = string> = {
  name: MessageName;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
  uuid: string;
};
