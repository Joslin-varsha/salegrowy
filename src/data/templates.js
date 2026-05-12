export const templateStrings = [  "pongal_offer (en)", "amazingdiscounts (en_US)", "re_engagement (en_GB)", "test_drum (en)", "ttxxttss (en_US)", "auto_checkoutoffer (en)", "offer_50mayilo (en)", "t_shirtcolour (en)", "size (en)", "address_confirm1 (en)", "cod_confirmation (en)", "order_followup (en)", "cart_followup (en)", "salelive (en)", "tshirtoffer (en)", "summersales2 (en)", "cod_ordertest1 (en)", "salegrowy_mark (en)", "abandoned_cart_demo1 (en)", "cod_updates (en)", "abondoncart (en)", "reminder_cart (en)", "offertemplate (en)", "document_test (en)", "megasalestemplate (en)", "templatemarketing (en_GB)", "thankyouregister (en)", "welcomeoffertest (en)", "customer_created (en)", "customer_update (en)","paymentrequesttemplatebyadminnew (en)", "paymentsuccesstemplatebyadminnew (en)", "paymentrequesttemp (en)", "paymenttemplate (en)", "republicdayoffer (en)", "fancycollection (en)", "furniturecollectionsnew (en)", "salegrowy_business (en)", "salegrowy_api (en)", "salegrowy (en)", "boost_sales_with_technology (en)", "great_deals (en)", "great_offers (en)", "inquiry_response (en)", "micheal (en)", "exclusive_deals (en)", "christoffer (en)", "registerutility (en)", "authtemplate (en_US)", "tests (en)" ];

