import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, AlertCircle, CheckCircle, Clock, Wrench } from 'lucide-react';
import { getMaintenanceLogs } from '@/modules/api/maintenanceLogs';
import type { MaintenanceLog } from '@/types/maintenance';

export const Logs: React.FC = () => {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMaintenanceLogs();
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: MaintenanceLog['status']) => {
    switch (status) {
      case 'submitted':
        return <Clock className="w-4 h-4" />;
      case 'in_review':
        return <Eye className="w-4 h-4" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: MaintenanceLog['status']) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Maintenance Logs
          </h1>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading logs...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Maintenance Logs
          </h1>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center text-red-800">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
              <Button 
                onClick={loadLogs} 
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Wrench className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Maintenance Logs
            </h1>
          </div>
          <Badge variant="secondary" className="text-sm">
            {logs.length} total logs
          </Badge>
        </div>

        {logs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No maintenance logs yet
                </h3>
                <p className="text-gray-500">
                  Maintenance logs will appear here when submitted through the wizard.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {log.issue_title}
                        </h3>
                        <Badge className={`flex items-center gap-1 ${getStatusColor(log.status)}`}>
                          {getStatusIcon(log.status)}
                          {log.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Path:</span> {log.issue_path.join(' → ')}
                      </div>
                      
                      {log.description && (
                        <p className="text-gray-700 mb-3">
                          {truncateText(log.description)}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(log.submitted_at)}
                        </div>
                        {log.photos && log.photos.length > 0 && (
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {log.photos.length} photo{log.photos.length !== 1 ? 's' : ''}
                          </div>
                        )}
                        {log.extra && (
                          <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            <span>Additional details</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                      className="ml-4"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Log Details Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Wrench className="w-5 h-5 mr-2" />
                    {selectedLog.issue_title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLog(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Status</h4>
                    <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(selectedLog.status)}`}>
                      {getStatusIcon(selectedLog.status)}
                      {selectedLog.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Issue Path</h4>
                    <p className="text-gray-700">{selectedLog.issue_path.join(' → ')}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Submitted</h4>
                    <p className="text-gray-700">{formatDate(selectedLog.submitted_at)}</p>
                  </div>
                  
                  {selectedLog.description && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedLog.description}</p>
                    </div>
                  )}
                  
                  {selectedLog.photos && selectedLog.photos.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Photos</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedLog.photos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="rounded-lg border max-h-32 object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedLog.extra && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Additional Details</h4>
                      <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
                        {JSON.stringify(selectedLog.extra, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
