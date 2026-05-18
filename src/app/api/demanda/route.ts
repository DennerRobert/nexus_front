import { NextRequest, NextResponse } from 'next/server';

const BITRIX_WEBHOOK = 'https://interjato.bitrix24.com.br/rest/5944/kro2n4or8u5gdmxt';
const PIPELINE_ID = 110;
const STAGE_ID = 'C110:NEW';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { titulo?: string; nomeProponente?: string };
    const { titulo, nomeProponente } = body;

    if (!titulo || typeof titulo !== 'string' || !titulo.trim()) {
      return NextResponse.json(
        { success: false, message: 'O campo título é obrigatório.' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BITRIX_WEBHOOK}/crm.deal.add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          TITLE: titulo.trim(),
          CATEGORY_ID: PIPELINE_ID,
          STAGE_ID,
          UF_CRM_1753367400: nomeProponente?.trim() ?? '',
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[Bitrix] Erro na requisição:', err);
      return NextResponse.json(
        { success: false, message: 'Erro ao comunicar com o Bitrix.' },
        { status: 502 }
      );
    }

    const data = await response.json() as { result?: number; error?: string; error_description?: string };

    if (data.error) {
      console.error('[Bitrix] Erro retornado:', data.error, data.error_description);
      return NextResponse.json(
        { success: false, message: data.error_description ?? 'Erro no Bitrix.' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Card criado no Bitrix com sucesso!',
      dealId: data.result,
    });

  } catch (error) {
    console.error('[API] Erro interno ao integrar Bitrix:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
