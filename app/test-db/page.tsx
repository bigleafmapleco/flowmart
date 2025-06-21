import { createServerClient } from '@/utils/supabase/server'

export default async function TestDB() {
  const supabase = await createServerClient()
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
  
  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Database Test</h1>
        <p>❌ Error: {error.message}</p>
      </div>
    )
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Test</h1>
      <p>✅ Connected to Supabase! Found {categories?.length || 0} categories.</p>
    </div>
  )
}