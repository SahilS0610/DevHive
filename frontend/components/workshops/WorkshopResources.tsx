import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Video, Link, Code, Download, ExternalLink, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { WorkshopResource } from '@/types/workshop.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface WorkshopResourcesProps {
  resources: WorkshopResource[];
  canUpload?: boolean;
  onUpload?: (file: File) => Promise<void>;
}

const ResourceIcon = ({ type }: { type: WorkshopResource['type'] }) => {
  const icons = {
    document: FileText,
    video: Video,
    link: Link,
    code: Code,
  };
  const Icon = icons[type];
  return <Icon className="h-5 w-5" />;
};

const ResourceUploadDialog = ({ onUpload }: { onUpload: (file: File) => Promise<void> }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
      setFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Resource
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Resource</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const WorkshopResources = ({ resources, canUpload, onUpload }: WorkshopResourcesProps) => {
  const [filter, setFilter] = useState<WorkshopResource['type'] | 'all'>('all');

  const filteredResources = resources.filter(
    resource => filter === 'all' || resource.type === filter
  );

  const resourceTypes: Array<{ type: WorkshopResource['type']; label: string }> = [
    { type: 'document', label: 'Documents' },
    { type: 'video', label: 'Videos' },
    { type: 'link', label: 'Links' },
    { type: 'code', label: 'Code' },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Resources</h2>
        {canUpload && onUpload && <ResourceUploadDialog onUpload={onUpload} />}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'rounded-lg',
            filter === 'all' && 'bg-slate-100'
          )}
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        {resourceTypes.map(({ type, label }) => (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            className={cn(
              'rounded-lg',
              filter === type && 'bg-slate-100'
            )}
            onClick={() => setFilter(type)}
          >
            <ResourceIcon type={type} />
            <span className="ml-2">{label}</span>
          </Button>
        ))}
      </div>

      {/* Resources List */}
      <AnimatePresence>
        <div className="space-y-4">
          {filteredResources.map((resource) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-start space-x-4 p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="p-2 bg-slate-100 rounded-lg">
                <ResourceIcon type={resource.type} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-slate-800">
                  {resource.title}
                </h3>
                {resource.description && (
                  <p className="text-sm text-slate-600 mt-1">
                    {resource.description}
                  </p>
                )}
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center text-xs text-slate-500">
                    <Avatar
                      src={resource.uploadedBy.avatar}
                      size="sm"
                      className="mr-2"
                    />
                    <span>{resource.uploadedBy.name}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {format(resource.uploadedAt, 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0"
                asChild
              >
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {resource.type === 'link' ? (
                    <ExternalLink className="h-4 w-4" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </a>
              </Button>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </Card>
  );
}; 