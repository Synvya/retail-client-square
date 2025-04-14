
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Package } from 'lucide-react';
import { toast } from 'sonner';
import { publishProducts } from '@/services/api';

interface PublishActionsProps {
  handlePublishLocations: () => Promise<void>;
  isPublishingLocations: boolean;
}

const PublishActions: React.FC<PublishActionsProps> = ({ 
  handlePublishLocations, 
  isPublishingLocations 
}) => {
  const [isPublishingProducts, setIsPublishingProducts] = useState(false);

  const handlePublishProducts = async () => {
    setIsPublishingProducts(true);
    
    try {
      const result = await publishProducts();
      console.log('Products publish result:', result);
      
      if (result && result.success) {
        toast.success('Products published successfully!');
      } else {
        // Safely access the error message with optional chaining and fallback
        const errorMessage = result.data?.message || 'Failed to publish products.';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error publishing products:', error);
      toast.error('An error occurred while publishing products.');
    } finally {
      setIsPublishingProducts(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 pt-4 w-full">
      <Separator className="my-4 bg-synvya-dark/20 h-[2px] w-full" />
      
      <div className="text-lg font-medium text-synvya-dark self-start mb-2">Publish:</div>
      
      <div className="flex justify-center gap-4 w-full">
        <Button
          type="button"
          onClick={handlePublishLocations}
          disabled={isPublishingLocations}
          className="rounded-full border-2 border-synvya-dark bg-white text-synvya-dark hover:bg-gray-50 text-lg py-6 px-16"
          variant="outline"
        >
          <MapPin className="mr-2" />
          {isPublishingLocations ? 'Publishing...' : 'Locations'}
        </Button>
        
        <Button
          type="button"
          onClick={handlePublishProducts}
          disabled={isPublishingProducts}
          className="rounded-full border-2 border-synvya-dark bg-white text-synvya-dark hover:bg-gray-50 text-lg py-6 px-16"
          variant="outline"
        >
          <Package className="mr-2" />
          {isPublishingProducts ? 'Publishing...' : 'Products'}
        </Button>
      </div>
    </div>
  );
};

export default PublishActions;
