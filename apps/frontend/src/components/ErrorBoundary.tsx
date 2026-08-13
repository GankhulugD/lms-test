import { AlertTriangle } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * H5P (@lumieducation/*) core нь jQuery/DOM-ыг шууд удиртгадаг тул алдаа
 * гарвал бүхэл React модыг унагааж, цоо хоосон цагаан дэлгэц үзүүлдэг эрсдэлтэй.
 * Энэ ErrorBoundary тэдгээр алдааг барьж, "цагаан дэлгэцний" оронд ойлгомжтой
 * мессеж + "Дахин ачаалах" товч харуулна.
 *
 * АНХААР: Энэ компонент LanguageProvider-ийн ГАДНА (хамгийн гадна давхаргад)
 * байрладаг тул useLanguage() ашиглаж болохгүй — яг LanguageProvider өөрөө
 * гэнэтийн алдаа гаргасан ч энэ дэлгэц харагдах ёстой. Тиймээс текстийг
 * динамик орчуулгын систем рүү оруулахгүй, аль аль хэлээр (mn/en) зэрэг
 * бичсэн статик текст ашиглана.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Гарч болзошгүй бус алдаа:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="items-center text-center">
              <AlertTriangle className="mb-2 size-8 text-destructive" />
              <CardTitle>Ямар нэг зүйл буруу боллоо / Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-center text-sm text-muted-foreground">
                Хуудсыг дахин ачааллаж үзнэ үү. Хэрэв алдаа давтагдаж байвал browser console-д
                дэлгэрэнгүй мэдээлэл байгаа болно.
                <br />
                Please reload the page. If the error persists, check the browser console for details.
              </p>
              <pre className="max-h-32 overflow-auto rounded-md bg-muted p-2 text-xs text-muted-foreground">
                {this.state.error.message}
              </pre>
              <Button onClick={() => window.location.reload()}>Дахин ачаалах / Reload</Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
