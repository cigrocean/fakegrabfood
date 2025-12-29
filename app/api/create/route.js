
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'links.json');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

async function getLinks() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

async function saveLinks(links) {
  await fs.writeFile(DATA_FILE, JSON.stringify(links, null, 2));
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const destinationUrl = formData.get('destinationUrl');
    const file = formData.get('file');
    const template = formData.get('template');

    if (!destinationUrl) {
      return NextResponse.json({ error: 'Destination URL is required' }, { status: 400 });
    }

    // Try Local Filesystem Storage (Works locally, fails on Vercel)
    try {
      // Generate 8-char mixed-case ID
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let id = '';
      for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      let imageUrl = null;

      if (template) {
        // Use pre-existing template (Stateless compatible path)
        imageUrl = template; 
      } else if (file && file.size > 0) {
        // File Upload Processing
        try { await fs.mkdir(UPLOAD_DIR, { recursive: true }); } catch (e) {}
        
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = path.extname(file.name) || '.jpg';
        const filename = `${id}${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);
        
        await fs.writeFile(filepath, buffer);
        imageUrl = `/uploads/${filename}`;
      }

      const newLink = {
        id,
        destinationUrl,
        imageUrl,
        createdAt: new Date().toISOString()
      };

      // Ensure data dir exists
      try { await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true }); } catch (e) {}

      const links = await getLinks();
      links.push(newLink);
      await saveLinks(links);

      return NextResponse.json({ id });
    } catch (fsError) {
      console.warn('Filesystem write failed (expected on Vercel), falling back to Stateless ID:', fsError);
      
      // Fallback: Stateless ID (Encode data in ID)
      const payload = { 
        d: destinationUrl,
        i: template || null // Support template images even in stateless mode!
      };
      
      const token = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const statelessId = `e_${token}`; // e_ prefix for "encoded"
      
      return NextResponse.json({ id: statelessId });
    }
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
