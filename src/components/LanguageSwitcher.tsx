import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "default" | "compact" | "full";
  className?: string;
}

const LanguageSwitcher = ({ variant = "default", className }: LanguageSwitcherProps) => {
  const { language, setLanguage, languageName, availableLanguages, isRTL } = useTranslation();

  const getFlagEmoji = (code: string) => {
    switch (code) {
      case "bn": return "🇧🇩";
      case "en": return "🇬🇧";
      case "ar": return "🇸🇦";
      default: return "🌐";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={variant === "compact" ? "icon" : "sm"}
          className={cn(
            "gap-2 font-medium transition-all hover:bg-primary/10",
            variant === "compact" && "h-9 w-9",
            className
          )}
        >
          <Globe className="h-4 w-4" />
          {variant !== "compact" && (
            <span className="hidden sm:inline">{languageName}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={isRTL ? "start" : "end"} 
        className="min-w-[160px] bg-card border-border shadow-elegant"
      >
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={cn(
              "flex items-center justify-between gap-3 cursor-pointer py-2.5 px-3",
              language === lang.code && "bg-primary/10 text-primary"
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{getFlagEmoji(lang.code)}</span>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{lang.nativeName}</span>
                {variant === "full" && (
                  <span className="text-xs text-muted-foreground">{lang.name}</span>
                )}
              </div>
            </div>
            {language === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
