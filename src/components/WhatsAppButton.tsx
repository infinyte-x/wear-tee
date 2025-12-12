import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle } from 'lucide-react';

interface StoreSettings {
  whatsapp_number?: string;
}

const WhatsAppButton = () => {
  const { data: settings } = useQuery({
    queryKey: ['site-content', 'store_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('key', 'store_settings')
        .maybeSingle();
      
      if (error) throw error;
      return data?.content as StoreSettings | null;
    },
  });

  const whatsappNumber = settings?.whatsapp_number;

  if (!whatsappNumber) return null;

  const handleClick = () => {
    const message = encodeURIComponent('Hello! I am interested in your products.');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </button>
  );
};

export default WhatsAppButton;
