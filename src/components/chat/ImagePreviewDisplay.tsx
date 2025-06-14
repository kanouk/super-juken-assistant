
import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface ImagePreviewDisplayProps {
  imagePreview: string;
  onRemoveImage: () => void;
}

const ImagePreviewDisplay: React.FC<ImagePreviewDisplayProps> = ({ imagePreview, onRemoveImage }) => {
  return (
    <div className="mb-3 relative inline-block">
      <img
        src={imagePreview}
        alt="Preview"
        className="max-w-32 max-h-32 rounded-lg border border-gray-200"
      />
      <Button
        size="sm"
        variant="destructive"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
        onClick={onRemoveImage}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default ImagePreviewDisplay;
