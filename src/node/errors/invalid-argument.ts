export class InvalidArgument extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidArgument';
  }
}
