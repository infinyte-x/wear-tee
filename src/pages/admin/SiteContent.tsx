import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';
import { Trash2 } from 'lucide-react';

interface HeroContent {
  headline: string;
  subheadline: string;
  description: string;
  image: string;
  button_text: string;
  button_link: string;
}

interface PhilosophyContent {
  title: string;
  description: string;
  image: string;
}

interface SeoContent {
  meta_title: string;
  meta_description: string;
}

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

type FeaturesContent = FeatureItem[];

const SiteContent = () => {
  const queryClient = useQueryClient();

  const [heroContent, setHeroContent] = useState<HeroContent>({
    headline: '',
    subheadline: '',
    description: '',
    image: '',
    button_text: '',
    button_link: '',
  });

  const [philosophyContent, setPhilosophyContent] = useState<PhilosophyContent>({
    title: '',
    description: '',
    image: '',
  });

  const [seoContent, setSeoContent] = useState<SeoContent>({
    meta_title: '',
    meta_description: '',
  });

  const [featuresContent, setFeaturesContent] = useState<FeaturesContent>([]);

  const { data: siteContent, isLoading } = useQuery({
    queryKey: ['site-content'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_content').select('*');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (siteContent) {
      const hero = siteContent.find((c) => c.key === 'hero');
      const philosophy = siteContent.find((c) => c.key === 'philosophy');
      const seo = siteContent.find((c) => c.key === 'seo');
      const features = siteContent.find((c) => c.key === 'features');

      if (hero) setHeroContent(hero.content as unknown as HeroContent);
      if (philosophy) setPhilosophyContent(philosophy.content as unknown as PhilosophyContent);
      if (seo) setSeoContent(seo.content as unknown as SeoContent);
      if (features) setFeaturesContent(features.content as unknown as FeaturesContent);
    }
  }, [siteContent]);

  const updateMutation = useMutation({
    mutationFn: async ({ key, content }: { key: string; content: any }) => {
      const { error } = await supabase
        .from('site_content')
        .update({ content: JSON.parse(JSON.stringify(content)) })
        .eq('key', key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
      toast.success('Content saved');
    },
    onError: () => toast.error('Failed to save content'),
  });

  const handleSaveHero = () => {
    updateMutation.mutate({ key: 'hero', content: heroContent });
  };

  const handleSavePhilosophy = () => {
    updateMutation.mutate({ key: 'philosophy', content: philosophyContent });
  };

  const handleSaveSeo = () => {
    updateMutation.mutate({ key: 'seo', content: seoContent });
  };

  const handleSaveFeatures = () => {
    updateMutation.mutate({ key: 'features', content: featuresContent });
  };

  const addFeature = () => {
    setFeaturesContent([
      ...featuresContent,
      { id: crypto.randomUUID(), title: 'New Feature', description: 'Feature description', icon: 'Star' }
    ]);
  };

  const updateFeature = (index: number, field: keyof FeatureItem, value: string) => {
    const newFeatures = [...featuresContent];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFeaturesContent(newFeatures);
  };

  const removeFeature = (index: number) => {
    setFeaturesContent(featuresContent.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Site Content</h1>
          <p className="text-muted-foreground mt-1">Manage homepage content and SEO settings</p>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList>
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="philosophy">Philosophy</TabsTrigger>
            <TabsTrigger value="seo">SEO Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="hero" className="space-y-6">
            <div className="bg-card border border-border p-6 space-y-4">
              <h2 className="text-lg font-serif">Hero Section</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Headline</label>
                  <Input
                    value={heroContent.headline}
                    onChange={(e) => setHeroContent({ ...heroContent, headline: e.target.value })}
                    placeholder="Main headline"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Subheadline</label>
                  <Input
                    value={heroContent.subheadline}
                    onChange={(e) => setHeroContent({ ...heroContent, subheadline: e.target.value })}
                    placeholder="Subheadline text"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={heroContent.description}
                  onChange={(e) => setHeroContent({ ...heroContent, description: e.target.value })}
                  placeholder="Hero description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Button Text</label>
                  <Input
                    value={heroContent.button_text}
                    onChange={(e) => setHeroContent({ ...heroContent, button_text: e.target.value })}
                    placeholder="Shop Collection"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Button Link</label>
                  <Input
                    value={heroContent.button_link}
                    onChange={(e) => setHeroContent({ ...heroContent, button_link: e.target.value })}
                    placeholder="/products"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Background Media (Image or Video URL)</label>
                <ImageUpload
                  images={heroContent.image ? [heroContent.image] : []}
                  onChange={(images) => setHeroContent({ ...heroContent, image: images[0] || '' })}
                  maxFiles={1}
                />
              </div>
              <Button onClick={handleSaveHero} disabled={updateMutation.isPending}>
                Save Hero Section
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="bg-card border border-border p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-serif">Features Section</h2>
                <Button variant="outline" size="sm" onClick={addFeature}>
                  + Add Feature
                </Button>
              </div>

              <div className="space-y-4">
                {featuresContent.map((feature, index) => (
                  <div key={feature.id} className="grid gap-4 p-4 border rounded-lg relative bg-background/50">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-destructive hover:text-destructive"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={feature.title}
                          onChange={(e) => updateFeature(index, 'title', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Icon Name (Lucide)</label>
                        <Input
                          value={feature.icon}
                          onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                          placeholder="e.g. Truck, Shield, Heart"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={feature.description}
                        onChange={(e) => updateFeature(index, 'description', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                {featuresContent.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No features added yet. Click "Add Feature" to start.
                  </div>
                )}
              </div>

              <Button onClick={handleSaveFeatures} disabled={updateMutation.isPending}>
                Save Features
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="philosophy" className="space-y-6">
            <div className="bg-card border border-border p-6 space-y-4">
              <h2 className="text-lg font-serif">Philosophy Section</h2>
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={philosophyContent.title}
                  onChange={(e) => setPhilosophyContent({ ...philosophyContent, title: e.target.value })}
                  placeholder="Section title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={philosophyContent.description}
                  onChange={(e) => setPhilosophyContent({ ...philosophyContent, description: e.target.value })}
                  placeholder="Philosophy description"
                  rows={5}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Image</label>
                <ImageUpload
                  images={philosophyContent.image ? [philosophyContent.image] : []}
                  onChange={(images) => setPhilosophyContent({ ...philosophyContent, image: images[0] || '' })}
                />
              </div>
              <Button onClick={handleSavePhilosophy} disabled={updateMutation.isPending}>
                Save Philosophy Section
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <div className="bg-card border border-border p-6 space-y-4">
              <h2 className="text-lg font-serif">SEO Settings</h2>
              <div>
                <label className="text-sm font-medium">Meta Title</label>
                <Input
                  value={seoContent.meta_title}
                  onChange={(e) => setSeoContent({ ...seoContent, meta_title: e.target.value })}
                  placeholder="Page title (max 60 characters)"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">{seoContent.meta_title.length}/60 characters</p>
              </div>
              <div>
                <label className="text-sm font-medium">Meta Description</label>
                <Textarea
                  value={seoContent.meta_description}
                  onChange={(e) => setSeoContent({ ...seoContent, meta_description: e.target.value })}
                  placeholder="Page description (max 160 characters)"
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">{seoContent.meta_description.length}/160 characters</p>
              </div>
              <Button onClick={handleSaveSeo} disabled={updateMutation.isPending}>
                Save SEO Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SiteContent;
