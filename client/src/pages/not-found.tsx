import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { UI_TRANSLATIONS, SUPPORTED_LANGUAGES, type SupportedLanguage, translate } from "@/lib/localization";

export default function NotFound() {
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  useEffect(() => {
    // In the SPA the main app always loads first and sets document.documentElement.lang,
    // so by the time this 404 component mounts the lang attribute is already correct.
    const lang = document.documentElement.lang;
    if (lang && SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
      setLanguage(lang as SupportedLanguage);
    }
    const isRtl = lang === 'ar';
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  }, []);

  const t = (key: string): string => translate(key, language, UI_TRANSLATIONS);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">{t('404 Page Not Found')}</h1>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            {t('404-description')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
