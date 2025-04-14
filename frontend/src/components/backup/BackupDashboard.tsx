import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, HardDrive, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useBackupStatus } from '@/hooks/useBackupStatus';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatBytes, formatDate } from '@/utils/formatters';

interface BackupStats {
  totalSize: number;
  lastBackupDate: Date;
  successRate: number;
  history: BackupHistory[];
  recoveryPoints: RecoveryPoint[];
}

interface BackupHistory {
  id: string;
  type: 'full' | 'incremental';
  status: 'completed' | 'failed';
  size: number;
  date: Date;
}

interface RecoveryPoint {
  id: string;
  date: Date;
  type: 'full' | 'incremental';
  size: number;
  status: 'available' | 'expired';
}

export const BackupDashboard = () => {
  const { backups, isLoading } = useBackupStatus();
  const [selectedType, setSelectedType] = useState<'full' | 'incremental'>('full');

  const handleBackupInitiation = async (type: 'full' | 'incremental') => {
    try {
      // Implement backup initiation logic
      console.log(`Initiating ${type} backup...`);
    } catch (error) {
      console.error('Failed to initiate backup:', error);
    }
  };

  const handleRestore = async (recoveryPointId: string) => {
    try {
      // Implement restore logic
      console.log(`Restoring from recovery point ${recoveryPointId}...`);
    } catch (error) {
      console.error('Failed to restore backup:', error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Backup Management
          </h2>
          <p className="text-sm text-gray-500">
            Monitor and manage system backups
          </p>
        </div>
        <div className="flex space-x-4">
          <Tabs defaultValue={selectedType} onValueChange={(value) => setSelectedType(value as 'full' | 'incremental')}>
            <TabsList>
              <TabsTrigger value="full">Full Backup</TabsTrigger>
              <TabsTrigger value="incremental">Incremental</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="primary"
            onClick={() => handleBackupInitiation(selectedType)}
            disabled={isLoading}
          >
            Create Backup
          </Button>
        </div>
      </div>

      {/* Backup Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBytes(backups?.totalSize)}</div>
              <Progress value={75} className="mt-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDate(backups?.lastBackupDate)}</div>
              <Badge variant="outline" className="mt-2">
                {backups?.lastBackupType}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{backups?.successRate}%</div>
              <Progress value={backups?.successRate} className="mt-2" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Backup History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Backup History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {backups?.history.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {backup.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">{formatDate(backup.date)}</div>
                      <div className="text-sm text-gray-500">{backup.type} backup</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">{formatBytes(backup.size)}</div>
                    <Badge variant={backup.status === 'completed' ? 'success' : 'destructive'}>
                      {backup.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recovery Points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recovery Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {backups?.recoveryPoints.map((point) => (
                <div
                  key={point.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">{formatDate(point.date)}</div>
                      <div className="text-sm text-gray-500">{point.type} backup</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">{formatBytes(point.size)}</div>
                    <Badge variant={point.status === 'available' ? 'default' : 'secondary'}>
                      {point.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(point.id)}
                      disabled={point.status !== 'available'}
                    >
                      Restore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}; 