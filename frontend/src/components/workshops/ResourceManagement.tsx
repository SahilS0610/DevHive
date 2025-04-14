import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Video, Link, Download, Eye, Trash2, Upload, FolderPlus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const ResourceCard = ({ resource }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {resource.type === 'document' && <FileText className="h-5 w-5" />}
          {resource.type === 'video' && <Video className="h-5 w-5" />}
          {resource.type === 'link' && <Link className="h-5 w-5" />}
          <CardTitle className="text-lg">{resource.title}</CardTitle>
        </div>
        <Badge variant="outline">{resource.type}</Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">{resource.description}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Download className="mr-1 h-4 w-4" />
              <span>{resource.downloadCount}</span>
            </div>
            <div className="flex items-center">
              <Eye className="mr-1 h-4 w-4" />
              <span>{resource.viewCount}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const UploadProgress = ({ progress }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span>Uploading...</span>
      <span>{progress}%</span>
    </div>
    <Progress value={progress} />
  </div>
);

export const ResourceManagement = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedType, setSelectedType] = useState('document');
  const [resources, setResources] = useState([
    {
      id: 1,
      title: 'Introduction to React',
      description: 'A comprehensive guide to React fundamentals',
      type: 'document',
      downloadCount: 45,
      viewCount: 120,
    },
    {
      id: 2,
      title: 'Advanced State Management',
      description: 'Video tutorial on Redux and Context API',
      type: 'video',
      downloadCount: 30,
      viewCount: 85,
    },
    {
      id: 3,
      title: 'React Documentation',
      description: 'Official React documentation link',
      type: 'link',
      downloadCount: 0,
      viewCount: 65,
    },
  ]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        // Add the new resource
        setResources([
          ...resources,
          {
            id: resources.length + 1,
            title: file.name,
            description: 'New uploaded resource',
            type: selectedType,
            downloadCount: 0,
            viewCount: 0,
          },
        ]);
        setUploadProgress(0);
      }
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {selectedType === 'document' && <FileText className="mr-2 h-4 w-4" />}
                    {selectedType === 'video' && <Video className="mr-2 h-4 w-4" />}
                    {selectedType === 'link' && <Link className="mr-2 h-4 w-4" />}
                    {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedType('document')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Document
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedType('video')}>
                    <Video className="mr-2 h-4 w-4" />
                    Video
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedType('link')}>
                    <Link className="mr-2 h-4 w-4" />
                    Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex-1">
                {selectedType === 'link' ? (
                  <Input placeholder="Enter resource URL" />
                ) : (
                  <Input
                    type="file"
                    onChange={handleFileUpload}
                    accept={selectedType === 'document' ? '.pdf,.doc,.docx' : '.mp4,.mov'}
                  />
                )}
              </div>

              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>

            {uploadProgress > 0 && <UploadProgress progress={uploadProgress} />}
          </div>
        </CardContent>
      </Card>

      {/* Resource Organization */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Resources</CardTitle>
            <Button variant="outline" size="sm">
              <FolderPlus className="mr-2 h-4 w-4" />
              Create Folder
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Resources</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="links">Links</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map(resource => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="documents" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources
                  .filter(r => r.type === 'document')
                  .map(resource => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="videos" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources
                  .filter(r => r.type === 'video')
                  .map(resource => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="links" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources
                  .filter(r => r.type === 'link')
                  .map(resource => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}; 