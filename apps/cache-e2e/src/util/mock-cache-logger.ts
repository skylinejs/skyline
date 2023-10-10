import { CacheLogger, CacheMessageInfoUnion } from '@skyline-js/cache';

export class MockCacheLogger extends CacheLogger {
  logs: { message: string; info: CacheMessageInfoUnion }[] = [];
  warns: { message: string; info: CacheMessageInfoUnion }[] = [];
  errors: { message: string; info: CacheMessageInfoUnion }[] = [];

  override log(message: string, info: CacheMessageInfoUnion): void {
    this.logs.push({ message, info });
  }

  override warn(message: string, info: CacheMessageInfoUnion): void {
    this.warns.push({ message, info });
  }

  override error(message: string, info: CacheMessageInfoUnion): void {
    this.errors.push({ message, info });
  }

  popLogOrFail<T extends CacheMessageInfoUnion>(): {
    message: string;
    info: T;
  } {
    const log = this.logs.pop();
    if (!log) throw new Error(`Expected a log message to exist`);
    return log as { message: string; info: T };
  }

  popWarnOrFail<T extends CacheMessageInfoUnion>(): {
    message: string;
    info: T;
  } {
    const warn = this.warns.pop();
    if (!warn) throw new Error(`Expected a warn message to exist`);
    return warn as { message: string; info: T };
  }

  popErrorOrFail<T extends CacheMessageInfoUnion>(): {
    message: string;
    info: T;
  } {
    const error = this.errors.pop();
    if (!error) throw new Error(`Expected a error message to exist`);
    return error as { message: string; info: T };
  }
}
