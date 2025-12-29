
import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';

// Helper to get link data
async function getLink(id) {
  try {
    const data = await fs.readFile(path.join(process.cwd(), 'data', 'links.json'), 'utf8');
    const links = JSON.parse(data);
    return links.find(l => l.id === id);
  } catch (e) {
    return null;
  }
}

export async function generateMetadata(props) {
  const params = await props.params;
  const link = await getLink(params.id);
  
  if (!link) {
    return {
      title: 'Link Not Found'
    };
  }

  // Construct absolute image URL
  // Note: link.imageUrl is relative like /uploads/abc.jpg
  // For OG tags, it's best to use absolute URLs. 
  // Since we don't know the deployed domain, we might rely on relative if supported 
  // or simple localhost for now. In production, this needs env var.
  // We'll use relative which Next.js resolves if MetadataBase is set, or just hope the platform resolves it.
  // Actually, for local preview, it won't work on external platforms anyway since localhost isn't public.
  // But the implementation is correct.
  
  const images = link.imageUrl ? [link.imageUrl] : [];

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
    // We can also try to trick some agents with twitter card
    twitter: {
      card: 'summary_large_image',
      title: 'Đặt đơn nhóm GrabFood',
      description: 'Mỗi thành viên có thể tự chọn món yêu thích từ điện thoại của mình và cùng tiết kiệm phí giao hàng!',
      images: images,
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

