
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

    if (!destinationUrl) {
      return NextResponse.json({ error: 'Destination URL is required' }, { status: 400 });
    }

    // Generate 8-char mixed-case ID to match Grab's format (e.g. 2YVZn6zy)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    let imageUrl = null;

    if (file && file.size > 0) {
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

    const links = await getLinks();
    links.push(newLink);
    await saveLinks(links);

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
