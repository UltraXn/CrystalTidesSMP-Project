import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

interface NotionPage {
  id: string;
  url?: string;
  created_time?: string;
  properties?: Record<string, unknown>;
}

interface NotionQueryResponse {
  results: NotionPage[];
  has_more?: boolean;
  next_cursor?: string | null;
}

export const getNotionTasks = async () => {
  if (!process.env.NOTION_API_KEY || !DATABASE_ID) {
    console.warn('NOTION_API_KEY or NOTION_DATABASE_ID not set');
    return [];
  }

  try {
    const response = await notion.request<NotionQueryResponse>({
      path: `databases/${DATABASE_ID}/query`,
      method: 'post',
    });

    // Simplified mapping - adjusts based on user's actual DB schema
    return response.results.map((page) => {
      const props = page.properties ?? {};
      // Robustly try to find 'Name' or 'Title' property
      const titleProp = (props.Name ??
        props.Title ??
        props.Task ??
        Object.values(props).find(
          (p) =>
            typeof p === 'object' && p !== null && (p as Record<string, unknown>).id === 'title',
        )) as Record<string, unknown> | undefined;
      const statusProp = (props.Status ?? props.State) as Record<string, unknown> | undefined;
      const dateProp = (props.Date ?? props.Due ?? props.Timeline) as
        | Record<string, unknown>
        | undefined;

      const title =
        (titleProp?.title as Array<{ plain_text?: string }> | undefined)?.[0]?.plain_text ??
        'Untitled';
      const status =
        (statusProp?.status as { name?: string } | undefined)?.name ??
        (statusProp?.select as { name?: string } | undefined)?.name ??
        'Todo';
      const date =
        (dateProp?.date as { start?: string } | undefined)?.start ??
        page.created_time ??
        new Date().toISOString();

      return {
        id: page.id,
        title,
        status,
        created_at: date,
        source: 'notion',
        url: page.url,
      };
    });
  } catch (error) {
    console.error('Error fetching Notion tasks:', error);
    throw error;
  }
};

export const createNotionPage = async (task: { title: string; status?: string }) => {
  if (!process.env.NOTION_API_KEY || !DATABASE_ID) throw new Error('Notion credentials missing');

  try {
    return await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        Name: {
          title: [{ text: { content: task.title } }],
        },
        Status: {
          status: { name: task.status ?? 'Not started' }, // Adjust 'Not started' to match DB schema
        },
      },
    });
  } catch (error) {
    console.error('Error creating Notion page:', error);
    throw error;
  }
};
