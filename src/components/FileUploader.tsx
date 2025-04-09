
import React, { ChangeEvent, useState } from 'react';
import { Button } from '@/components/ui/button';

interface FileUploaderProps {
  id: string;
  label: string;
  className?: string;
  onChange: (file: File | null) => void;
  currentImage?: string | null;
}

const FileUploader = ({ id, label, className, onChange, currentImage }: FileUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);
    } else {
      setPreview(null);
      onChange(null);
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className || ''}`}>
      <div className={id === 'profilePicture' ? 'w-16 h-16 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-gray-100' : 'w-full h-20 rounded-md overflow-hidden border border-gray-300 flex items-center justify-center bg-gray-100'}>
        {preview ? (
          <img 
            src={preview} 
            alt={`${label} preview`} 
            className={id === 'profilePicture' ? 'w-full h-full object-cover' : 'w-full h-full object-cover'}
          />
        ) : (
          <span className="text-gray-400">pic</span>
        )}
      </div>
      <div>
        <input
          type="file"
          id={id}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor={id}>
          <Button 
            variant="outline" 
            className="cursor-pointer border-2 border-synvya-dark rounded-md py-2 px-4 bg-transparent text-synvya-dark hover:bg-gray-100"
            type="button"
            asChild
          >
            <span>file selector</span>
          </Button>
        </label>
      </div>
    </div>
  );
};

export default FileUploader;
