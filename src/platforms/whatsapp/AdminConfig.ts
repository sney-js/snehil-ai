export type AIConfigType = { ImageSize: 512 | 256 | 1024 };

export const AIConfigDefaults: AIConfigType = {
  ImageSize: 512
};

export const handleMessageAIConfig = async (
  configData: AIConfigType
): Promise<void> => {};
