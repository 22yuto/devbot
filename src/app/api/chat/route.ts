import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    // 実際にはここでAI APIやバックエンドサービスを呼び出します
    // このデモでは簡単な応答を返します

    // 応答を少し遅延させて、リアルなAPIのような振る舞いをシミュレート
    await new Promise(resolve => setTimeout(resolve, 500));

    // 簡単な応答ロジック
    let response = '';

    if (message.toLowerCase().includes('こんにちは') || message.toLowerCase().includes('hello')) {
      response = 'こんにちは！どのようにお手伝いできますか？';
    } else if (message.toLowerCase().includes('名前')) {
      response = '私はDevbotです。何かお手伝いできることはありますか？';
    } else if (message.toLowerCase().includes('天気')) {
      response = '申し訳ありませんが、現在の天気情報へのアクセス権がありません。';
    } else if (message.toLowerCase().includes('ありがとう')) {
      response = 'どういたしまして！他に質問があればいつでもどうぞ。';
    } else {
      response = `「${message}」について承りました。詳細を教えていただけますか？`;
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'メッセージの処理中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
