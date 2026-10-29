import { GET as getHandler, POST as postHandler } from '@/api/webhooks/whatsapp';

export async function GET(request: Request) {
  return getHandler(request);
}

export async function POST(request: Request) {
  return postHandler(request);
}
