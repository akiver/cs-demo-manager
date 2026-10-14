import { CommandError } from './command-error';

export class InvalidArgument extends CommandError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidArgument';
  }
}
