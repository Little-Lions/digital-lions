import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CommunityPage from '@/pages/CommunityPage';
import TeamsPage from '@/pages/TeamsPage';
import TeamsDetailPage from '@/pages/TeamsDetailPage';
import LoginPage from '@/pages/LoginPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/communities" element={<CommunityPage />} />
        <Route path="/communities/:communityId/teams" element={<TeamsPage />} />
        <Route path="/teams" element={<TeamsDetailPage />} />
        <Route path="/communities/:communityId/teams/:teamId" element={<TeamsDetailPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
};

export default App;
