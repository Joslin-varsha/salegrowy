"use client";

import { useState, useEffect } from "react";
import Pusher from "pusher-js";
import {
  FaWpforms,
  FaUserPlus,
  FaCalendarAlt,
  FaEnvelope,
  FaClipboardCheck,
  FaTag,
  FaTags,
  FaPlay,
  FaShoppingCart,
  FaHandHoldingUsd,
  FaBoxOpen,
  FaSyncAlt,
} from "react-icons/fa";
import { X, Zap } from "lucide-react";

export default function TriggerSidebar({
  setSelectedElements,
  onTriggerSelect,
  setNodeName,
  nodeName,
  setWebhookData,
  webhookData,
}) {
  const [title, setTitle] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [copied, setCopied] = useState(false);

  const triggers = [{ label: formatSnakeCaseToTitle(title), icon: FaWpforms }];

  function formatSnakeCaseToTitle(str) {
    if (!str) return "";

    // Remove surrounding quotes if present
    const cleanStr = str.replace(/^"(.*)"$/, "$1");

    return cleanStr
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  const [pusherInstance, setPusherInstance] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const initializePusher = async () => {
      try {
        const pusher = new Pusher("543b3f19bae874fac5e3", {
          cluster: "ap2",
          forceTLS: true,
          enabledTransports: ["ws", "wss"],
        });

        setPusherInstance(pusher);

        const channel = pusher.subscribe("shopify-test-webhook");

        channel.bind("ShopifyTestWebhookReceived", (data) => {
          console.log("Webhook data:", data.payload);
         handleTriggerClick()
        });

        return () => {
          channel.unbind_all();
          channel.unsubscribe();
          pusher.disconnect();
        };
      } catch (error) {
        console.error("Pusher initialization error:", error);
      }
    };

    initializePusher();
  }, []);

  // Add this to check connection status
  useEffect(() => {
    if (!pusherInstance) return;

    const handleStateChange = (states) => {
      console.log("Current state:", states.current);
    };

    pusherInstance.connection.bind("state_change", handleStateChange);
    return () => {
      pusherInstance.connection.unbind("state_change", handleStateChange);
    };
  }, [pusherInstance]);

  useEffect(() => {
    setTitle(localStorage.getItem("triggertitle"));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookData.webhookurl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleTriggerClick = async (label) => {
    setIsLoading(true);
    const payload = {
      vendor_uid: "5e30ff02-d130-4cde-9050-82818e82b067",
      event: "checkout_update1",
    };

    try {
      const response = await fetch(
        "https://dev.salegrowy.com/api/getOrCreateShopifyWebhook",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      setWebhookData(data);
    } catch (error) {
      console.error("Error sending trigger:", error);
      setErrorMessage("Something went wrong. Please try again later.");
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };
  const handleCancel = () => {
    setSelectedElements([]);
  };

  return (
    <aside className="border-r max-h-screen overflow-y-auto p-5 text-sm w-[25vw] h-auto shadow-md bg-white text-gray-900">
      <div className="relative flex items-center justify-between mb-4">
        {/* <h3 className="text-xl font-bold text-blue-900"><Zap className="w-3 h-3" />Trigger</h3> */}
        <h3
          className={`text-xl font-bold flex items-center gap-2 pr-8 text-blue-900`}
        >
          <Zap className="w-5 h-5" /> Media Node
        </h3>
        <button
          className="absolute right-0 top-1 p-2 rounded-full text-white bg-red-500 hover:bg-red-600"
          onClick={handleCancel}
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <label className="block mb-2 text-sm font-medium text-gray-700">
        <strong>Thoose The Application:</strong> Trigger
      </label>
      <div className="grid grid-cols-1 gap-3 py-3">
        {triggers.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => handleTriggerClick(label)}
            className={`flex flex-col items-center justify-center gap-2 p-3 border rounded-lg text-xs font-medium shadow-sm hover:bg-blue-100 transition ${
              nodeName === label ? "bg-blue-200 border-blue-400" : "bg-white"
            }`}
          >
            <Icon size={24} className="text-blue-600" />
            <span className="text-center">{label}</span>
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 justify-center py-4">
          <div className="w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">Loading...</span>
        </div>
      )}
      {webhookData ? (
        <>
          <label className="block font-bold text-gray-700 py-3">
            Webhook URL
          </label>
          <div className="flex items-center gap-3 bg-white">
            <input
              type="text"
              readOnly
              disabled
              value={webhookData.webhookurl}
              className="flex-1 bg-gray-50 text-gray-800 text-sm px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              onClick={handleCopy}
              className={`text-sm px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                copied
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </>
      ) : (
        <div className="mt-4 text-red-500 text-sm">{errorMessage || null}</div>
      )}
    </aside>
  );
}
