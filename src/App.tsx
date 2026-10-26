import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { PostbackPage } from './features/postback/PostbackPage';
import { FeedProvider } from './hooks/usePostbackFeed';
import { ThemeProvider } from './hooks/useTheme';
import { appBasename } from './utils/basename';

export function App() {
  return (
    <ThemeProvider>
      <FeedProvider>
        <BrowserRouter basename={appBasename()}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/postback" element={<PostbackPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FeedProvider>
    </ThemeProvider>
  );
}