const mockDb = {
  "pongal_offer": {
    "components": [
      { "type": "HEADER", "format": "IMAGE", "example": { "header_handle":["/photoslogo.png"] } },
      { "type": "BODY", "text": "Celebrate the Festival of Harvest in Style\n\nPremium fabrics. Modern fits. Timeless comfort.\nDesigned to elevate your festive look.\n\n🔥 UP TO 50% OFF 🔥\n\n⏳ Limited Period Only\n🛒 Shop Now & Make This Pongal Stylish" },
      { "type": "BUTTONS", "buttons": [{ "type": "URL", "text": "Shop Now", "url": "https://salegrowy.com/shop" }] }
    ]
  },
  "amazingdiscounts": {
    "components": [
      { "type": "HEADER", "format": "TEXT", "text": "30% off on all Laneige products" },
      { "type": "BODY", "text": "Hi there ✨ {{1}} \n\n💙 *Enjoy 30% OFF on All Laneige Products* 💙\n\nIt’s the perfect time to restock your favourite Laneige skincare essentials.\nGet flat 30% off on the entire Laneige range for a limited period.\n\nDon’t miss this exclusive offer — shop now!" },
      { "type": "BUTTONS", "buttons": [
        { "type": "QUICK_REPLY", "text": "Shop now" },
        { "type": "QUICK_REPLY", "text": "View products" },
        { "type": "QUICK_REPLY", "text": "Get offer details" }
      ]}
    ]
  },
  "test_drum": {
    "components": [
      { "type": "BODY", "text": "ICU Alarm Notification\n 🕒 Time: {{1}} \n📍 Bed No: {{2}} \n🧑🤝🧑 Patient ID: {{3}}\n 📋 Name: {{4}} \n⚠️ Alarm Type: {{5}}\n 📉 Critical Parameter: {{6}} = {{7}} (Threshold: {{8}}) \n👨⚕️ Assigned Nurse: {{9}}\nPlease click on the button to view the link." },
      { "type": "BUTTONS", "buttons": [{ "type": "URL", "text": "Acknowledge", "url": "https://bms.careworx.in/#{{1}}" }] }
    ]
  },
  "re_engagement": {
    "components": [
      { "type": "HEADER", "format": "TEXT", "text": "We'd Love to Assist You" },
      { "type": "BODY", "text": "You recently showed interest in Sale growy.\nLet us know how we can help you today." },
      { "type": "BUTTONS", "buttons": [
        { "type": "QUICK_REPLY", "text": "Continue Inquiry" },
        { "type": "QUICK_REPLY", "text": "Get Best Offer" },
        { "type": "QUICK_REPLY", "text": "Call Me Back" },
        { "type": "QUICK_REPLY", "text": "Not Interested" }
      ]}
    ]
  },
  "auto_checkoutoffer": {
    "components": [
      { "type": "HEADER", "format": "IMAGE", "example": { "header_handle": ["/photoslogo.jpg"]} },
      { "type": "BODY", "text": "Hi {{1}}, 50% OFF Inside!\n\nSpecially for our valued customers: Apply FIRST50 and grab 50% OFF instantly on your next order.\n\nClick below for auto checkout and claim your offer" },
     
    ]
  },
  "offer_50mayilo": {
    "components": [
      { "type": "HEADER", "format": "IMAGE", "example": { "header_handle":["/photoslogo.png"] } },
      { "type": "BODY", "text": "50% OFF Inside!\nHi {{1}}, We're making your day brighter: FIRST50 =\n50% OFF your next order.\n\n🎁 Just use code FIRST50 at checkout.\nClaim it now before it's gone!" },
      
    ]
  },
  "ttxxttss": {
    "components": [
      { "type": "BODY", "text": "hi\nyour meeting is scheduled in 11:99:00" }
    ]
  },
  "t_shirtcolour": {
    "components": [
      { "type": "BODY", "text": "Hi {{1}} ,\n\n✅ Just confirming your order:\n🛒 Item: *Oversized Anime Power T-Shirt (1)*\n\nPlease confirm your T-shirt colour (e.g., *White/Black*)" }
    ]
  },
  "address_confirm1": {
    "components": [
      { "type": "BODY", "text": "Hi {{1}} ,\n\nWe've started printing your T-shirt👕✨\nIt's almost ready!\n\n📍 *Deliver Address:*\n{{2}}\n\nKindly check & confirm your address" },
      { "type": "BUTTONS", "buttons": [
        { "type": "QUICK_REPLY", "text": "Confirm Address" },
        { "type": "QUICK_REPLY", "text": "Change Address" }
      ]}
    ]
  },
  "size": {
    "components": [
      { "type": "BODY", "text": "Hello {{1}}\nWe need to confirm your *T-shirt size*. You have selected one size could you kindly confirm your preferred size ?\n(e.g., M, L, XL)" }
    ]
  },
  "customer_created": {
    "components": [
      { "type": "HEADER", "format": "IMAGE", "example": { "header_handle":["/photoslogo.png"]} },
      { "type": "BODY", "text": "Hii {{1}}\nWe welcome you to be a part of Mayilo.Kindly follow us to check more exciting offers\n\nThank you" }
    ]
  },
  "cod_confirmation": {
    "components": [
      { "type": "BODY", "text": "Hi {{1}}, 🎉\nYour order #{{2}} has been successfully confirmed.\n\n🛒 Items: {{3}}\n\nWe'll keep you updated on the shipping status.\n*Thank you for choosing Mayilo!*" }
    ]
  },
  "customer_update": {
    "components": [
      { "type": "HEADER", "format": "IMAGE", "example": { "header_handle": ["/photoslogo.png"] } },
      { "type": "BODY", "text": "Hii {{1}} ,\nYour details has been update successfully.\n\nThank you" }
    ]
  },
  "order_followup": {
    "components": [
      { "type": "BODY", "text": "*Order Placed!.*\n\nYour order has been successfully placed with the order ID {{1}}\n\nThank you for shopping with us." }
    ]
  },
  "cart_followup": {
    "components": [
      { "type": "HEADER", "format": "IMAGE", "example": { "header_handle":["/photoslogo.png"]} },
      { "type": "BODY", "text": "Hey {{1}},\n\nYour cart is still waiting at *Mayilo*!\n\nGrab your exclusive offer before it’s gone, popular items are selling fast! ⏳\n\nTap below to finish your checkout now and save big!\n\n{{2}}" }
    ]
  },
   "tests": {
    "components": [
      { "type": "BODY", "text": "Hi {{1}} ,\n\nWe've launched a new product" },
      { "type": "BUTTONS", "buttons": [
        { "type": "QUICK_REPLY", "text": "CHECK NOW" },
      ]},
        { "type": "BUTTONS", "buttons": [{ "type": "URL", "text": "Acknowledge", "url": "https://bms.careworx.in/#{{1}}" }] }
    ]
  },
  "exclusive_deals": {
    "components": [
      { "type": "HEADER", "format": "TEXT", "text": "Year End {{1}}" },
      { "type": "BODY", "text": "Domain with just RS.1\nFree SSL Certificate and Website Builder\n24/7 Customer Support" },
      { "type": "BUTTONS", "buttons": [{ "type": "QUICK_REPLY", "text": "START" }] }
    ]
  },
  "authtemplate": {
    "components": [
      { "type": "BODY", "text": "{{1}} is your verification code. For your security, do not share this code" },
        { "type": "BUTTONS", "buttons": [{ "type": "URL", "text": "Copy code", "url": "https://www.whatsapp.com/otp/code/?otp_type=COPY_CODE&code=otp{{1}}" }] }
    ]
  },
  "registerutility": {
    "components": [
      { "type": "BODY", "text": "Hi {{1}},\n Thank You For register with Mayilo." },
    ]
  },
  "christoffer": {
    "components": [
      { "type": "BODY", "text": "Upgrade Your Style – T-Shirts on Sale Now!\n\nHey{{1}},\n🔥 Exclusive Discounts on Trendy Tees! 🔥\n✅ Premium Quality\n✅ Stylish Designs for Every Occasion\n✅ Unbeatable Prices\n\n🛒 Shop Now and Refresh Your Wardrobe! 🛒\n⏳ Hurry, Limited Stock – Don't Miss Out!" },
      { "type": "BUTTONS", "buttons": [
        { "type": "QUICK_REPLY", "text": "SHOP NOW" },
      ]},
      
    ]
  },
//   "cod_confirmation": {
//   "components": [
//     {
//       "type": "BODY",
//       "text": "Hi {{1}}, 🎉\nYour order #{{2}} has been successfully confirmed.\n\n🛒 Items: {{3}}\n\nWe’ll keep you updated on the shipping status.\nThank you for choosing Mayilo!"
//     }
//   ]
// },
// "customer_update": {
//   "components": [
//     {
//       "type": "HEADER",
//       "format": "IMAGE",
//       "example": {
//         "header_handle": ["/photoslogo.jpg"]
//       }
//     },
//     {
//       "type": "BODY",
//       "text": "Hi {{1}},\nYour details has been updated successfully.\n\nThank you"
//     }
//   ]
// },
// "customer_created": {
//   "components": [
//     {
//       "type": "HEADER",
//       "format": "IMAGE",
//       "example": {
//         "header_handle":["/photoslogo.jpg"]
//       }
//     },
//     {
//       "type": "BODY",
//       "text": "Hi {{1}},\nWe welcome you to be a part of Mayilo.\nKindly follow us to check more exciting offers.\n\nThank you"
//     }
//   ]
// },
// "order_followup": {
//   "components": [
//     {
//       "type": "BODY",
//       "text": "Order Placed!..\n\nYour order has been successfully placed with the order ID {{1}}\n\nThank you for shopping with us."
//     }
//   ]
// },
// "cart_followup": {
//   "components": [
//     {
//       "type": "HEADER",
//       "format": "IMAGE",
//       "example": {
//         "header_handle":["/photoslogo.jpg"]
//       }
//     },
//     {
//       "type": "BODY",
//       "text": "Hey {{1}},\n\nYour cart is still waiting at Mayilo!\n\nGrab your exclusive offer before it’s gone, popular items are selling fast! ⏳\n\nTap below to finish your checkout now and save big!\n\n{{2}}"
//     }
//   ]
// },
 "micheal": {
    "components": [
      { "type": "HEADER", "format": "TEXT", "text": "Enrich your Tongue with different Taste {{Header 1}}" },
      { "type": "BODY", "text": "Hey\n\nExclusive Discounts on Tempting pieces\n\nPerfect Quality\n\nCustomized Cakes\n\nShop Now and Refresh Your Taste" },
    ]
  },
  "inquiry_response": {
    "components": [
      { "type": "HEADER", "format": "TEXT", "text": "HI {{Header 1}}," },
      { "type": "BODY", "text": "Thank you for contacting Reo Restaurant!!!.We \nhope you had a wonderful dining experience😊." },
    ]
  },
  "great_offers": {
    "components": [
      { "type": "HEADER", "format": "TEXT", "text": "SPECIAL {{Header 1}}" },
      { "type": "BODY", "text": "Hi!\n\nThere is a great deal, and we wanted to ensure you didn't miss it.\nWe're offering 50% off on all women T-shirts for a limited time only.\n\nHere is the direct link to check out and place your order within seconds." },
      { "type": "BUTTONS", "buttons": [{ "type": "QUICK_REPLY", "text": "Visit Now" }] }
    ]
  },
  "great_deals": {
    "components": [
      { "type": "HEADER", "format": "TEXT", "text": "SPECIAL OFFER!" },
      { "type": "BODY", "text": "Hi,\n\nThere is a great deal, and we wanted to ensure you didn't miss it.\nWe're offering 50% off on all women T-shirts for a limited time only.\n\nHere is the direct link to check out and place your order within seconds." },
      { "type": "BUTTONS", "buttons": [{ "type": "QUICK_REPLY", "text": "Visit Now" }] }
    ]
  },
   "boost_sales_with_technology": {
    "components": [
      { "type": "HEADER", "format": "TEXT", "text": "Grow Your Business with Salegrowy" },
      { "type": "BODY", "text": "⚡Automate customer interactions via salegrowy\n\n⚡Boost bookings and sales\n\n⚡Enhance brand trust and loyalty with verified business profiles." },
      { "type": "BUTTONS", "buttons": [{ "type": "QUICK_REPLY", "text": "Get Started" }] }
    ]
  },
  "salegrowy": {
    "components": [
      { "type": "HEADER", "format": "TEXT", "text": "Connect through conversations with Salegrowy" },
      { "type": "BODY", "text": "Hello\n\n👍Customer-focused mindset\n📳Automate with Chatbots\n👆Send messages with clickable buttons\n✅Build Templates without any technical know-how" },
    ]
  },
  "salegrowy_api": {
  "components": [
    {
      "type": "HEADER",
      "format": "IMAGE",
      "example": {
        "header_handle": ["/photoslogo.png"]
      }
    },
    {
      "type": "BODY",
      "text": "Hello {{1}},\nEnrich Your Sales 10X with Us\n\n👍Customer-focused mindset\n📳Automate with Chatbots\n👆Send messages with clickable buttons\n✅Build Templates without any technical know-how"
    },
    { "type": "BUTTONS", "buttons": [{ "type": "QUICK_REPLY", "text": "Click Here" }] }
  ]
},
"salegrowy_business": {
  "components": [
    {
      "type": "HEADER",
      "format": "IMAGE",
      "example": {
        "header_handle":["/photoslogo.png"]
      }
    },
    {
      "type": "BODY",
      "text": "Hi {{1}} ,\nGreetings from Salegrowy,\n\nGrow your sales by 10x times via Whatsapp\n\n✨Grow your Business in Automation.\n✨Increase in Repeat Sales.\n✨Team Management& Customer Engagement.\n✨Builds Brand Loyalty & Increase Revenue.\nFor more details and enquiry click below:"
    },
    { "type": "BUTTONS", "buttons": [{ "type": "QUICK_REPLY", "text": "Start Now" }] }
  ]
},
"furniturecollectionsnew": {
  "components": [
    {
      "type": "BODY",
      "text": "Offer Collection Zone\n\nGreetings {{1}}\n\nHere You Can Purchase the Latest Collection in Offers."
    }
  ]
},
"fancycollection": {
  "components": [
    {
      "type": "BODY",
      "text": "fancy offers\n\nGreetings {{1}}\n\nNow You Can Purchase in Offer Zone"
    },
    { "type": "BUTTONS", "buttons": [{ "type": "QUICK_REPLY", "text": "Interested" }] }
  ]
},
 "republicdayoffer": {
    "components": [
      { "type": "HEADER", "format": "TEXT", "text": "Greetings From {{Header 1}}" },
      { "type": "BODY", "text": "Grab Your Republic Day Offers ,What You Want for Lowest Price ." },
      { "type": "BUTTONS", "buttons": [
        { "type": "QUICK_REPLY", "text": "Call Back Me" },
        { "type": "QUICK_REPLY", "text": "Call Now" },
        { "type": "QUICK_REPLY", "text": "See all options" },
        { "type": "QUICK_REPLY", "text": "Copy offer code" }
      ]},
      { "type": "BUTTONS", "buttons": [{ "type": "URL", "text": "Visit our site for offers", "url": "https://www.akinfopark.com/{{1}}" }] }
    ]
  },
  "paymenttemplate": {
    "components": [
      {
      "type": "HEADER",
      "format": "IMAGE",
      "example": {
        "header_handle": ["/photoslogo.png"]
      }
    },
      { "type": "BODY", "text": "HI ,\n\nBill Created Pay Now" },
      { "type": "BUTTONS", "buttons": [{ "type": "URL", "text": "Pay Now", "url": "https://rzp.io/rzp{{1}}" }] }
    ]
  },
   "paymentrequesttemp": {
    "components": [
      {
      "type": "HEADER",
      "format": "IMAGE",
      "example": {
        "header_handle": ["/photoslogo.png"]
      }
    },
      { "type": "BODY", "text": "Hi{{1}},\n\nBill is Created Pay Now" },
      { "type": "BUTTONS", "buttons": [{ "type": "URL", "text": "Pay Now", "url": "https://rzp.io/rzp/{{1}}" }] }
    ]
  },
   "paymentsuccesstemplatebyadminnew": {
  "components": [
    {
      "type": "BODY",
      "text": "Hi user, \n\nYour Payment of Rs . {{1}} against the Order {{2}} is Success ."
    }
  ]
},
 "paymentrequesttemplatebyadminnew": {
  "components": [
    {
      "type": "BODY",
      "text": "Hi user, \n\nPay Your Bill Here Using the Below Link,\n\nDescription :\n\n{{1}} ."
    },
     { "type": "BUTTONS", "buttons": [{ "type": "URL", "text": "Pay Now", "url": "https://rzp.io/rzp/{{1}}" }] }
  ]
},
"welcomeoffertest": {
    "components": [
      {
      "type": "HEADER",
      "format": "IMAGE",
      "example": {
        "header_handle": ["/photoslogo.png"]
      }
    },
      { "type": "BODY", "text": "Hi {{1}} ,\n\nYou Received a Welcome offer .Grab it Now . For More Details visit Website." },
       { "type": "BUTTONS", "buttons": [{ "type": "QUICK_REPLY", "text": "Call Back" }] }
      
    ]
  },
   "thankyouregister": {
  "components": [
    {
      "type": "BODY",
      "text": "Hi {{1}},\n\nThank you for registered with Mayilo.in,\n\nThank You."
    }
  ]
},
 "templatemarketing": {
  "components": [
    {
      "type": "BODY",
      "text": "Hi {{1}},\nYour offer is waiting You."
    }
  ]
},
"megasalestemplate": {
  "components": [
    {
      "type": "BODY",
      "text": "Hi,\nPlease Apply this form to get Pre Sale Offer.\nThank You."
    },
    { "type": "BUTTONS", "buttons": [{ "type": "QUICK_REPLY", "text": "Apply Now" }] }
  ]
},
  "document_test": {
    "components": [
      { "type": "HEADER", "format": "DOCUMENT", "text": "{{Header Document Name}}", "example": { "header_handle":  ["/photoslogo.png"] } },
      { "type": "BODY", "text": "Hii ,This is a test ." },
      { "type": "BUTTONS", "buttons": [{ "type": "QUICK_REPLY", "text": "reply" }] }
    ]
  },
   "salelive": {
    "components": [
      {
      "type": "HEADER",
      "format": "IMAGE",
      "example": {
        "header_handle": ["/photoslogo.png"]
      }
    },
      { "type": "BODY", "text": "Big Sale Live Now at Mayilo!\n\nFor 4 days only, enjoy a FLAT 50% OFF on our latest arrivals! 🛍️\nDon't miss out grab your favorite Premium T-Shirts before the sale ends!\n\n🗓️Offer valid from July 24 to July 27" },
      { "type": "BUTTONS", "buttons": [{ "type": "QUICK_REPLY", "text": "Get More Info" }] },
      { "type": "BUTTONS", "buttons": [{ "type": "URL", "text": "Shop Now" }] }
    ]
  },
  "tshirtoffer": {
    "components": [
      {
      "type": "HEADER",
      "format": "IMAGE",
      "example": {
        "header_handle": ["/photoslogo.png"]
      }
    },
      { "type": "BODY", "text": "Mayilo has launched new arrivals – and for 4 days only, enjoy 50% OFF! 🛍️\n\nGrab your favorite Premium T-Shirts👕 before the offer ends!\n\n🗓️ Offer valid: July 24–27" },
      { "type": "BUTTONS", "buttons": [
        { "type": "QUICK_REPLY", "text": "Interested" },
        { "type": "QUICK_REPLY", "text": "Get More Info" },
      ]},
    ]
  },
  "summersales2": {
    "category": "MARKETING",
    "components": [
      { "type": "HEADER", "format": "TEXT", "text": "Hello {{Header 1}}" },
      { "type": "BODY", "text": "Get the Summer offer now using {{1}}" },
      { "type": "BUTTONS", "buttons": [
        { "type": "URL", "text": "Visit", "url": "https://example.com" },
        { "type": "URL", "text": "Copy offer code", "url": "{{1}}" }
      ]}
    ]
  },
  "cod_ordertest1": {
    "category": "UTILITY",
    "components": [
      { "type": "BODY", "text": "Order Placed\n\nHii {{1}},\nYour order has been successfully placed.Click confirm to confirm your COD order." },
      { "type": "BUTTONS", "buttons": [
        { "type": "QUICK_REPLY", "text": "Confirm" },
        { "type": "QUICK_REPLY", "text": "Cancel" }
      ]}
    ]
  },
  "salegrowy_mark": {
    "category": "MARKETING",
    "components": [
      { "type": "HEADER", "format": "TEXT", "text": "Hello {{Header 1}}" },
      { "type": "BODY", "text": "Welcome to {{1}}.\nClaim an exclusive summer offer by using the {{2}}.\nDon't miss out the deal." },
      { "type": "BUTTONS", "buttons": [
        { "type": "URL", "text": "Copy offer code", "url": "{{1}}" },
        { "type": "URL", "text": "Follow Us", "url": "https://example.com" }
      ]}
    ]
  },
  "abandoned_cart_demo1": {
    "category": "MARKETING",
    "components": [
      { "type": "BODY", "text": "Hello There!\n\nYour Product {{1}} is waiting for you. Grab it now!!!" },
      { "type": "BUTTONS", "buttons": [
        { "type": "QUICK_REPLY", "text": "Continue!" }
      ]}
    ]
  },
  "cod_updates": {
    "category": "UTILITY",
    "components": [
      { "type": "HEADER", "format": "IMAGE", "example": { "header_handle": ["/photoslogo.png"] } },
      { "type": "BODY", "text": "Hi {{1}}\nThanks for your order with Mayilo! 🛍️\nYour order has been successfully placed!\n\n🧾 Payment Method: Cash on Delivery (COD)\n🚚 Estimated Delivery: July 18 th, 2025" },
      { "type": "BUTTONS", "buttons": [
        { "type": "QUICK_REPLY", "text": "Track Your Order" }
      ]}
    ]
  },
  "abondoncart": {
    "category": "MARKETING",
    "components": [
      { "type": "HEADER", "format": "IMAGE", "example": { "header_handle": ["/photoslogo.png"] } },
      { "type": "BODY", "text": "Hey {{1}},\nYour items are still waiting for you!\nGrab it Now and Enjoy FREE Shipping." },
      { "type": "BUTTONS", "buttons": [
        { "type": "QUICK_REPLY", "text": "Checkout Now!" },
        { "type": "QUICK_REPLY", "text": "View my cart" }
      ]}
    ]
  },
  "offertemplate": {
    "category": "MARKETING",
    "components": [
      { "type": "HEADER", "format": "IMAGE", "example": { "header_handle": ["/photoslogo.png"] } },
      { "type": "BODY", "text": "Mayilo has launched new arrivals - and for 4 days only, enjoy 50% OFF! 🛍️\n\nGrab your favorite premium T-shirts 👕 before the offer ends!\n\n🗓️ Offer valid: July 24-27" },
      { "type": "BUTTONS", "buttons": [
        { "type": "QUICK_REPLY", "text": "Shop Now" },
        { "type": "QUICK_REPLY", "text": "Get Info" }
      ]}
    ]
  },
  "reminder_cart": {
    "category": "MARKETING",
    "components": [
      { "type": "HEADER", "format": "TEXT", "text": "Still thinking it over, {{Header 1}}" },
      { "type": "BODY", "text": "Your products are still waiting for you - but it might sell out soon!\n\nGood news: You can still complete your order with Cash on Delivery + 10% OFF! 🎁" },
      { "type": "BUTTONS", "buttons": [
        { "type": "QUICK_REPLY", "text": "Claim my Offer" }
      ]}
    ]
  }
};

export const templatesData = templateStrings.map((tStr, index) => {
  const match = tStr.match(/^(.+?)\s*\((.+?)\)$/);
  const name = match ? match[1] : tStr;
  const lang = match ? match[2] : "en";
  
  let components = mockDb[name]?.components;
  
  if (!components) {
     components = [
       { "type": "HEADER", "format": "TEXT", "text": `${name.replace(/_/g, ' ').toUpperCase()}` },
       { "type": "BODY", "text": `This is an auto-generated preview for the ${name} template.\nPlease provide the accurate JSON for this template to view variables.` }
     ];
  }

  return {
    template: {
      name: name,
      language: lang,
      category: mockDb[name]?.category || "MARKETING",
      status: "APPROVED",
      id: 106 + index,
      components: components
    }
  };
});
