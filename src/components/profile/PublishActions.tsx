
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Package } from 'lucide-react';

interface PublishActionsProps {
  handlePublishLocations: () => Promise<void>;
  isPublishingLocations: boolean;
}

const PublishActions: React.FC<PublishActionsProps> = ({ 
  handlePublishLocations, 
  isPublishingLocations 
}) => {
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
          className="rounded-full border-2 border-synvya-dark bg-white text-synvya-dark hover:bg-gray-50 text-lg py-6 px-16"
          variant="outline"
        >
          <Package className="mr-2" />
          Products
        </Button>
      </div>
    </div>
  );
};

export default PublishActions;
