import inquirer, { Answers, PromptModule, QuestionCollection } from 'inquirer';

export class PromptService {
  private inquirerPrompt?: PromptModule;

  private getPromptModule() {
    // Lazy initialization
    if (!this.inquirerPrompt) {
      this.inquirerPrompt = inquirer.createPromptModule();
    }

    return this.inquirerPrompt;
  }

  registerPrompt(name: string, prompt: inquirer.prompts.PromptConstructor) {
    this.getPromptModule().registerPrompt(name, prompt);
  }

  restoreDefaultPrompts() {
    this.getPromptModule().restoreDefaultPrompts();
  }

  prompt<T extends Answers = Answers>(
    questions: QuestionCollection<T>,
    initialAnswers?: Partial<T>,
  ): Promise<T> & { ui: inquirer.ui.Prompt<T> } {
    return this.getPromptModule()(questions, initialAnswers);
  }
}
