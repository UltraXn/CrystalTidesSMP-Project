import 'dotenv/config';
import supabase from '../services/supabaseService.js';

interface NewsFeedItem {
  category?: string;
  title?: string;
  is_featured?: boolean;
}

async function main() {
  const { data, error } = await supabase
    .from('news_feed_items')
    .select('*')
    .eq('is_published', true);

  if (error) {
    console.error('Query error:', error);
    return;
  }

  console.log('Success! Items in news_feed_items:', data.length);
  (data as NewsFeedItem[]).forEach((item) => {
    console.log(
      `- [${item.category ?? 'General'}] ${item.title ?? 'Sin título'} (Featured: ${Boolean(item.is_featured)})`,
    );
  });
}

try {
  await main();
} catch (error) {
  console.error(error);
}
