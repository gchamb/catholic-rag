export abstract class Logger {
  private static format(level: string, message: string, obj?: object) {
    return JSON.stringify({ ts: new Date().toISOString(), level, message, ...obj });
  }

  static info(message: string, obj?: object) {
    console.log(this.format("info", message, obj));
  }

  static debug(message: string, obj?: object) {
    console.log(this.format("debug", message, obj));
  }

  static error(message: string, obj?: object) {
    console.error(this.format("error", message, obj));
  }
}
