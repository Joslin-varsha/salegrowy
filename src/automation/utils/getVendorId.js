/**
 * Fetches the vendor's numeric ID (vendors__id) from the profile API.
 * Caches the result in memory so we only call the API once per session.
 *
 * Profile API: https://salegrowymail.com/api/vendor/profile
 * Response path: data.user.vendors__id
 */

let cachedVendorId = null;

export async function getVendorId() {
    // Return cached value if already fetched
    if (cachedVendorId !== null) return cachedVendorId;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vendor/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });

        const result = await response.json();

        if (result.success && result.data && result.data.user && result.data.user.vendors__id) {
            cachedVendorId = result.data.user.vendors__id;
            return cachedVendorId;
        }

        // Fallback to localStorage vendor_id if profile API fails
        console.warn('getVendorId: Could not get vendors__id from profile, falling back to localStorage');
        return localStorage.getItem('vendor_id');
    } catch (error) {
        console.error('getVendorId: Error fetching vendor profile:', error);
        // Fallback to localStorage vendor_id on error
        return localStorage.getItem('vendor_id');
    }
}
