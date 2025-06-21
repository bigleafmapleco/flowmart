import { createServerClient } from '../lib/supabase'

async function setupStorage() {
  try {
    const supabase = await createServerClient()

    // Check if 'products' bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`)
    }

    const productsBucket = buckets.find(bucket => bucket.name === 'products')
    
    if (productsBucket) {
      console.log('✅ Products bucket already exists')
      return
    }

    // Create the products bucket if it doesn't exist
    const { error: createError } = await supabase.storage.createBucket('products', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880, // 5MB
    })

    if (createError) {
      throw new Error(`Failed to create products bucket: ${createError.message}`)
    }

    console.log('✅ Products bucket created successfully')
    
  } catch (error) {
    console.error('❌ Storage setup failed:', error)
    process.exit(1)
  }
}

setupStorage() 