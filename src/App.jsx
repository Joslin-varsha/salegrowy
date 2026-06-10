import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import RegisterVendor from './pages/RegisterVendor';
import ForgotPassword from './pages/ForgotPassword';
import DashboardLayout from './layouts/DashboardLayout';
import VendorDashboard from './pages/VendorDashboard';
import MessageLog from './pages/MessageLog';
import Campaigns from './pages/Campaigns';
import CreateCampaign from './pages/CreateCampaign';
import Contacts from './pages/Contacts';
import CreateContact from './pages/CreateContact';
import ContactGroups from './pages/ContactGroups';
import Labels from './pages/Labels';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import WhatsAppTemplates from './pages/WhatsAppTemplates';
import CreateWhatsAppTemplate from './pages/CreateWhatsAppTemplate';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminVendors from './pages/SuperAdminVendors';
import SuperAdminCampaigns from './pages/SuperAdminCampaigns';
import AIAgent from "./aiagent/aiagent";
import FlowChatbotUI from "./chatbot/FlowChatbotUI";
import BotFlows from './pages/BotFlows';
import ShopifyAuth from './pages/ShopifyAuth';
import Subscription from './pages/Subscription';
import ShopifySubscription from './pages/ShopifySubscription';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import WhatsAppChat from './pages/WhatsAppChat';
import SyncProducts from "./pages/SyncProducts";
import SyncCustomers from "./pages/SyncCustomers";
import Webhooks from "./pages/Webhooks";

// Redirects logged-in users away from login/register pages
function PublicRoute() {
  const token = localStorage.getItem('token');
  if (token) return <Navigate to="/dashboard" replace />;
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1" style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  );
}


function App() {
  return (
    <Router>
      <Routes>
        {/* Shopify Auth Routes */}
        <Route path="/shopify" element={<ShopifyAuth />} />
        <Route path="/callback" element={<ShopifyAuth />} />
        <Route path="/shopify-subscription" element={<ShopifySubscription />} />

        {/* Auth routes — redirect to dashboard if already logged in */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<RegisterVendor />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<VendorDashboard />} />
          <Route path="message-log" element={<MessageLog />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="campaigns/create" element={<CreateCampaign />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="contacts/groups" element={<ContactGroups />} />
          <Route path="contacts/labels" element={<Labels />} />
          <Route path="contacts/create" element={<CreateContact />} />
          <Route path="contacts/edit/:id" element={<CreateContact />} />
          <Route path="whatsapp-templates" element={<WhatsAppTemplates />} />
          <Route path="whatsapp-templates/create" element={<CreateWhatsAppTemplate />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="agent" element={<AIAgent />} />
          <Route path="chatflow" element={<FlowChatbotUI />} />
          <Route path="bot/flows" element={<BotFlows />} />
          <Route path="whatsapp-chat" element={<WhatsAppChat />} />
          <Route path="sync-products" element={<SyncProducts />} />
          <Route path="sync-customers" element={<SyncCustomers />} />
          <Route path="webhooks" element={<Webhooks />} />
        </Route>

        {/* Super Admin routes */}
        <Route path="/superadmin" element={<SuperAdminLayout />}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="vendors" element={<SuperAdminVendors />} />
          <Route path="campaigns" element={<SuperAdminCampaigns />} />
        </Route>

        {/* Subscription Success (Full Screen) */}
        <Route path="/subscription-success" element={<SubscriptionSuccess />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
