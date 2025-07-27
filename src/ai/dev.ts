import { config } from 'dotenv';
config();

import '@/ai/flows/extract-receipt-data.ts';
import '@/ai/flows/generate-shopping-list.ts';
import '@/ai/flows/understand-spending-habits.ts';
import '@/ai/flows/suggest-savings.ts';