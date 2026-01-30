import { NextRequest, NextResponse } from 'next/server';
import { TempRealModeService } from '@/services/tempRealMode';

export async function GET(request: NextRequest) {
    try {
        const result = await TempRealModeService.execute();
        return NextResponse.json({ success: true, ...result });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
