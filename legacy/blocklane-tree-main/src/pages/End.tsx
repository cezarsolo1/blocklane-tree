import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Phone, 
  Video, 
  User, 
  FileText,
  Home,
  ArrowLeft
} from 'lucide-react';
import { findNodeByPath, getPathSegments } from '@/lib/tree';
import { LeafNode } from '../../packages/core/types';

export default function End() {
  const { type } = useParams<{ type: string }>();
  const [searchParams] = useSearchParams();
  const path = searchParams.get('path');
  
  let node: LeafNode | null = null;
  if (path) {
    const pathSegments = getPathSegments(path);
    const foundNode = findNodeByPath(pathSegments);
    if (foundNode?.type === 'leaf') {
      node = foundNode as LeafNode;
    }
  }

  const getContentForType = () => {
    switch (type?.toLowerCase()) {
      case 'emergency':
        return {
          title: 'Noodsituatie',
          icon: <AlertTriangle className="h-8 w-8 text-red-600" />,
          variant: 'destructive' as const,
          content: (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-base">
                  <strong>Let op: Dit is een noodsituatie!</strong>
                </AlertDescription>
              </Alert>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="font-semibold text-red-900 mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Bel direct 112
                </h3>
                <p className="text-red-800 mb-4">
                  Voor noodsituaties zoals gaslekkages, wateroverlast, of gevaarlijke situaties, 
                  bel direct de hulpdiensten op 112.
                </p>
                <div className="space-y-2 text-sm text-red-700">
                  <p><strong>Bij gaslekkage:</strong> Ventileer de ruimte, gebruik geen elektriciteit, en verlaat het gebouw.</p>
                  <p><strong>Bij wateroverlast:</strong> Schakel elektriciteit uit in het getroffen gebied.</p>
                  <p><strong>Bij gevaar:</strong> Verlaat de gevaarlijke situatie en waarschuw anderen.</p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Na de noodsituatie</h4>
                <p className="text-gray-700 text-sm">
                  Wanneer de situatie veilig is, kunt u een melding maken via ons systeem 
                  voor eventuele herstelwerkzaamheden.
                </p>
              </div>
            </div>
          )
        };

      case 'responsibility':
        return {
          title: 'Uw verantwoordelijkheid',
          icon: <User className="h-8 w-8 text-yellow-600" />,
          variant: 'secondary' as const,
          content: (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-semibold text-yellow-900 mb-4">
                  Dit onderhoud valt onder uw verantwoordelijkheid
                </h3>
                <p className="text-yellow-800 mb-4">
                  Het probleem dat u heeft geselecteerd behoort tot het onderhoud dat door de huurder 
                  uitgevoerd dient te worden volgens de huurovereenkomst.
                </p>

                <div className="space-y-3">
                  <h4 className="font-medium text-yellow-900">Aanbevolen stappen:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                    <li>Controleer eerst of u het probleem zelf kunt oplossen</li>
                    <li>Raadpleeg de handleiding van het apparaat indien van toepassing</li>
                    <li>Bij twijfel kunt u contact opnemen met een erkende monteur</li>
                    <li>Bewaar bon/factuur voor eventuele garantie</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Hulp nodig?</h4>
                <p className="text-blue-800 text-sm">
                  Als u er niet uitkomt of als het probleem groter blijkt dan verwacht, 
                  kunt u alsnog een melding maken via ons systeem.
                </p>
              </div>
            </div>
          )
        };

      case 'fix-video':
        return {
          title: 'Instructievideo',
          icon: <Video className="h-8 w-8 text-blue-600" />,
          variant: 'default' as const,
          content: (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Probeer het eerst zelf
                </h3>
                <p className="text-blue-800 mb-4">
                  Voor dit probleem hebben we een instructievideo beschikbaar. 
                  Volg de stappen in de video om het probleem mogelijk zelf op te lossen.
                </p>

                {node?.videoUrl ? (
                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="font-medium mb-2">Instructievideo</h4>
                    <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                      <p className="text-gray-500">Video wordt hier geladen...</p>
                      {/* TODO: Embed actual video */}
                    </div>
                    <Button asChild className="mt-4 w-full">
                      <a href={node.videoUrl} target="_blank" rel="noopener noreferrer">
                        Video openen in nieuw venster
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Video className="h-12 w-12 mx-auto mb-2" />
                        <p>Instructievideo komt binnenkort beschikbaar</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Lukt het niet?</h4>
                <p className="text-green-800 text-sm">
                  Als de stappen in de video niet hebben geholpen, kunt u alsnog een melding maken. 
                  We zorgen er dan voor dat een monteur langskomt.
                </p>
              </div>
            </div>
          )
        };

      case 'describe':
        return {
          title: 'Beschrijving vereist',
          icon: <FileText className="h-8 w-8 text-green-600" />,
          variant: 'outline' as const,
          content: (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Meer informatie nodig
                </h3>
                <p className="text-green-800 mb-4">
                  Voor dit type probleem hebben we meer details nodig om u goed te kunnen helpen. 
                  U kunt een melding maken met een gedetailleerde beschrijving van het probleem.
                </p>

                <div className="space-y-3">
                  <h4 className="font-medium text-green-900">Denk hierbij aan:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                    <li>Wanneer is het probleem ontstaan?</li>
                    <li>Hoe vaak doet het probleem zich voor?</li>
                    <li>Zijn er bijzondere omstandigheden?</li>
                    <li>Wat heeft u al geprobeerd?</li>
                    <li>Voeg foto's toe indien mogelijk</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Volgende stap</h4>
                <p className="text-blue-800 text-sm">
                  Ga verder met de melding om een gedetailleerde beschrijving te geven. 
                  Hoe meer informatie u verstrekt, hoe beter we u kunnen helpen.
                </p>
              </div>
            </div>
          )
        };

      default:
        return {
          title: 'Onbekend type',
          icon: <AlertTriangle className="h-8 w-8 text-gray-600" />,
          variant: 'outline' as const,
          content: (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Er is een onbekend probleem type opgegeven.
              </p>
            </div>
          )
        };
    }
  };

  const { title, icon, variant, content } = getContentForType();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <div className="bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/logos/keij-stefels-final.jpg" alt="Keij Stefels" className="h-32" />
              <h1 className="text-xl font-semibold text-foreground">Melding Resultaat</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Powered by</span>
              <img src="/logos/blocklane-final.png" alt="Blocklane" className="h-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {icon}
              </div>
              <CardTitle className="text-2xl mb-2">{title}</CardTitle>
              {node && (
                <Badge variant={variant} className="w-fit mx-auto">
                  {node.label}
                </Badge>
              )}
            </CardHeader>
            
            <CardContent>
              {content}
              
              {/* Navigation */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t">
                <Button variant="outline" asChild className="flex-1">
                  <Link to="/wizard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Terug naar wizard
                  </Link>
                </Button>
                
                {type !== 'emergency' && type !== 'responsibility' && (
                  <Button asChild className="flex-1">
                    <Link to="/wizard">
                      Alsnog melding maken
                    </Link>
                  </Button>
                )}
                
                <Button variant="outline" asChild className="flex-1">
                  <Link to="/">
                    <Home className="h-4 w-4 mr-2" />
                    Naar homepagina
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}