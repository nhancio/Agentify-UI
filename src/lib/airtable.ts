import Airtable from 'airtable';

const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY as string;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID as string;
const AIRTABLE_TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME as string;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
  console.error('Missing Airtable environment variables.');
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export async function saveToAirtable(fields: Record<string, any>) {
  try {
    const record = await base(AIRTABLE_TABLE_NAME).create([{ fields }]);
    return record;
  } catch (error) {
    console.error('Airtable save error:', error);
    throw error;
  }
}

export default saveToAirtable; 