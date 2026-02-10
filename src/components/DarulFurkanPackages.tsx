import { useState, useEffect, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { 
  Plane, Hotel, Bus, UtensilsCrossed, Gift, Star, Calendar, 
  CheckCircle2, Clock, Users, Award, Sparkles, MapPin, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";
import MakkahIcon from "./icons/MakkahIcon";

const BookingModal = lazy(() => import("@/components/BookingModal"));

const DarulFurkanPackages = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [dbContent, setDbContent] = useState<any>(null);
  const { t, language, isRTL } = useTranslation();

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from("darul_furkan_content" as any)
        .select("*")
        .limit(1)
        .single();
      if (data) setDbContent(data);
    };
    fetchContent();
  }, []);

  const handleBookNow = (pkg: any) => {
    setSelectedPackage(pkg);
    setIsBookingModalOpen(true);
  };

  // Use DB content with hardcoded fallbacks
  const db = dbContent as any;

  const content = {
    bn: {
      sectionBadge: db?.section_badge || "২০২৬ হজ্জ পরবর্তী উমরাহ প্যাকেজ",
      sectionTitle: db?.section_title || "উমরাহ প্যাকেজ",
      sectionTitleHighlight: db?.section_title_highlight || "২০২৬",
      sectionSubtitle: db?.section_subtitle || "হজ্জ পরবর্তী উমরাহ প্যাকেজ - সম্পূর্ণ সেবা সহ পবিত্র ভূমিতে আপনার যাত্রা",
      lotteryTitle: db?.lottery_title || "লটারির মাধ্যমে ফ্রি উমরাহ!",
      lotterySubtitle: db?.lottery_subtitle || "প্রতি ৫০ জনে একজন সুযোগ পাবেন",
      specialOffer: db?.special_offer_label || "বিশেষ অফারের সময়সীমা",
      offerDates: db?.offer_dates || "২৪ জানুয়ারি - ১০ ফেব্রুয়ারি",
      includesTitle: db?.includes_title || "প্যাকেজের অন্তর্ভুক্ত",
      includesSubtitle: db?.includes_subtitle || "যা যা অন্তর্ভুক্ত",
      packagePrice: "প্যাকেজ মূল্য",
      flightDate: "ফ্লাইটের তারিখ",
      bookNow: db?.book_now_text || "এখনই বুক করুন",
      selectPackage: db?.select_package_text || "প্যাকেজ নির্বাচন করুন",
      itikafBadge: db?.itikaf_badge || "পবিত্র রমজানে ইতেকাফ",
      itikafTitle: db?.itikaf_title || "ইতেকাফ প্যাকেজ",
      contactTitle: db?.contact_title || "দারুল ফুরকান ট্যুরস এন্ড ট্রাভেলস",
      contactSubtitle: db?.contact_subtitle || "যোগাযোগ করুন",
      address: "ঠিকানা",
      addressText: db?.contact_address || "৩৮২, বাগানবাড়ী, স্বাধীনতা সরণি,\nউত্তর বাড্ডা, ঢাকা ১২১২",
      phone: "ফোন",
      specialOfferLabel: "বিশেষ অফার",
      discountText: db?.discount_text || "বিশেষ ছাড় চলছে!",
    },
    en: {
      sectionBadge: "Umrah Package After Hajj 2026",
      sectionTitle: "Umrah Package",
      sectionTitleHighlight: "2026",
      sectionSubtitle: "Post-Hajj Umrah Package - Complete service for your journey to the Holy Land",
      lotteryTitle: "Free Umrah via Lottery!",
      lotterySubtitle: "1 in every 50 gets the opportunity",
      specialOffer: "Special Offer Period",
      offerDates: db?.offer_dates || "24 January - 10 February",
      includesTitle: "Package Includes",
      includesSubtitle: "What's Included",
      packagePrice: "Package Price",
      flightDate: "Flight Date",
      bookNow: "Book Now",
      selectPackage: "Select Package",
      itikafBadge: "Holy Ramadan Itikaf",
      itikafTitle: "Itikaf Packages",
      contactTitle: "Darul Furkan Tours & Travels",
      contactSubtitle: "Contact Us",
      address: "Address",
      addressText: "382, Baganbari, Swadhinata Sarani,\nUttar Badda, Dhaka 1212",
      phone: "Phone",
      specialOfferLabel: "Special Offer",
      discountText: "Special discount available!",
    },
    ar: {
      sectionBadge: "باقة العمرة بعد الحج ٢٠٢٦",
      sectionTitle: "باقة العمرة",
      sectionTitleHighlight: "٢٠٢٦",
      sectionSubtitle: "باقة العمرة بعد الحج - خدمة كاملة لرحلتك إلى الأراضي المقدسة",
      lotteryTitle: "عمرة مجانية عبر القرعة!",
      lotterySubtitle: "فرصة لـ ١ من كل ٥٠",
      specialOffer: "فترة العرض الخاص",
      offerDates: "٢٤ يناير - ١٠ فبراير",
      includesTitle: "تشمل الباقة",
      includesSubtitle: "ما هو مشمول",
      packagePrice: "سعر الباقة",
      flightDate: "تاريخ الرحلة",
      bookNow: "احجز الآن",
      selectPackage: "اختر الباقة",
      itikafBadge: "اعتكاف رمضان المبارك",
      itikafTitle: "باقات الاعتكاف",
      contactTitle: "دار الفرقان للسفر والسياحة",
      contactSubtitle: "اتصل بنا",
      address: "العنوان",
      addressText: "٣٨٢، باغانباري، شارع الاستقلال،\nأوتار بادا، دكا ١٢١٢",
      phone: "الهاتف",
      specialOfferLabel: "عرض خاص",
      discountText: "خصم خاص متاح!",
    },
  };

  const c = content[language as keyof typeof content] || content.bn;

  // Use DB data for dynamic arrays
  const dbInclusions = db?.package_inclusions as string[] | undefined;
  const packageInclusions = dbInclusions || (language === "bn" ? [
    "ভিসা (Visa)", "এয়ার টিকেট (Air Ticket)", "রিয়াজুল জান্নাহ (Riyazul Jannah)",
    "হোটেল (Hotel)", "ট্রান্সপোর্ট (Transport)", "জিয়ারাহ (Ziyarah)", "৩ বেলা খাবার (3 Meals/Day)",
  ] : language === "ar" ? [
    "تأشيرة", "تذكرة طيران", "رياض الجنة", "فندق", "مواصلات", "زيارة", "٣ وجبات يومياً",
  ] : [
    "Visa", "Air Ticket", "Riyazul Jannah", "Hotel", "Transport", "Ziyarah", "3 Meals/Day",
  ]);

  const defaultFlightPackages = [
    { type: "Transit Flight", typeBn: "ট্রানজিট ফ্লাইট", typeAr: "رحلة ترانزيت", price: 135000, flightDate: "10 June 2026", flightDateBn: "১০ জুন ২০২৬", flightDateAr: "١٠ يونيو ٢٠٢٦", highlight: false },
    { type: "Direct Flight", typeBn: "ডিরেক্ট ফ্লাইট", typeAr: "رحلة مباشرة", price: 145000, flightDate: "15 June 2026", flightDateBn: "১৫ জুন ২০২৬", flightDateAr: "١٥ يونيو ٢٠٢٦", highlight: true },
  ];
  const flightPackages = (db?.flight_packages as typeof defaultFlightPackages) || defaultFlightPackages;

  const defaultItikafPackages = [
    { days: 15, daysBn: "১৫ দিন", daysAr: "١٥ يوم", daysEn: "15 Days", price: 165000, label: "15 Days Itikaf", labelBn: "১৫ দিনের ইতেকাফ", labelAr: "اعتكاف ١٥ يوم" },
    { days: 20, daysBn: "২০ দিন", daysAr: "٢٠ يوم", daysEn: "20 Days", price: 170000, label: "20 Days Itikaf", labelBn: "২০ দিনের ইতেকাফ", labelAr: "اعتكاف ٢٠ يوم" },
    { days: 30, daysBn: "৩০ দিন", daysAr: "٣٠ يوم", daysEn: "30 Days", price: 192000, label: "30 Days Itikaf", labelBn: "৩০ দিনের ইতেকাফ", labelAr: "اعتكاف ٣٠ يوم" },
  ];
  const itikafPackages = (db?.itikaf_packages as typeof defaultItikafPackages) || defaultItikafPackages;

  const contactPhones = (db?.contact_phones as string[]) || ["01741-719932", "01339-080532"];

  const getFlightType = (pkg: typeof flightPackages[0]) => {
    if (language === "bn") return pkg.typeBn;
    if (language === "ar") return pkg.typeAr;
    return pkg.type;
  };

  const getFlightDate = (pkg: typeof flightPackages[0]) => {
    if (language === "bn") return pkg.flightDateBn;
    if (language === "ar") return pkg.flightDateAr;
    return pkg.flightDate;
  };

  const getItikafDays = (pkg: typeof itikafPackages[0]) => {
    if (language === "bn") return pkg.daysBn;
    if (language === "ar") return pkg.daysAr;
    return pkg.daysEn;
  };

  const getItikafLabel = (pkg: typeof itikafPackages[0]) => {
    if (language === "bn") return pkg.labelBn;
    if (language === "ar") return pkg.labelAr;
    return pkg.label;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <section 
      id="umrah-packages" 
      className="py-20 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 islamic-star-pattern opacity-30" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-semibold">
            <Sparkles className="w-4 h-4 mr-2" />
            {c.sectionBadge}
          </Badge>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            {c.sectionTitle} <span className="text-gradient-green">{c.sectionTitleHighlight}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {c.sectionSubtitle}
          </p>
        </motion.div>

        {/* Lottery Offer Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-12 bg-gradient-to-r from-primary via-emerald-dark to-primary rounded-3xl p-6 md:p-8 text-primary-foreground shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary rounded-full flex items-center justify-center shadow-gold">
                <Gift className="w-8 h-8 md:w-10 md:h-10 text-foreground" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-1">
                  {c.lotteryTitle}
                </h3>
                <p className="text-primary-foreground/80 text-lg">
                  {c.lotterySubtitle}
                </p>
              </div>
            </div>
            <div className="bg-secondary/20 backdrop-blur-sm rounded-xl px-6 py-4 border border-secondary/30">
              <p className="text-sm text-primary-foreground/70 mb-1">{c.specialOffer}</p>
              <p className="text-xl md:text-2xl font-bold">
                {c.offerDates}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Package Inclusions Card */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="df-card h-full p-8 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MakkahIcon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground">{c.includesTitle}</h3>
                  <p className="text-sm text-muted-foreground">{c.includesSubtitle}</p>
                </div>
              </div>
              
              <ul className="space-y-4">
                {packageInclusions.map((item, index) => (
                  <motion.li
                    key={index}
                    variants={itemVariants}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Flight Packages */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {flightPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.type}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`df-card relative overflow-hidden ${
                    pkg.highlight 
                      ? "ring-2 ring-secondary shadow-gold" 
                      : ""
                  }`}
                >
                  {pkg.highlight && (
                    <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'}`}>
                      <div className={`bg-secondary text-foreground text-xs font-bold px-4 py-1 ${isRTL ? 'rounded-br-xl' : 'rounded-bl-xl'}`}>
                        {language === "bn" ? "সুপারিশকৃত" : language === "ar" ? "موصى به" : "RECOMMENDED"}
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        pkg.highlight 
                          ? "bg-secondary text-foreground" 
                          : "bg-primary/10 text-primary"
                      }`}>
                        <Plane className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-heading text-xl font-bold text-foreground">{getFlightType(pkg)}</h4>
                        <p className="text-sm text-muted-foreground">{pkg.type}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm text-muted-foreground mb-1">{c.packagePrice}</p>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl md:text-5xl font-bold ${
                          pkg.highlight ? "text-gradient-gold" : "text-gradient-green"
                        }`}>
                          {formatCurrency(pkg.price)}
                        </span>
                        <span className="text-muted-foreground">/-</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl mb-6">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">{c.flightDate}</p>
                        <p className="font-semibold text-foreground">{getFlightDate(pkg)}</p>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleBookNow({ 
                        id: pkg.highlight ? "direct" : "transit", 
                        title: getFlightType(pkg), 
                        price: pkg.price, 
                        type: "umrah",
                        duration_days: 14
                      })}
                      className={`w-full ${
                        pkg.highlight 
                          ? "bg-gradient-gold hover:opacity-90 text-foreground" 
                          : "bg-gradient-primary hover:opacity-90"
                      }`}
                      size="lg"
                    >
                      {c.bookNow}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Itikaf Packages */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-secondary/10 text-secondary border-secondary/20">
              <Star className="w-4 h-4 mr-2" />
              {c.itikafBadge}
            </Badge>
            <h3 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              {c.itikafTitle}
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {itikafPackages.map((pkg, index) => (
              <motion.div
                key={pkg.days}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="df-card text-center p-6 md:p-8"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                
                <h4 className="font-heading text-2xl font-bold text-foreground mb-2">
                  {getItikafDays(pkg)}
                </h4>
                <p className="text-muted-foreground mb-6">{getItikafLabel(pkg)}</p>
                
                <div className="mb-6">
                  <span className="text-3xl md:text-4xl font-bold text-gradient-green">
                    {formatCurrency(pkg.price)}
                  </span>
                  <span className="text-muted-foreground">/-</span>
                </div>

                <Button 
                  onClick={() => handleBookNow({ 
                    id: `itikaf-${pkg.days}`, 
                    title: getItikafLabel(pkg), 
                    price: pkg.price, 
                    type: "umrah",
                    duration_days: pkg.days
                  })}
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  {c.selectPackage}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-primary to-emerald-dark rounded-3xl p-8 md:p-12 text-primary-foreground"
        >
          <div className="text-center mb-8">
            <h3 className="font-heading text-2xl md:text-3xl font-bold mb-2">
              {c.contactTitle}
            </h3>
            <p className="text-primary-foreground/80">{c.contactSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-primary-foreground/70 mb-1">{c.address}</p>
                <p className="font-medium whitespace-pre-line">
                  {c.addressText}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                <span className="text-xl">📞</span>
              </div>
              <div>
                <p className="text-sm text-primary-foreground/70 mb-1">{c.phone}</p>
                {contactPhones.map((phone, idx) => (
                  <a key={idx} href={`tel:+88${phone.replace(/-/g, '')}`} className="block font-bold text-xl hover:text-secondary transition-colors">
                    {phone}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-primary-foreground/70 mb-1">{c.specialOfferLabel}</p>
                <p className="font-bold text-secondary">
                  {c.offerDates}
                </p>
                <p className="text-sm text-primary-foreground/80">{c.discountText}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Booking Modal */}
      <Suspense fallback={null}>
        {isBookingModalOpen && selectedPackage && (
          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            package_info={{
              id: selectedPackage.id,
              title: selectedPackage.title,
              price: selectedPackage.price,
              type: selectedPackage.type,
              duration_days: selectedPackage.duration_days,
            }}
          />
        )}
      </Suspense>
    </section>
  );
};

export default DarulFurkanPackages;
