import { Eye } from "lucide-react";

const DemoModeBanner = () => {
  return (
    <div className="bg-warning text-warning-foreground px-4 py-2.5 flex items-center justify-center gap-2">
      <Eye className="w-4 h-4" />
      <span className="text-sm font-medium">
        ডেমো মোড - শুধুমাত্র দেখার জন্য (Demo Mode - View Only)
      </span>
    </div>
  );
};

export default DemoModeBanner;
