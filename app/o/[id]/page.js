
import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';

// Helper to get link data
async function getLink(id) {
  // Handle Stateless IDs (deployment fallback)
  if (id.startsWith('e_')) {
    try {
      const token = id.substring(2);
      const json = Buffer.from(token, 'base64url').toString('utf-8');
      const payload = JSON.parse(json);
      return {
        id,
        destinationUrl: payload.d,
        imageUrl: payload.i || null // imageUrl might be undefined in stateless mode
      };
    } catch (e) {
      console.error('Invalid stateless ID:', e);
      return null;
    }
  }

  // Handle Stateful IDs (local json)
  try {
    const data = await fs.readFile(path.join(process.cwd(), 'data', 'links.json'), 'utf8');
    const links = JSON.parse(data);
    return links.find(l => l.id === id);
  } catch (e) {
    return null;
  }
}

import { headers } from 'next/headers';

// ... (keep getLink function)

export async function generateMetadata(props) {
  const params = await props.params;
  const link = await getLink(params.id);
  
  if (!link) {
    return {
      title: 'Link Not Found'
    };
  }

  // Robustly determine the absolute URL using headers
  const headersList = await headers();
  
  // Use the Host header from the request. 
  // This is safer than VERCEL_URL because it matches the actual domain the user/bot is visiting.
  const host = headersList.get('host') || 'localhost:3000';
  
  const isLocalhost = host.includes('localhost');
  const protocol = headersList.get('x-forwarded-proto') || (isLocalhost ? 'http' : 'https');
  const baseUrl = `${protocol}://${host}`;

  // Ensure absolute image URL with CACHE BUSTING
  const imageUrlRaw = link.imageUrl ? (link.imageUrl.startsWith('http') ? link.imageUrl : `${baseUrl}${link.imageUrl}`) : null;
  const imageUrl = imageUrlRaw ? `${imageUrlRaw}?v=8` : null; // Increment version to 8

  const imageObj = imageUrl ? {
    url: imageUrl,
    secureUrl: imageUrl,
    width: 1200,
    height: 630,
    type: 'image/jpeg',
    alt: 'GrabFood Group Order',
  } : null;

  const images = imageObj ? [imageObj] : [];

  return {
    title: 'Đặt đơn nhóm GrabFood',
    description: 'Mỗi thành viên có thể tự chọn món yêu thích từ điện thoại của mình và cùng tiết kiệm phí giao hàng!',
    openGraph: {
      title: 'Đặt đơn nhóm GrabFood',
      description: 'Mỗi thành viên có thể tự chọn món yêu thích từ điện thoại của mình và cùng tiết kiệm phí giao hàng!',
      siteName: 'r.grab.com',
      images: images,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Đặt đơn nhóm GrabFood',
      description: 'Mỗi thành viên có thể tự chọn món yêu thích từ điện thoại của mình và cùng tiết kiệm phí giao hàng!',
      images: images,
      domain: 'r.grab.com',
    }
  };
}


export default async function LinkPage(props) {
  const params = await props.params;
  const link = await getLink(params.id);

  if (!link) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-4 text-center">
      <h1 className="text-xl font-bold mb-4">Redirecting...</h1>
      <p className="mb-8 text-gray-600">Please wait while we take you to your destination.</p>
      
      <a 
        href={link.destinationUrl}
        className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
      >
        Click here if not redirected
      </a>

      <script dangerouslySetInnerHTML={{
        __html: `window.location.href = "${link.destinationUrl}"`
      }} />
    </div>
  );
}

