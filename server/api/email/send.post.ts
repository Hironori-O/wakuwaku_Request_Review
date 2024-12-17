export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { to, hashtags } = body;

    // 開発環境用のモックトークン
    const token = 'dev-test-token';
    
    // ユーザーページのURL生成
    const userPageUrl = `${process.env.APP_URL || 'http://localhost:3000'}/user/${token}`;

    // 開発環境用の遅延をシミュレート
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('開発環境: メール送信をシミュレート');
    console.log('送信先:', to);
    console.log('ユーザーページURL:', userPageUrl);
    console.log('選択されたハッシュタグ:', hashtags);

    // 開発環境では実際のメール送信をスキップ
    return { 
      success: true, 
      token,
      messageId: 'dev-message-id',
      userPageUrl // 開発用にURLを返す
    };
  } catch (error) {
    console.error('Error in email endpoint:', error);
    throw createError({
      statusCode: 500,
      message: 'メール送信に失敗しました'
    });
  }
});