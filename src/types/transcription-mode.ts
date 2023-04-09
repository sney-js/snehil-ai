export enum TranscriptionMode {
  Local = 'local',
  SpeechAPI = 'speech-api',
  WhisperAPI = 'whisper-api',
  OpenAI = 'openai'
}

export enum TTSMode {
  SpeechAPI = 'speech-api',
  AWSPolly = 'aws-polly'
}

export enum AWSPollyEngine {
  Standard = 'standard',
  Neural = 'neural'
}
