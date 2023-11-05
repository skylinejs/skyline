import inquirer, {
  PromptModule,
  Answers as PromptAnswers,
  QuestionCollection as PromptQuestionCollection,
} from 'inquirer';

// Re-export types from inquirer
export { PromptAnswers, PromptQuestionCollection };

// Re-export inquirer autocomplete prompt
import AutocompletePrompt from 'inquirer-autocomplete-prompt';
export { AutocompletePrompt };

/**
 * Prompt the CLI user for input.
 * Uses the inquirer package.
 */
export class PromptService {
  private inquirerPrompt?: PromptModule;
  private registeredPromptNames: string[] = [];

  private getPromptModule() {
    // Lazy initialization
    if (!this.inquirerPrompt) {
      this.inquirerPrompt = inquirer.createPromptModule();
    }

    return this.inquirerPrompt;
  }

  registerPrompt(name: string, prompt: inquirer.prompts.PromptConstructor) {
    if (this.registeredPromptNames.includes(name)) return;
    this.registeredPromptNames.push(name);
    this.getPromptModule().registerPrompt(name, prompt);
  }

  restoreDefaultPrompts() {
    this.getPromptModule().restoreDefaultPrompts();
  }

  prompt<T extends PromptAnswers = PromptAnswers>(
    questions: PromptQuestionCollection<T>,
    initialAnswers?: Partial<T>,
  ): Promise<T> & { ui: inquirer.ui.Prompt<T> } {
    return this.getPromptModule()(questions, initialAnswers);
  }
}
