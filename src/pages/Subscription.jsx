import React, { useState, useEffect } from 'react';
import { Check, X, Shield, Star, Zap, Crown, Loader2 } from 'lucide-react';

const Subscription = () => {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [userData, setUserData] = useState({ vendor_id: '', shopLink: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const vId = localStorage.getItem('vendor_id') || '';
        let sLink = localStorage.getItem('shop_link') || '';

        // Check URL params first
        const urlParams = new URLSearchParams(window.location.search);
        const shopParam = urlParams.get('shop');
        if (shopParam) {
          sLink = shopParam;
          localStorage.setItem('shop_link', shopParam);
        }

        // Fetch business details to get the website/shopLink
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vendor/details`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const result = await res.json();
        
        if (result.success && result.data) {
          sLink = result.data.website || result.data.shopLink || sLink;
          if (sLink) localStorage.setItem('shop_link', sLink);
        }

        setUserData({ vendor_id: vId, shopLink: sLink });
      } catch (err) {
        console.error("Error fetching user data for subscription:", err);
      }
    };

    fetchUserData();
  }, []);

  const handleBuyPlan = async (planName) => {
    setLoadingPlan(planName);
    try {
      // Refresh shopLink from localStorage just in case state is stale
      const currentShopLink = userData.shopLink || localStorage.getItem('shop_link') || '';

      const payload = {
        shopLink: currentShopLink,
        plan: planName.toLowerCase(),
        vendor_id: userData.vendor_id || localStorage.getItem('vendor_id') || ''
      };
      
      console.log("Initiating subscription with payload:", payload);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vendor/createSubscription`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.success && result.confirmationUrl) {
        // Open the Shopify confirmation URL
        window.location.href = result.confirmationUrl;
      } else {
        alert(result.message || "Failed to initiate subscription. Please check your Shopify connection.");
      }
    } catch (error) {
      console.error("Subscription API Error:", error);
      alert("An error occurred while connecting to the payment gateway. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      name: 'Free',
      icon: <Shield className="w-6 h-6 text-slate-400" />,
      price: '₹0.00',
      duration: '7 Days',
      features: [
        { text: '1000 Contacts', included: true },
        { text: '50 Campaigns/Mo', included: true },
        { text: '100 Bot Replies', included: true },
        { text: '5 Bot Flows', included: true },
      ],
      buttonText: 'Buy Plan',
      color: 'slate'
    },
    {
      name: 'Standard',
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      monthlyPrice: '₹599',
      yearlyPrice: '₹499 /Mo',
      features: [
        { text: '10000 Contacts', included: true },
        { text: '100 Campaigns/Mo', included: true },
        { text: '5 Bot Flows', included: true },
        { text: 'AI Chat Bot (10)', included: true },
        { text: 'API Access', included: true },
      ],
      buttonText: 'Buy Plan',
      color: 'blue'
    },
    {
      name: 'Premium',
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      monthlyPrice: '₹999',
      yearlyPrice: '₹899 /Mo',
      features: [
        { text: '50000 Contacts', included: true },
        { text: '100 Campaigns/Mo', included: true },
        { text: '5 Bot Flows', included: true },
        { text: 'AI Chat Bot (250)', included: true },
        { text: 'API Access', included: true },
      ],
      buttonText: 'Buy Plan',
      isPopular: true,
      color: 'yellow'
    },
    {
      name: 'Ultimate',
      icon: <Crown className="w-6 h-6 text-purple-500" />,
      monthlyPrice: '₹1,999',
      yearlyPrice: '₹1,799 /Mo',
      features: [
        { text: 'Unlimited Contacts', included: true },
        { text: 'Unlimited Campaigns', included: true },
        { text: 'Unlimited Flows', included: true },
        { text: 'AI Chat Bot (2000)', included: true },
        { text: 'Full API Access', included: true },
      ],
      buttonText: 'Buy Plan',
      color: 'purple'
    }
  ];

  return (
    <div className="p-4 bg-slate-50 min-h-full">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Subscription Plans</h1>
          <p className="text-slate-500 text-xs mt-0.5">Upgrade your account to unlock premium features</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-sm transition-all hover:shadow-md ${plan.isPopular ? 'border-[#22c55e] border-2 relative' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-[#22c55e] text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase">
                  Popular
                </div>
              )}
              
              <div className="p-4 text-center border-b border-slate-100">
                <div className="inline-flex items-center justify-center p-2 bg-slate-50 rounded-lg mb-2">
                  {plan.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{plan.name}</h3>
                
                <div className="mt-2">
                  <div className="text-lg font-bold text-rose-500">{plan.price || plan.monthlyPrice}</div>
                  {plan.duration && <div className="text-[10px] text-slate-400">{plan.duration}</div>}
                  {plan.yearlyPrice && (
                    <div className="mt-0.5 text-[10px]">
                      <span className="text-slate-400">yearly</span>
                      <div className="text-rose-500 font-semibold">{plan.yearlyPrice}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 flex-1">
                <ul className="space-y-2">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start text-[11px]">
                      {feature.included ? (
                        <Check className="w-3 h-3 text-green-500 mr-2 shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-3 h-3 text-rose-400 mr-2 shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-slate-600' : 'text-slate-400 line-through'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 pt-0 mt-auto">
                <button
                  disabled={loadingPlan !== null}
                  onClick={() => handleBuyPlan(plan.name)}
                  className="w-full py-2 px-4 rounded-lg text-xs font-bold transition-all bg-[#22c55e] text-white hover:bg-green-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingPlan === plan.name ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
