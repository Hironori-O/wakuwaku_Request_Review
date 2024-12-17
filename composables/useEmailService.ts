import { ref } from 'vue'

interface Hashtag {
  id: string;
  text: string;
}

export const useEmailService = () => {
  const sending = ref(false);
  const error = ref<string | null>(null);

  const sendUserLink = async (email: string, hashtags: Hashtag[]) => {
    sending.value = true;
    error.value = null;

    try {
      // 開発環境用の直接リンク生成
      const hashtagIds = hashtags.map(tag => tag.id);
      const baseUrl = window.location.origin;
      const userPageUrl = `${baseUrl}/user/form?hashtags=${hashtagIds.join(',')}`;

      // 開発環境では直接リンクを返す
      return {
        success: true,
        userPageUrl
      };
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'リンク生成に失敗しました';
      throw e;
    } finally {
      sending.value = false;
    }
  };

  return {
    sending,
    error,
    sendUserLink,
  };
};