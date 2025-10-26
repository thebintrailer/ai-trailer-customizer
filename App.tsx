import React, { useState, useCallback, ChangeEvent } from 'react';
import type { TrailerModel, ColorTheme, BrandingDetails } from './types';
import { TRAILER_MODELS, COLOR_THEMES, FALLBACK_IMAGE_URL } from './constants';
import { generateTrailerImage } from './services/geminiService';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold mb-4 text-gray-300">{title}</h2>
    {children}
  </div>
);

export default function App() {
  const [selectedModel, setSelectedModel] = useState<TrailerModel | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme | null>(null);
  const [branding, setBranding] = useState<BrandingDetails>({ slogan: '', website: '', phone: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBrandingChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBranding({ ...branding, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!selectedModel) {
      alert('Please select a trailer model.');
      return;
    }
    if (!selectedTheme) {
      alert('Please choose a color theme.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    // Build the AI prompt (ADVANCED CREATIVE WRAP MODE)
    let prompt = `You are a professional commercial vehicle wrap designer.
Generate a high-quality promotional rendering of a bin trailer using ONLY the official reference image as the base.
Do not modify the physical model — use it as your canvas.

Reference images:
- Single Cold: https://i.imgur.com/wzKkCcR.png
- Double Hot: https://i.imgur.com/SaBAdqf.png
If the reference cannot be accessed, use this fallback: ${FALLBACK_IMAGE_URL}.

Keep identical proportions, frame, wheels, and perspective.
Do NOT generate new vehicles or change the structure.

Now apply the selected theme creatively: "${selectedTheme.name}" (${selectedTheme.description}).

For the wrap design:
- Create distinct visual concepts — every generation should look like a new wrap proposal.
- You may redesign the graphics, stripe layout, color blending, logo placement zones, and background panel textures.
- Be bold and commercial: include gradients, abstract lines, layered compositions, or geometric wraps.
- Feel free to reinterpret the theme artistically, as long as the trailer body shape remains correct.
- Mix finishes: matte + gloss, or metallic + painted areas.
- Avoid duplicating the same look or plain recolors.

${selectedTheme.name === 'Fresh Aqua'
  ? `Use fresh blue-green tones with modern water-inspired energy lines, waves, and bright aqua gradients. Add subtle white or chrome details for contrast.`
  : selectedTheme.name === 'Eco Bright'
  ? `Use natural green tones with organic curves, flowing shapes, and eco-friendly textures. Consider abstract leaves or sunlight accents.`
  : `Use bold patriotic tones — red, white, blue with stripes, stars, or shield-like motifs in a clean fleet branding layout.`}

After completing the creative wrap, overlay the logo and branding details (slogan, website, phone) if provided.
Keep lighting realistic, with neutral studio background, clean reflections, and professional presentation.`;

    // Add branding elements dynamically
    if (logoFile) {
      prompt += ` Add the uploaded logo clearly on the side panel.`;
    }

    if (branding.slogan || branding.website || branding.phone) {
      prompt += ` Include the following text on or near the trailer:`;
      if (branding.slogan) prompt += ` Slogan: "${branding.slogan}".`;
      if (branding.website) prompt += ` Website: "${branding.website}".`;
      if (branding.phone) prompt += ` Phone: "${branding.phone}".`;
    }

    prompt += ` The final image must look like a professional product photo with realistic lighting and a clean neutral background.`;

    try {
      const OFFICIAL_IMAGES: Record<string, string> = {
        'single-cold': 'https://i.imgur.com/wzKkCcR.png',
        'double-hot': 'https://i.imgur.com/SaBAdqf.png',
      };

      const modelKey = selectedModel?.id?.toLowerCase() || '';
      const officialImageUrl = OFFICIAL_IMAGES[modelKey] || FALLBACK_IMAGE_URL;

      console.log('🖼️ Using reference image:', officialImageUrl);

      const image = await generateTrailerImage({
        modelImage: officialImageUrl,
        logoFile,
        themeName: selectedTheme.name,
        slogan: branding.slogan,
        website: branding.website,
        phone: branding.phone,
        prompt,
      });

      console.log('✅ AI generated image:', image);

      if (!image) {
        throw new Error('Image generation returned no result.');
      }

      setGeneratedImage(image);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedModel, selectedTheme, branding, logoFile]);

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `trailer-preview-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const previewImage = generatedImage || selectedModel?.imageUrl || FALLBACK_IMAGE_URL;
  const showFallback = !selectedModel && !generatedImage;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-wide">
          See How Your Future Trailer Will Look
        </h1>
      </header>
      
      <main className="w-full max-w-7xl bg-[#121b35] rounded-2xl neon-card-shadow text-white p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="flex flex-col">
          <Section title="1. Select a Model">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {TRAILER_MODELS.map(model => (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={`cursor-pointer bg-[#0b132b] p-3 rounded-lg transition-all duration-300 ${
                    selectedModel?.id === model.id
                      ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-400/30'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={model.imageUrl} alt={model.name} className="w-full h-auto object-cover rounded-md" />
                  <p className="text-center mt-3 font-semibold">{model.name}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="2. Choose a Color">
            <div className="flex flex-wrap gap-4">
              {COLOR_THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`px-5 py-2 rounded-lg font-semibold text-lg border-2 transition-all duration-300 ${
                    selectedTheme?.id === theme.id
                      ? `bg-white/10 border-transparent shadow-lg ${theme.glow}`
                      : 'border-white/30 hover:bg-white/5'
                  }`}
                >
                  <span className={`bg-gradient-to-r ${theme.gradientText} bg-clip-text text-transparent font-bold`}>
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="3. Add Your Branding">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                name="slogan"
                value={branding.slogan}
                onChange={handleBrandingChange}
                placeholder="Slogan"
                className="bg-[#0b132b] p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-400 outline-none transition"
              />
              <input
                name="website"
                value={branding.website}
                onChange={handleBrandingChange}
                placeholder="Website"
                className="bg-[#0b132b] p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-400 outline-none transition"
              />
              <input
                name="phone"
                value={branding.phone}
                onChange={handleBrandingChange}
                placeholder="Phone Number"
                className="bg-[#0b132b] p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-400 outline-none transition"
              />
              <div className="relative">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <label
                  htmlFor="logo-upload"
                  className="w-full h-full flex items-center justify-center bg-[#0b132b] p-3 rounded-md border border-dashed border-gray-600 hover:border-cyan-400 transition cursor-pointer"
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" className="max-h-8 object-contain" />
                  ) : (
                    <span className="text-gray-400">Upload Logo</span>
                  )}
                </label>
              </div>
            </div>
          </Section>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div
            className={`relative w-full max-w-[600px] aspect-[3/2] bg-[#0b132b] rounded-xl p-2 transition-all duration-500 shadow-2xl ${
              selectedTheme ? `${selectedTheme.glow}` : ''
            }`}
          >
            <img
              src={previewImage}
              onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE_URL)}
              alt="Trailer Preview"
              className="w-full h-full object-contain rounded-lg"
            />
            {showFallback && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <p className="text-gray-300">Select a model to begin</p>
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg backdrop-blur-sm">
                <svg
                  className="animate-spin -ml-1 mr-3 h-10 w-10 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-white mt-4">Generating your trailer...</p>
              </div>
            )}
          </div>

          <div className="w-full max-w-[600px] mt-6 flex flex-col items-center gap-4">
            {error && <p className="text-red-400 text-center">Error: {error}</p>}

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`w-full text-xl font-bold py-4 rounded-lg transition-all duration-300 text-white ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50'
              }`}
            >
              {isLoading ? 'Generating...' : 'Generate Image with AI'}
            </button>

            {generatedImage && !isLoading && (
  <button
    onClick={handleDownload}
    className={`w-full text-lg font-bold py-3 rounded-lg transition-all duration-300 bg-gradient-to-r ${
      selectedTheme?.gradientBorder || 'from-gray-500 to-gray-700'
    } text-white hover:scale-105 hover:shadow-lg ${selectedTheme?.glow}`}
  >
    Download Image
  </button>
)}

{/* AI transparency notice */}
<p className="text-sm text-gray-400 text-center mt-4 max-w-[600px] leading-snug">
  <strong>Note:</strong> Images are generated using artificial intelligence. 
  Some visual details may differ slightly from the real product. 
  If you notice inconsistencies, please regenerate the simulation for a more accurate preview.
</p>
</div>
</div>
</main>
</div>
);
}


