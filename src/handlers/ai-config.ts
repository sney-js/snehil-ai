import {
  aiConfigTarget,
  aiConfigTypes,
  aiConfigValues,
  IAiConfig
} from '../types/ai-config';
import { dalleImageSize } from '../types/dalle-config';

const aiConfig: IAiConfig = {
  dalle: {
    size: dalleImageSize['512x512']
  }
  // chatgpt: {}
};

const handleMessageAIConfig = async (
  prompt: any
): Promise<string> => {
  try {

    const args: string[] = prompt.split(' ');

    /*
			!config
			!config help
		*/
    if (args.length == 1 || prompt === 'help') {
      let helpMessage = 'Available commands:\n';
      for (let target in aiConfigTarget) {
        for (let type in aiConfigTypes[target]) {
          helpMessage += `\t!config ${target} ${type} <value> - Set ${target} ${type} to <value>\n`;
        }
      }
      helpMessage += '\nAvailable values:\n';
      for (let target in aiConfigTarget) {
        for (let type in aiConfigTypes[target]) {
          helpMessage += `\t${target} ${type}: ${Object.keys(
            aiConfigValues[target][type]
          ).join(', ')}\n`;
        }
      }
      return helpMessage;
    }

    // !config <target> <type> <value>
    if (args.length !== 3) {
      return 'Invalid number of arguments, please use the following format: <target> <type> <value> or type !config help for more information.';
    }

    const target: string = args[0];
    const type: string = args[1];
    const value: string = args[2];

    if (!(target in aiConfigTarget)) {
      return (
        'Invalid target, please use one of the following: ' +
        Object.keys(aiConfigTarget).join(', ')
      );
    }

    if (!(type in aiConfigTypes[target])) {
      return (
        'Invalid type, please use one of the following: ' +
        Object.keys(aiConfigTypes[target]).join(', ')
      );
    }

    if (!(value in aiConfigValues[target][type])) {
      return (
        'Invalid value, please use one of the following: ' +
        Object.keys(aiConfigValues[target][type]).join(', ')
      );
    }

    aiConfig[target][type] = value;

    return 'Successfully set ' + target + ' ' + type + ' to ' + value;
  } catch (error: any) {
    console.error('An error occured', error);
    return (
      'An error occured, please contact the administrator. (' +
      error.message +
      ')'
    );
  }
};

export { aiConfig, handleMessageAIConfig };
