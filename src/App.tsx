import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout, GuestOnly } from '@/components/common';
import { Toaster } from '@/lib/toast';
import { AdminPage } from '@/pages/admin';
import { AppsPage } from '@/pages/apps';
import { ForgotPasswordPage } from '@/pages/auth/forgot-password';
import { SignInPage } from '@/pages/auth/sign-in';
import { ClientsPage } from '@/pages/clients';
import { CreateClientPage } from '@/pages/clients/create';
import { EditClientPage } from '@/pages/clients/edit';
import { DashboardPage } from '@/pages/dashboard';
import { EnvPage } from '@/pages/env';
import { FirebasePage } from '@/pages/firebase';
import { GitPage } from '@/pages/git';
import { InvoicesPage } from '@/pages/invoices';
import { PluginsPage } from '@/pages/plugins';
import { ProfilePage } from '@/pages/profile';
import { SettingsPage } from '@/pages/settings';
import { TemplatesPage } from '@/pages/templates';
import { VercelPage } from '@/pages/vercel';
import { WebsitesPage } from '@/pages/websites';
const App = () => {
    return (<BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace/>}/>

        <Route element={<GuestOnly />}>
          <Route path="/auth/sign-in" element={<SignInPage />}/>
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />}/>
        </Route>

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />}/>
          <Route path="/clients" element={<ClientsPage />}/>
          <Route path="/clients/new" element={<CreateClientPage />}/>
          <Route path="/clients/:clientId/edit" element={<EditClientPage />}/>
          <Route path="/apps" element={<AppsPage />}/>
          <Route path="/websites" element={<WebsitesPage />}/>
          <Route path="/plugins" element={<PluginsPage />}/>
          <Route path="/templates" element={<TemplatesPage />}/>
          <Route path="/git" element={<GitPage />}/>
          <Route path="/firebase" element={<FirebasePage />}/>
          <Route path="/vercel" element={<VercelPage />}/>
          <Route path="/env" element={<EnvPage />}/>
          <Route path="/invoices" element={<InvoicesPage />}/>
          <Route path="/admin" element={<AdminPage />}/>
          <Route path="/profile" element={<ProfilePage />}/>
          <Route path="/settings" element={<SettingsPage />}/>

        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
      </Routes>
      <Toaster />
    </BrowserRouter>);
};
export default App;
