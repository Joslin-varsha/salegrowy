import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ShopifyAuth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState('Authenticating with Shopify...');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hmac = params.get('hmac');
    const host = params.get('host');
    const shop = params.get('shop');

    // PHASE 1: Entry from Shopify
    if (location.pathname === '/shopify') {
      const getAuthLink = async () => {
        if (shop) {
          // Save the shop link to localStorage for future use (like subscriptions)
          localStorage.setItem('shop_link', shop);

          try {
            setStatusMessage('Connecting to your store...');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vendor/getUrlLink`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                shopLink: shop
              })
            });

            const result = await response.json();

            if (result.success && result.data?.urlLink) {
                window.location.href = result.data.urlLink;
            } else {
              setStatusMessage('Failed to get authorization link. Please try again.');
            }
          } catch (error) {
            console.error("Error fetching auth link:", error);
            setStatusMessage('Server error. Please check your connection.');
          }
        } else {
          setStatusMessage('Invalid Shopify parameters. Missing "shop" in URL.');
        }
      };

      getAuthLink();
    }

    // PHASE 2: Callback from Shopify
    if (location.pathname === '/callback') {
      const finalizeAuth = async () => {
        const code = params.get('code');
        const shopLink = params.get('shop');
        await new Promise(resolve => setTimeout(resolve, 5000));
        if (shopLink) {
          localStorage.setItem('shop_link', shopLink);
        }

        if (!code) {
          setStatusMessage('No authorization code received.');
          return;
        }

        try {
          setStatusMessage('Finalizing authentication...');

          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vendor/getShopifyAccessToken`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              shopLink: shopLink,
              code: code
            })
          });

          const result = await response.json();
          
          setStatusMessage(`result data: ${result || 'Unknown datsa error'}`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          if (result?.access_token) {
            // Save the token and vendor_id
            localStorage.setItem('token', result.access_token);
            // if (result.data.vendor_id) {
            //   localStorage.setItem('vendor_id', result.vendor_id);
            // }

            setStatusMessage('Login successful! Redirecting to dashboard...');
            setTimeout(() => navigate('/register'), 1000);
          } else {
            setStatusMessage(`Finalization failed11: ${result.data || 'Unknown error'}`);
          }
        } catch (error) {
          console.error("Callback Error:", error);
          setStatusMessage('Error processing authentication callback. Please try again.');
        }
      };

      finalizeAuth();
    }
  }, [location, navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '1.5rem',
      backgroundColor: '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid #e2e8f0',
        borderTop: '4px solid #22c55e',
        borderRadius: '50%',
        animation: 'shopify-auth-spin 1s linear infinite'
      }}></div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem', fontWeight: 600 }}>Shopify Integration</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '0.95rem' }}>{statusMessage}</p>
      </div>
      <style>{`
        @keyframes shopify-auth-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ShopifyAuth;
