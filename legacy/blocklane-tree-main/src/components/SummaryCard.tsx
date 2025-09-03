import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketData } from '../../packages/core/types';
import { MapPin, User, Phone, Mail, Camera, FileText, Calendar, Clock } from 'lucide-react';
import { keysToLabels } from '@/lib/tree';

interface SummaryCardProps {
  data: TicketData;
  className?: string;
}

export const SummaryCard = ({ data, className }: SummaryCardProps) => {

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Samenvatting melding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Problem Path */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Probleem</h4>
          <p className="text-sm">
            {Array.isArray(data.decisionPath) && data.decisionPath.length
              ? keysToLabels(data.decisionPath).join(' → ')
              : 'Onbekend probleem'}
          </p>
        </div>

        {/* Description */}
        {data.description && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium text-sm text-muted-foreground">Beschrijving</h4>
            </div>
            <p className="text-sm text-foreground">{data.description}</p>
          </div>
        )}

        {/* Photos */}
        {data.photoPaths.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Camera className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium text-sm text-muted-foreground">Foto's</h4>
            </div>
            <p className="text-sm text-foreground">
              {data.photoPaths.length} foto{data.photoPaths.length !== 1 ? "'s" : ''} toegevoegd
            </p>
          </div>
        )}

        {/* Address */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-sm text-muted-foreground">Adres</h4>
          </div>
          <div className="text-sm text-foreground">
            <p>{data.streetAddress}</p>
            <p>{data.postalCode} {data.city}</p>
          </div>
        </div>

        {/* Appointment */}
        {(data as any).appointmentDate && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium text-sm text-muted-foreground">Afspraak</h4>
            </div>
            <div className="text-sm text-foreground space-y-1">
              <p>{(data as any).appointmentDate}</p>
              {(data as any).appointmentTimeSlot && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{(data as any).appointmentTimeSlot}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Availability */}
        {data.availability && Object.keys(data.availability).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium text-sm text-muted-foreground">Beschikbaarheid</h4>
            </div>
            <div className="text-sm text-foreground space-y-1">
              {Object.entries(data.availability).map(([date, times]) => (
                <p key={date}>
                  <span className="font-medium">{new Date(date).toLocaleDateString('nl-NL', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}:</span> {times.join(', ')}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Occupant Info */}
        {data.occupant && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium text-sm text-muted-foreground">Bewoner/Huurder</h4>
            </div>
            <div className="text-sm text-foreground space-y-1">
              <p>{data.occupant.name}</p>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span>{data.occupant.phone}</span>
              </div>
              {data.occupant.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span>{data.occupant.email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional details for AUTO_SEND */}
        {data.hasPets && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-muted-foreground">🐕</span>
              <h4 className="font-medium text-sm text-muted-foreground">Huisdieren</h4>
            </div>
            <p className="text-sm text-foreground">
              {data.petDetails || "Er zijn huisdieren in huis"}
            </p>
          </div>
        )}

        {data.hasAlarm && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-muted-foreground">🚨</span>
              <h4 className="font-medium text-sm text-muted-foreground">Alarm systeem</h4>
            </div>
            <p className="text-sm text-foreground">
              {data.alarmDetails || "Er is een alarmsysteem aanwezig"}
            </p>
          </div>
        )}

        {data.accessMethod && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-muted-foreground">🗝️</span>
              <h4 className="font-medium text-sm text-muted-foreground">Toegang</h4>
            </div>
            <div className="text-sm text-foreground space-y-1">
              <p>Methode: {data.accessMethod === 'intercom' ? 'Via intercom' : data.accessMethod === 'keybox' ? 'Sleutelkluis' : data.accessMethod === 'neighbor' ? 'Via buren' : data.accessMethod === 'personal' ? 'Persoonlijk aanwezig' : data.accessMethod}</p>
              {data.intercomDetails && <p>Intercom: {data.intercomDetails}</p>}
              {data.keyBoxDetails && <p>Sleutelkluis: {data.keyBoxDetails}</p>}
              {data.neighborDetails && <p>Buren: {data.neighborDetails}</p>}
            </div>
          </div>
        )}

        {data.notesForContractor && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium text-sm text-muted-foreground">Opmerkingen voor monteur</h4>
            </div>
            <p className="text-sm text-foreground">{data.notesForContractor}</p>
          </div>
        )}

        {/* Contact */}
        {data.contactName && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium text-sm text-muted-foreground">Contactgegevens</h4>
            </div>
            <div className="text-sm text-foreground space-y-1">
              <p>{data.contactName}</p>
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span>{data.contactEmail}</span>
              </div>
              {data.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span>{data.contactPhone}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};