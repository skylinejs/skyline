import { Config } from '@oclif/core';

/**
 * Needed to fullfill oclif specific interfaces, constructors etc without exposing them to the consumer.
 */
class OclifAdapter {
  private oclifConfig?: Config;

  async loadOclifConfig() {
    if (this.oclifConfig) return;
    const config = await Config.load();
    this.oclifConfig = config;
  }

  getOclifConfig(): Config {
    if (!this.oclifConfig) {
      throw new Error('OclifAdapter: Config not set');
    }
    return this.oclifConfig;
  }
}

export const oclifAdapter = new OclifAdapter();
