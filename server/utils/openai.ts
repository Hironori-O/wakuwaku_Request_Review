import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateEpisode = async (formData: any) => {
  const prompt = `
以下の情報をもとに、職場での様子や必要な配慮・支援の内容を含んだ具体的な状況エピソードを生成してください。
エピソードは具体的で実用的な内容にし、約300-500文字程度で作成してください。

会社情報:
- 会社名: ${formData.companyInfo.name}
- 部署: ${formData.departmentInfo.name}
- 業務内容: ${formData.departmentInfo.duties}

従業員情報:
- 入社日: ${formData.employeeInfo.joinDate}
- 勤務頻度: ${formData.employeeInfo.workFrequency}

関連するハッシュタグ:
${formData.hashtags.map((tag: any) => tag.text).join('\n')}

以下のような内容を含めてください：
1. 具体的な状況や課題
2. 実施された配慮や支援の内容
3. その結果や効果
4. 今後の対応方針

エピソードは客観的な視点で記述し、個人情報に配慮しつつ、実践的で参考になる内容にしてください。
`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "あなたは職場での合理的配慮に関する具体的なエピソードを生成する専門家です。実用的で具体的な内容を提供してください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 1000
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('エピソードの生成に失敗しました');
  }
};