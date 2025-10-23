import { map } from 'nanostores';
import { reservoirStore } from './reservoir';

export const chatStore = map({
  started: false,
  aborted: false,
  showChat: true,
  reservoirEnabled: true,
  emotionalContext: {},
  attentionTargets: [] as string[],
  personalityMode: 'adaptive' as 'adaptive' | 'analytical' | 'creative' | 'empathetic',
});

// Enhanced chat processing with reservoir computing
export const enhancedChatProcessor = {
  async processMessage(userMessage: string, context: any = {}) {
    const store = chatStore.get();
    
    if (!store.reservoirEnabled) {
      return {
        message: userMessage,
        emotionalContext: {},
        attentionTargets: [],
        confidence: 0.5
      };
    }

    // Detect user emotions from message
    const detectedEmotions = this.detectEmotions(userMessage);
    
    // Process through reservoir system
    const result = await reservoirStore.processChat(userMessage, context, detectedEmotions);
    
    // Update chat store with reservoir insights
    chatStore.setKey('emotionalContext', result.emotionalContext);
    chatStore.setKey('attentionTargets', result.attentionTargets);
    
    return result;
  },

  detectEmotions(message: string): Map<string, number> {
    const emotions = new Map<string, number>();
    const lowerMessage = message.toLowerCase();
    
    // Simple emotion detection based on keywords
    const emotionKeywords = {
      frustration: ['frustrated', 'annoying', 'stuck', 'difficult', 'hard'],
      excitement: ['excited', 'awesome', 'amazing', 'great', 'love'],
      confusion: ['confused', 'don\'t understand', 'unclear', 'help'],
      satisfaction: ['good', 'works', 'perfect', 'excellent', 'thanks'],
      curiosity: ['how', 'why', 'what', 'explore', 'learn', 'discover']
    };

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(keyword => lowerMessage.includes(keyword));
      if (matches.length > 0) {
        emotions.set(emotion, Math.min(matches.length * 0.3, 1.0));
      }
    });

    return emotions;
  },

  updatePersonalityMode(mode: string) {
    chatStore.setKey('personalityMode', mode);
    
    // Adjust reservoir parameters based on personality mode
    const emotionAdjustments = new Map<string, number>();
    
    switch (mode) {
      case 'analytical':
        emotionAdjustments.set('analytical', 0.9);
        emotionAdjustments.set('focus', 0.8);
        break;
      case 'creative':
        emotionAdjustments.set('creativity', 0.9);
        emotionAdjustments.set('curiosity', 0.8);
        break;
      case 'empathetic':
        emotionAdjustments.set('empathy', 0.9);
        emotionAdjustments.set('compassion', 0.8);
        break;
      default: // adaptive
        emotionAdjustments.set('adaptability', 0.8);
        break;
    }

    reservoirStore.processChat('personality_mode_change', { mode }, emotionAdjustments);
  }
};
