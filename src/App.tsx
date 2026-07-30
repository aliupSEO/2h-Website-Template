import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/common';
import {
    AdminRoute,
    AuthBootstrap,
    PrivateRoute,
    PublicRoute,
} from '@/features/auth';
import { Toaster } from '@/lib/toast';
import { AdminPage } from '@/pages/admin';
import { AppsPage } from '@/pages/apps';
import { AcceptInvitePage } from '@/pages/auth/accept-invite';
import { ForgotPasswordPage } from '@/pages/auth/forgot-password';
import { ResetPasswordPage } from '@/pages/auth/reset-password';
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
    return (
        <BrowserRouter>
            <AuthBootstrap>
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    <Route element={<PublicRoute />}>
                        <Route path="/auth/sign-in" element={<SignInPage />} />
                        <Route
                            path="/auth/forgot-password"
                            element={<ForgotPasswordPage />}
                        />
                    </Route>

                    <Route element={<PublicRoute guestOnly={false} />}>
                        <Route
                            path="/auth/reset-password"
                            element={<ResetPasswordPage />}
                        />
                        <Route
                            path="/auth/accept-invite"
                            element={<AcceptInvitePage />}
                        />
                    </Route>

                    <Route element={<PrivateRoute />}>
                        <Route element={<AppLayout />}>
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/clients" element={<ClientsPage />} />
                            <Route
                                path="/clients/new"
                                element={<CreateClientPage />}
                            />
                            <Route
                                path="/clients/:clientId/edit"
                                element={<EditClientPage />}
                            />
                            <Route path="/apps" element={<AppsPage />} />
                            <Route path="/websites" element={<WebsitesPage />} />
                            <Route path="/plugins" element={<PluginsPage />} />
                            <Route path="/templates" element={<TemplatesPage />} />
                            <Route path="/git" element={<GitPage />} />
                            <Route path="/firebase" element={<FirebasePage />} />
                            <Route path="/vercel" element={<VercelPage />} />
                            <Route path="/env" element={<EnvPage />} />
                            <Route path="/invoices" element={<InvoicesPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Route>

                        <Route element={<AdminRoute />}>
                            <Route element={<AppLayout />}>
                                <Route path="/admin" element={<AdminPage />} />
                            </Route>
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
                <Toaster />
            </AuthBootstrap>
        </BrowserRouter>
    );
};

export default App;
