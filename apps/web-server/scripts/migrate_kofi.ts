import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: path.resolve('C:/Users/nacho/Desktop/Portafolio/crystaltides/apps/web-server/.env') });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const CSV_PATH = 'c:\\Users\\nacho\\Downloads\\Serverside\\Transaction_All.csv';

const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    
    // Clean headers/values (remove surrounding quotes)
    return result.map(val => val.trim().replace(/^"|"$/g, ''));
};

const mapCSVToDB = async () => {
    try {
        const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
        const lines = fileContent.split('\n').filter(line => line.trim() !== '');
        
        // Skip header
        const dataLines = lines.slice(1);
        
        console.log(`Found ${dataLines.length} transactions to process...`);
        
        let insertedCount = 0;
        let errors = 0;

        for (const line of dataLines) {
            const cols = parseCSVLine(line);
            
            // CSV Headers mappings based on file content:
            // 0: DateTime (UTC)
            // 1: From
            // 2: Message
            // 3: Item
            // 4: Description
            // 5: Quantity
            // 6: PricePerUnit
            // 7: Received (Amount) -> IMPORTANT
            // 8: Given
            // 9: Currency
            // 10: ShopOrderType
            // 11: TransactionType
            // 12: TransactionId
            // 13: Reference
            // 14: SalesTax
            // 15: SalesTaxPercentage
            // 16: SalesTaxIncludesShipping
            // 17: BuyerCountry
            // 18: BuyerStateOrProvince
            // 19: BuyerEmail
            // 20: PaymentProvider

            // Ignore Shop Orders if you only want Tips?
            // User requested ALL transactions probably, or just tips? 
            // The file has "Shop Order" and "Tip".
            // Let's import everything but mark type properly.

            const transactionId = cols[12]; // TransactionId
            // If empty, fallback? No, it seems robust.
            
            // Format Date
            // Input: "03/14/2021 23:29" (MM/DD/YYYY HH:mm)
            // We need ISO string
            const dateStr = cols[0];
            const dateObj = new Date(dateStr);
            
            // "Received" might be after fees?
            // Let's use the larger of the two to show the "face value" of the donation/purchase.
            const rawAmount = Math.max(parseFloat(cols[7] || '0'), parseFloat(cols[8] || '0'));

             const dbRecord = {
                message_id: transactionId,
                created_at: dateObj.toISOString(),
                from_name: cols[1] || 'Anónimo',
                message: cols[2] || '',
                amount: rawAmount,
                currency: cols[9] || 'USD',
                type: cols[11] || 'Donation',
                is_public: true, // Defaulting to public
                url: cols[13] || '' // Using Reference as URL fallback or empty
            };

            const { error } = await supabase
                .from('donations')
                .upsert(dbRecord, { onConflict: 'message_id' });

            if (error) {
                console.error(`Error inserting ${transactionId}:`, error.message);
                errors++;
            } else {
                insertedCount++;
            }
        }

        console.log(`Migration Finished!`);
        console.log(`Success: ${insertedCount}`);
        console.log(`Errors: ${errors}`);

    } catch (err) {
        console.error("Critical Error:", err);
    }
};

mapCSVToDB();
