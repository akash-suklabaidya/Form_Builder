
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import CreateFormPage from './pages/CreateFormPage';
import FormPreview from './pages/FormPreview';
import Navigation from './components/Navigation';
import MyFormsPage from './pages/MyFormsPage';

function App() {
  return (
    <Router>
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<CreateFormPage />} />
          <Route path="/myforms" element={<MyFormsPage />} />

          <Route path="/preview" element={<FormPreview />} />

          <Route path="/preview/:formId" element={<FormPreview />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;