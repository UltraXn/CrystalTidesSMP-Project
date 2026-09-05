import supabase from '../services/supabaseService.js';

async function main() {
  const { data, error } = await supabase
    .from('news_feed_items')
    .select('*')
    .eq('is_published', true);

  if (error) {
    console.error("Query error:", error);
    return;
  }

  console.log("Success! Items in news_feed_items:", data.length);
  data.forEach((item: any) => {
    console.log(`- [${item.category}] ${item.title} (Featured: ${item.is_featured})`);
  });
}

main().catch(console.error);
