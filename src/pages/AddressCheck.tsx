/**
 * Address Check Page
 * 
 * Pre-wizard address verification and collection.
 * Per spec §3.1: "Welcome → Address check (no ticket). Prefill address; editable."
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { normalizePostalCodeNL, isValidPostalCodeNL, normalizeCity, validateAddress } from '@/modules/validation/address';
import { logAddressEvent } from '@/modules/api/logAddressEvent';
import { createAddressChangeRequest } from '@/modules/api/createAddressChangeRequest';
import { scrapeUserData, extractUsernameFromEmail, extractAddressFromScrapedData } from '@/modules/api/scrapeUserData';
import { LogoutButton } from '@/components/LogoutButton';


interface AddressForm {
  street: string;
  house_number: string;
  house_number_suffix: string;
  postal_code: string;
  city: string;
  telephone: string;
  country: string;
}


export const AddressCheck = () => {
  const navigate = useNavigate();
  const { user, supabase } = useAuth();
  const [loading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [scrapingLoading, setScrapingLoading] = useState(false);
  const [scrapingError, setScrapingError] = useState<string | null>(null);
  const [prefilledFields, setPrefilledFields] = useState<string[]>([]);
  
  const [form, setForm] = useState<AddressForm>({
    street: '',
    house_number: '',
    house_number_suffix: '',
    postal_code: '',
    city: '',
    telephone: '',
    country: 'NL'
  });

  // Scrape user data using email as username
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.email) {
        console.log('No user email available for data scraping');
        return;
      }

      console.log('=== STARTING USER DATA SCRAPING ===');
      console.log('User email:', user.email);
      
      setScrapingLoading(true);
      setScrapingError(null);

      try {
        // Extract username from email (part before @)
        const username = extractUsernameFromEmail(user.email);
        console.log('Extracted username:', username);

        // Try scraping with username first
        let result = await scrapeUserData({ username });
        
        // If username fails, try with full email
        if (!result.success) {
          console.log('Username scraping failed, trying with email:', user.email);
          result = await scrapeUserData({ email: user.email });
        }

        if (result.success && result.data) {
          console.log('User data scraped successfully:', result.data);
          setScrapedData(result.data);
          
          // Extract address data using robust extraction function
          const extractedAddress = extractAddressFromScrapedData(result.data);
          console.log('Extracted address for form prefilling:', extractedAddress);
          
          // Check if we got any meaningful address data
          const hasAddressData = extractedAddress.street || 
                                extractedAddress.house_number || 
                                extractedAddress.postal_code || 
                                extractedAddress.city;
          
          if (hasAddressData) {
            // Track which fields are being prefilled
            const filledFields: string[] = [];
            
            const newFormData = { ...form };
            
            if (extractedAddress.street) {
              newFormData.street = extractedAddress.street;
              filledFields.push('street');
            }
            if (extractedAddress.house_number) {
              newFormData.house_number = extractedAddress.house_number;
              filledFields.push('house_number');
            }
            if (extractedAddress.house_number_suffix) {
              newFormData.house_number_suffix = extractedAddress.house_number_suffix;
              filledFields.push('house_number_suffix');
            }
            if (extractedAddress.postal_code) {
              newFormData.postal_code = extractedAddress.postal_code;
              filledFields.push('postal_code');
            }
            if (extractedAddress.city) {
              newFormData.city = extractedAddress.city;
              filledFields.push('city');
            }
            if (extractedAddress.telephone) {
              newFormData.telephone = extractedAddress.telephone;
              filledFields.push('telephone');
            }
            
            setForm(newFormData);
            setPrefilledFields(filledFields);
            console.log('Form prefilled with extracted address data:', extractedAddress);
            console.log('Prefilled fields:', filledFields);
          } else {
            console.log('No usable address data found in scraped data');
          }
        } else {
          console.log('User data scraping failed:', result.error);
          setScrapingError(result.error || 'Failed to fetch user data');
        }
      } catch (err) {
        console.error('Error during user data scraping:', err);
        setScrapingError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setScrapingLoading(false);
      }
    };

    fetchUserData();
  }, [user?.email]);

  // Load prefilled address data from allowed_users (fallback)
  useEffect(() => {
    const loadPrefilledAddress = async () => {
      if (!user?.email) {
        console.log('No user email available for prefilling');
        return;
      }
      
      console.log('=== STARTING ADDRESS PREFILLING ===');
      console.log('User email:', user.email);
      
      try {
        console.log('Step 1: Ensuring profile exists for user:', user.email);
        console.log('User ID:', user.id);
        
        // First, ensure the user's profile exists (critical for RLS)
        console.log('About to query profiles table...');
        
        let profile: any = null;
        let profileError: any = null;
        
        try {
          console.log('Testing basic Supabase client...');
          console.log('Supabase client exists:', !!supabase);
          
          // Test if we can even make a basic call
          console.log('About to make first Supabase call...');
          console.log('Calling supabase.from("allowed_users")...');
          
          const query = supabase.from('allowed_users');
          console.log('Query object created:', query);
          
          console.log('Calling .select("email")...');
          const selectQuery = query.select('email');
          console.log('Select query created:', selectQuery);
          
          console.log('Calling .limit(1)...');
          const limitQuery = selectQuery.limit(1);
          console.log('Limit query created:', limitQuery);
          
          console.log('About to await the query...');
          const { data: testData, error: testError } = await limitQuery;
          
          console.log('Supabase connection test result:', { testData, testError });
          
          if (testError) {
            console.log('Supabase connection failed:', testError);
            return;
          }
          
          console.log('Supabase connection working, now querying profiles...');
          
          // Add a shorter timeout to see if it's hanging or just slow
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile query timeout')), 2000)
          );
          
          const queryPromise = supabase
            .from('profiles')
            .select('id, email')
            .eq('email', user.email)
            .single();
          
          const result = await Promise.race([queryPromise, timeoutPromise]) as any;
          
          profile = result.data;
          profileError = result.error;
          
          console.log('Profile query result:', { profile, profileError });
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.log('Profile query error:', profileError);
            return;
          }
        } catch (profileQueryError) {
          console.log('Profile query exception:', profileQueryError);
          return;
        }
        
        if (!profile) {
          console.log('Profile does not exist, creating one...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              auth_user_id: user.id,
              email: user.email,
              created_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (createError) {
            console.log('Failed to create profile:', createError);
            return;
          }
          console.log('Profile created successfully:', newProfile);
        } else {
          console.log('Profile already exists:', profile);
        }
        
        console.log('Step 2: Querying allowed_users table for:', user.email);
        
        // Debug: Check what RLS policies are affecting this query
        console.log('Current user auth state:', {
          userId: user.id,
          email: user.email,
          isAuthenticated: !!user
        });
        
        // Query canonical tenant address - debug what's in the table first
        console.log('Debugging tenant_addresses table...');
        console.log('Profile ID:', profile.id);
        console.log('User email:', user.email);
        
        // First, let's see all tenant addresses to debug
        const { data: allAddresses, error: debugError } = await supabase
          .from('tenant_addresses')
          .select('*');
        
        console.log('All tenant addresses:', { allAddresses, debugError });
        
        // Now try to find by profile_id
        const { data: tenantAddress, error: addressError } = await supabase
          .from('tenant_addresses')
          .select('id, street, house_number, house_number_suffix, postal_code, city, telephone, country, profile_id, is_current')
          .eq('profile_id', profile.id)
          .eq('is_current', true)
          .maybeSingle();
        
        console.log('Tenant address query result:', { tenantAddress, addressError });
        
        if (addressError) {
          console.log('Tenant address query error:', addressError);
          return;
        }
        
        if (!tenantAddress) {
          console.log('No tenant address found for profile_id:', profile.id);
          console.log('User can still use the form but no prefilling will occur');
          return;
        }
        
        console.log('Found tenant address data:', tenantAddress);
        
        const prefilledData = {
          street: tenantAddress.street || '',
          house_number: tenantAddress.house_number || '',
          house_number_suffix: tenantAddress.house_number_suffix || '',
          postal_code: tenantAddress.postal_code || '',
          city: tenantAddress.city || '',
          telephone: tenantAddress.telephone || '',
          country: tenantAddress.country || 'NL'
        };
        
        setForm(prev => ({
          ...prev,
          ...prefilledData
        }));
        
        console.log('Form prefilled successfully with:', prefilledData);
        
      } catch (err) {
        console.log('Database approach failed:', err);
      }
    };
    
    console.log('AddressCheck useEffect triggered, user:', user?.email);
    loadPrefilledAddress();
  }, [user?.email, supabase]);

  // Get or create wizard session ID
  const getWizardSessionId = (): string => {
    let sessionId = localStorage.getItem('wizard_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('wizard_session_id', sessionId);
    }
    return sessionId;
  };

  const handleInputChange = (field: keyof AddressForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError(null);
    if (isEditing) {
      setHasUnsavedChanges(true);
    }
  };

  const handlePostalCodeBlur = () => {
    const normalized = normalizePostalCodeNL(form.postal_code);
    if (normalized) {
      setForm(prev => ({ ...prev, postal_code: normalized }));
    }
  };

  const handleCityBlur = () => {
    const normalized = normalizeCity(form.city);
    setForm(prev => ({ ...prev, city: normalized }));
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      // Currently editing, save the changes
      await handleSave();
    } else {
      // Not editing, enter edit mode
      setIsEditing(true);
      setHasUnsavedChanges(false);
    }
  };

  const handleSave = async () => {
    if (!validateAddress(form)) {
      setError('Please fill in all required fields correctly');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const sessionId = getWizardSessionId();
      const userEmail = user?.email;
      
      if (!userEmail) {
        setError('User email not available');
        return;
      }

      // Normalize data before saving
      const normalizedPostalCode = normalizePostalCodeNL(form.postal_code) || form.postal_code;
      const normalizedCity = normalizeCity(form.city);

      // Create address change request (new data model)
      const changeRequestResult = await createAddressChangeRequest({
        email: userEmail,
        proposedAddress: {
          street: form.street,
          house_number: form.house_number,
          house_number_suffix: form.house_number_suffix,
          postal_code: normalizedPostalCode,
          city: normalizedCity,
          telephone: form.telephone
        },
        tenantNote: 'Address updated via wizard'
      }, supabase);
      
      if (!changeRequestResult.ok) {
        setError(changeRequestResult.error || 'Failed to submit address change request');
        return;
      }
      
      console.log('Address change request created:', changeRequestResult.requestId);

      // Log address event for tracking (optional - don't block on CORS errors)
      try {
        const eventResult = await logAddressEvent({
          wizard_session_id: sessionId,
          address: {
            street: form.street.trim(),
            house_number: form.house_number.trim(),
            house_number_suffix: form.house_number_suffix.trim(),
            postal_code: normalizedPostalCode,
            city: normalizedCity,
            telephone: form.telephone.trim(),
            country: 'NL'
          },
          profile_hint: {
            email: userEmail
          }
        });

        if (eventResult.ok) {
          console.log('Address event logged successfully:', eventResult.event_id);
        } else {
          console.warn('Failed to log address event (non-blocking):', eventResult.error);
        }
      } catch (eventError) {
        console.warn('Address event logging failed (non-blocking):', eventError);
      }

      setSaved(true);
      setIsEditing(false);
      setHasUnsavedChanges(false);
      console.log('Address change request submitted for approval');
      console.log('Address change request completed');
      console.log('Wizard session ID:', sessionId);
      
      // Show success message briefly
      setTimeout(() => {
        setSaved(false);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    navigate('/wizard');
  };



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative">
      <div className="mb-4">
        <LogoutButton />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Address Check</CardTitle>
          <CardDescription>
            Please verify your address before proceeding to the maintenance wizard.
            {user?.email && (
              <div className="mt-2 text-xs text-gray-500">
                Using email: <code className="bg-gray-100 px-1 rounded">{user.email}</code>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Data Scraping Status */}
          {scrapingLoading && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-600">🔍 Fetching your data...</p>
            </div>
          )}
          
          {scrapingError && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">⚠️ Could not fetch external data: {scrapingError}</p>
              <p className="text-xs text-yellow-600 mt-1">You can still enter your address manually below.</p>
            </div>
          )}
          
          {scrapedData && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">✅ Data retrieved successfully!</p>
              <details className="mt-2">
                <summary className="text-xs text-green-600 cursor-pointer hover:text-green-800">
                  View retrieved data
                </summary>
                <pre className="text-xs text-green-600 mt-2 p-2 bg-green-100 rounded overflow-auto max-h-32">
                  {JSON.stringify(scrapedData, null, 2)}
                </pre>
              </details>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="street" className="flex items-center gap-1">
              Street *
              {prefilledFields.includes('street') && (
                <span className="text-xs text-green-600" title="Auto-filled from your data">
                  ✓
                </span>
              )}
            </Label>
            <Input
              id="street"
              value={form.street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              placeholder="Enter street name"
              required
              readOnly={!isEditing}
              className={`${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''} ${
                prefilledFields.includes('street') ? 'border-green-300 bg-green-50' : ''
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="house_number" className="flex items-center gap-1">
                House Number *
                {prefilledFields.includes('house_number') && (
                  <span className="text-xs text-green-600" title="Auto-filled from your data">
                    ✓
                  </span>
                )}
              </Label>
              <Input
                id="house_number"
                value={form.house_number}
                onChange={(e) => handleInputChange('house_number', e.target.value)}
                placeholder="123"
                required
                readOnly={!isEditing}
                className={`${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''} ${
                  prefilledFields.includes('house_number') ? 'border-green-300 bg-green-50' : ''
                }`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="house_number_suffix" className="flex items-center gap-1">
                Suffix
                {prefilledFields.includes('house_number_suffix') && (
                  <span className="text-xs text-green-600" title="Auto-filled from your data">
                    ✓
                  </span>
                )}
              </Label>
              <Input
                id="house_number_suffix"
                value={form.house_number_suffix}
                onChange={(e) => handleInputChange('house_number_suffix', e.target.value)}
                placeholder="A"
                readOnly={!isEditing}
                className={`${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''} ${
                  prefilledFields.includes('house_number_suffix') ? 'border-green-300 bg-green-50' : ''
                }`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code" className="flex items-center gap-1">
              Postal Code *
              {prefilledFields.includes('postal_code') && (
                <span className="text-xs text-green-600" title="Auto-filled from your data">
                  ✓
                </span>
              )}
            </Label>
            <Input
              id="postal_code"
              value={form.postal_code}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
              onBlur={handlePostalCodeBlur}
              placeholder="1234 AB"
              required
              readOnly={!isEditing}
              className={`${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''} ${
                prefilledFields.includes('postal_code') ? 'border-green-300 bg-green-50' : ''
              }`}
            />
            {form.postal_code && !isValidPostalCodeNL(form.postal_code) && (
              <p className="text-sm text-red-600">Please enter a valid Dutch postal code (e.g., 1234 AB)</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="flex items-center gap-1">
              City *
              {prefilledFields.includes('city') && (
                <span className="text-xs text-green-600" title="Auto-filled from your data">
                  ✓
                </span>
              )}
            </Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              onBlur={handleCityBlur}
              placeholder="Amsterdam"
              required
              readOnly={!isEditing}
              className={`${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''} ${
                prefilledFields.includes('city') ? 'border-green-300 bg-green-50' : ''
              }`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephone" className="flex items-center gap-1">
              Telephone Number
              {prefilledFields.includes('telephone') && (
                <span className="text-xs text-green-600" title="Auto-filled from your data">
                  ✓
                </span>
              )}
            </Label>
            <Input
              id="telephone"
              type="tel"
              value={form.telephone}
              onChange={(e) => handleInputChange('telephone', e.target.value)}
              placeholder="+31 6 12345678"
              readOnly={!isEditing}
              className={`${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''} ${
                prefilledFields.includes('telephone') ? 'border-green-300 bg-green-50' : ''
              }`}
            />
          </div>



          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {saved && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">Address saved successfully!</p>
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button
              onClick={handleEditToggle}
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : (isEditing ? 'Save Address' : 'Edit Address')}
            </Button>
            <Button
              onClick={handleContinue}
              disabled={loading || isEditing || hasUnsavedChanges}
              variant="outline"
              className="flex-1"
            >
              Continue to Wizard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
