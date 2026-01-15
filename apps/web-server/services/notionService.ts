import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

export const getNotionTasks = async () => {
    if (!process.env.NOTION_API_KEY || !DATABASE_ID) {
        console.warn('NOTION_API_KEY or NOTION_DATABASE_ID not set');
        return [];
    }

    try {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const response: any = await (notion.databases as any).query({
            database_id: DATABASE_ID,
            // You can add filters here, e.g., status != 'Done'
        });

        // Simplified mapping - adjusts based on user's actual DB schema
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        return response.results.map((page: any) => {
             // Type guard to ensure we have a full PageObjectResponse with properties
             if (!('properties' in page)) return null;
             
            const props = page.properties as Record<string, any>; // Casting properties to Record<string, any> is a practical compromise for dynamic Notion schemas, but we could be stricter.
            
            // Robustly try to find 'Name' or 'Title' property
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            const titleProp = props.Name || props.Title || props.Task || Object.values(props).find((p: any) => p.id === 'title');
            const statusProp = props.Status || props.State;
            const dateProp = props.Date || props.Due || props.Timeline;
            
            const title = titleProp?.title?.[0]?.plain_text || 'Untitled';
            const status = statusProp?.status?.name || statusProp?.select?.name || 'Todo';
            const date = dateProp?.date?.start || page.created_time;

            return {
                id: page.id,
                title,
                status,
                created_at: date,
                source: 'notion',
                url: page.url
            };
        }).filter((item: any) => item !== null);
    } catch (error) {
        console.error('Error fetching Notion tasks:', error);
        throw error;
    }
};

export const createNotionPage = async (task: { title: string, status?: string }) => {
    if (!process.env.NOTION_API_KEY || !DATABASE_ID) throw new Error('Notion credentials missing');

    try {
        const response = await notion.pages.create({
            parent: { database_id: DATABASE_ID },
            properties: {
                Name: {
                    title: [
                        { text: { content: task.title } }
                    ]
                },
                Status: {
                    status: { name: task.status || 'Not started' } // Adjust 'Not started' to match DB schema
                }
            }
        });
        return response;
    } catch (error) {
        console.error('Error creating Notion page:', error);
        throw error;
    }
};
