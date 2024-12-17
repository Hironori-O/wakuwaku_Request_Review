import { generateEpisode } from '../../utils/openai';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const episode = await generateEpisode(body);
    
    return {
      success: true,
      episode
    };
  } catch (error) {
    console.error('Error generating episode:', error);
    throw createError({
      statusCode: 500,
      message: 'エピソードの生成に失敗しました'
    });
  }
});