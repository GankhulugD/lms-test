import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// АНХААР: <StrictMode> санаатайгаар ашиглахгүй. H5P core (@lumieducation/*)
// нь jQuery/DOM-ыг шууд удиртгадаг хуучин архитектуртай тул StrictMode-ийн
// dev горимд заавал хийдэг "mount → unmount → mount" давхар дуудлага H5P-ийн
// дотоод global state-тэй мөргөлдөж бүхэл React модыг унагаадаг (цоо хоосон
// цагаан дэлгэц). Энэ бол зөвхөн dev горимд тохиолддог, production build-д
// нөлөөгүй тул StrictMode-ийг эндээс хассан нь зохистой шийдэл.
createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <LanguageProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </LanguageProvider>
  </ErrorBoundary>,
);
