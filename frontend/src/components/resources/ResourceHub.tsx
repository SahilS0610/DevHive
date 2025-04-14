import { useState } from 'react';
import { motion } from 'framer-motion';
import { useResources } from '@/hooks/useResources';
import { ResourceType, Resource } from '@/types/resource';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Code,
  LayoutTemplate,
  BookOpen,
  Tool,
  Github,
  Gitlab,
  ExternalLink,
  Search,
  Plus,
  Archive,
  History,
  Download
} from 'lucide-react';

interface ResourceFilter {
  type: ResourceType | 'all';
  tags: string[];
  search: string;
}

interface ResourceCardProps {
  resource: Resource;
  onSelect: (resource: Resource) => void;
}

const ResourceTypeIcon = ({ type }: { type: ResourceType }) => {
  const icons = {
    [ResourceType.DOCUMENT]: FileText,
    [ResourceType.CODE]: Code,
    [ResourceType.TEMPLATE]: LayoutTemplate,
    [ResourceType.TUTORIAL]: BookOpen,
    [ResourceType.TOOL]: Tool
  };
  const Icon = icons[type];
  return <Icon className="h-5 w-5 text-gray-500" />;
};

const IntegrationIcon = ({ type }: { type: string }) => {
  const icons = {
    github: Github,
    gitlab: Gitlab,
    external: ExternalLink
  };
  const Icon = icons[type] || ExternalLink;
  return <Icon className="h-4 w-4" />;
};

const ResourceSearch = ({ onSearch }: { onSearch: (query: string) => void }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    <Input
      type="text"
      placeholder="Search resources..."
      className="pl-10 w-64"
      onChange={(e) => onSearch(e.target.value)}
    />
  </div>
);

const ResourceCard = ({ resource, onSelect }: ResourceCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <ResourceTypeIcon type={resource.type} />
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {resource.title}
              </h3>
              <p className="text-xs text-gray-500">
                {new Date(resource.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <IntegrationIcon type={resource.integration.type} />
            {resource.integration.type}
          </Badge>
        </div>

        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {resource.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {resource.metadata.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelect(resource)}
            >
              View Details
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(resource.integration.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* Handle download */}}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* Handle version history */}}
            >
              <History className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ResourceHub = () => {
  const { resources, isLoading } = useResources();
  const [filter, setFilter] = useState<ResourceFilter>({
    type: 'all',
    tags: [],
    search: ''
  });
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showNewResourceModal, setShowNewResourceModal] = useState(false);

  const filteredResources = resources?.filter(resource => {
    const matchesType = filter.type === 'all' || resource.type === filter.type;
    const matchesSearch = resource.title.toLowerCase().includes(filter.search.toLowerCase()) ||
                         resource.description.toLowerCase().includes(filter.search.toLowerCase());
    const matchesTags = filter.tags.length === 0 || 
                       filter.tags.every(tag => resource.metadata.tags.includes(tag));
    
    return matchesType && matchesSearch && matchesTags;
  });

  const handleResourceSelect = (resource: Resource) => {
    setSelectedResource(resource);
    setShowResourceModal(true);
  };

  const handleResourceCreate = async (resource: Partial<Resource>) => {
    // Implement resource creation logic
    setShowNewResourceModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Hub</h1>
          <p className="mt-1 text-sm text-gray-500">
            Access and manage all project resources and integrations
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <ResourceSearch onSearch={(q) => setFilter({ ...filter, search: q })} />
          <Select
            value={filter.type}
            onValueChange={(value) => setFilter({ ...filter, type: value as ResourceType | 'all' })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.values(ResourceType).map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="default"
            onClick={() => setShowNewResourceModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources?.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onSelect={handleResourceSelect}
          />
        ))}
      </div>

      {/* Resource Modals */}
      {selectedResource && (
        <ResourceDetailsModal
          resource={selectedResource}
          isOpen={showResourceModal}
          onClose={() => setShowResourceModal(false)}
        />
      )}
      
      <NewResourceModal
        isOpen={showNewResourceModal}
        onClose={() => setShowNewResourceModal(false)}
        onSubmit={handleResourceCreate}
      />
    </div>
  );
}; 