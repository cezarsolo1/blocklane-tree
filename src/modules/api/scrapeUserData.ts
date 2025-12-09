/**
 * User Data Scraping API Service
 * 
 * Integrates with the external scraping service to fetch user data
 * using the authenticated user's email as username.
 */

interface ScrapeUserDataRequest {
  username?: string;
  email?: string;
}

interface ScrapeUserDataResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Scrape user data from external service using email/username
 */
export const scrapeUserData = async (params: ScrapeUserDataRequest): Promise<ScrapeUserDataResponse> => {
  try {
    console.log('Scraping user data for:', params);
    
    const response = await fetch('https://gmucgvuxtgkoiqduhvua.supabase.co/functions/v1/scrape-user-data', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdWNndnV4dGdrb2lxZHVodnVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTMyNTcsImV4cCI6MjA4MDE2OTI1N30.rUQlMQt3DRIcfWa947DHUatRvajJRGsu2IqZAjAGIZQ',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Scraped user data:', data);
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error scraping user data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Extract username from email (part before @)
 */
export const extractUsernameFromEmail = (email: string): string => {
  return email.split('@')[0].toUpperCase();
};

/**
 * Extract address data from scraped user data
 * Handles various possible data structures from the API
 */
export const extractAddressFromScrapedData = (data: any) => {
  console.log('Extracting address from scraped data:', data);
  
  // Initialize empty address object
  const address = {
    street: '',
    house_number: '',
    house_number_suffix: '',
    postal_code: '',
    city: '',
    telephone: ''
  };

  if (!data) {
    console.log('No data provided for address extraction');
    return address;
  }

  // Try different possible data structures
  let addressSource = null;

  // Check if data has nested data property with address info (your API format)
  if (data.data && (data.data.adres || data.data.post_adres)) {
    addressSource = data.data;
    console.log('Found address in data.data:', addressSource);
  }
  // Check if data has direct address property
  else if (data.address) {
    addressSource = data.address;
    console.log('Found address in data.address:', addressSource);
  }
  // Check if data has tenant_info with address
  else if (data.tenant_info && data.tenant_info.address) {
    addressSource = data.tenant_info.address;
    console.log('Found address in data.tenant_info.address:', addressSource);
  }
  // Check if data has user_info with address
  else if (data.user_info && data.user_info.address) {
    addressSource = data.user_info.address;
    console.log('Found address in data.user_info.address:', addressSource);
  }
  // Check if data itself contains address fields
  else if (data.street || data.straat || data.adres) {
    addressSource = data;
    console.log('Found address fields directly in data:', addressSource);
  }
  // Check for Dutch field names
  else if (data.adres_gegevens) {
    addressSource = data.adres_gegevens;
    console.log('Found address in data.adres_gegevens:', addressSource);
  }

  if (addressSource) {
    // Handle combined address format (like "Paulus Potterstraat TEST 1")
    if (addressSource.adres && !addressSource.street) {
      const adresStr = addressSource.adres.trim();
      console.log('Parsing combined address:', adresStr);
      
      // Try to extract street and house number from combined string
      // Pattern: "Street Name NUMBER SUFFIX" or "Street Name NUMBER"
      const addressMatch = adresStr.match(/^(.+?)\s+([A-Z]*\s*\d+[A-Z]*)\s*(.*)$/);
      if (addressMatch) {
        address.street = addressMatch[1].trim();
        const houseNumberPart = addressMatch[2].trim();
        const suffix = addressMatch[3].trim();
        
        // Further parse house number and suffix
        const houseMatch = houseNumberPart.match(/^([A-Z]*\s*)(\d+)([A-Z]*)$/);
        if (houseMatch) {
          address.house_number = houseMatch[2];
          address.house_number_suffix = (houseMatch[1] + houseMatch[3] + ' ' + suffix).trim();
        } else {
          address.house_number = houseNumberPart;
          address.house_number_suffix = suffix;
        }
        
        console.log('Parsed address components:', {
          street: address.street,
          house_number: address.house_number,
          suffix: address.house_number_suffix
        });
      } else {
        // Fallback: use the whole string as street
        address.street = adresStr;
      }
    }
    
    // Handle combined postal code + city format (like "1071 DB AMSTERDAM")
    if (addressSource.post_adres && !addressSource.postal_code && !addressSource.city) {
      const postAdresStr = addressSource.post_adres.trim();
      console.log('Parsing combined postal address:', postAdresStr);
      
      // Pattern: "1234 AB CITY NAME"
      const postMatch = postAdresStr.match(/^(\d{4}\s*[A-Z]{2})\s+(.+)$/);
      if (postMatch) {
        address.postal_code = postMatch[1].replace(/\s+/g, ' ').trim();
        address.city = postMatch[2].trim();
        
        console.log('Parsed postal components:', {
          postal_code: address.postal_code,
          city: address.city
        });
      } else {
        // Fallback: use the whole string as city
        address.city = postAdresStr;
      }
    }
    
    // Map standard field names (if not already parsed above)
    if (!address.street) {
      address.street = addressSource.street || 
                      addressSource.straat || 
                      addressSource.streetname || 
                      addressSource.straatnaam || 
                      '';
    }

    if (!address.house_number) {
      address.house_number = String(addressSource.house_number || 
                                   addressSource.huisnummer || 
                                   addressSource.number || 
                                   addressSource.nr || 
                                   '');
    }

    if (!address.house_number_suffix) {
      address.house_number_suffix = addressSource.house_number_suffix || 
                                   addressSource.toevoeging || 
                                   addressSource.suffix || 
                                   '';
    }

    if (!address.postal_code) {
      address.postal_code = addressSource.postal_code || 
                           addressSource.postcode || 
                           addressSource.zip_code || 
                           addressSource.zipcode || 
                           '';
    }

    if (!address.city) {
      address.city = addressSource.city || 
                    addressSource.stad || 
                    addressSource.plaats || 
                    addressSource.woonplaats || 
                    '';
    }

    address.telephone = addressSource.telephone || 
                       addressSource.telefoon || 
                       addressSource.phone || 
                       addressSource.tel || 
                       '';

    console.log('Final extracted address data:', address);
  } else {
    console.log('No address data found in any expected structure');
  }

  return address;
};
