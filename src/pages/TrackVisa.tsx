import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Search, 
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  PartyPopper,
  Calendar,
  Globe,
  AlertCircle,
  User,
  Phone,
  CreditCard
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { format } from "date-fns";

type VisaStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'completed';

interface VisaApplication {
  id: string;
  status: VisaStatus;
  payment_status: string;
  admin_notes: string | null;
  total_price: number;
  applicant_count: number;
  travel_date: string | null;
  created_at: string;
  applicant_name: string;
  visa_countries: {
    country_name: string;
    flag_emoji: string;
    processing_time: string;
  };
}

const visaSteps: { status: VisaStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { status: 'pending', label: 'Submitted', icon: FileText },
  { status: 'processing', label: 'Processing', icon: Clock },
  { status: 'approved', label: 'Approved', icon: CheckCircle },
  { status: 'completed', label: 'Completed', icon: PartyPopper },
];

const getStatusIndex = (status: VisaStatus): number => {
  if (status === 'rejected') return -1;
  return visaSteps.findIndex(step => step.status === status);
};

const getStatusColor = (status: VisaStatus): string => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
    default: return 'bg-muted';
  }
};

const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'pending_cash': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    case 'pending_verification': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default: return 'bg-muted';
  }
};

const searchSchema = z.object({
  applicationId: z.string().min(6, "Application ID must be at least 6 characters").max(50),
  phone: z.string().min(5, "Please enter a valid phone number").max(20),
});

const TrackVisa = () => {
  const { toast } = useToast();
  const [applicationId, setApplicationId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<VisaApplication | null>(null);
  const [searched, setSearched] = useState(false);
  const [errors, setErrors] = useState<{ applicationId?: string; phone?: string }>({});

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const validation = searchSchema.safeParse({ 
      applicationId: applicationId.trim(), 
      phone: phone.trim() 
    });
    
    if (!validation.success) {
      const fieldErrors: { applicationId?: string; phone?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === 'applicationId') fieldErrors.applicationId = err.message;
        if (err.path[0] === 'phone') fieldErrors.phone = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setSearched(true);
    setApplication(null);

    try {
      const searchId = applicationId.trim().toLowerCase();
      const searchPhone = phone.trim();

      const { data, error } = await supabase
        .from("visa_applications")
        .select(`
          id,
          status,
          payment_status,
          admin_notes,
          total_price,
          applicant_count,
          travel_date,
          created_at,
          applicant_name,
          applicant_phone,
          visa_countries (
            country_name,
            flag_emoji,
            processing_time
          )
        `)
        .ilike("applicant_phone", `%${searchPhone}%`);

      if (error) {
        console.error("Search error:", error);
        toast({
          title: "Search Error",
          description: "An error occurred while searching. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const matchedApplication = data?.find(app => 
        app.id.toLowerCase().startsWith(searchId) || 
        app.id.slice(0, 8).toLowerCase() === searchId
      );

      if (matchedApplication) {
        const { applicant_phone, ...safeApplication } = matchedApplication;
        setApplication(safeApplication as VisaApplication);
      } else {
        setApplication(null);
      }
    } catch (err) {
      console.error("Search error:", err);
      toast({
        title: "Error",
        description: "Failed to search for application.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setApplication(null);
    setSearched(false);
    setApplicationId("");
    setPhone("");
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pt-40 pb-20">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-heading text-3xl font-bold">Track Visa Application</h1>
            <p className="text-muted-foreground">Check your visa application status</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Find Your Application
                </CardTitle>
                <CardDescription>
                  Enter your application ID and the phone number used during application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="applicationId">Application ID</Label>
                    <Input
                      id="applicationId"
                      placeholder="e.g., A1B2C3D4"
                      value={applicationId}
                      onChange={(e) => setApplicationId(e.target.value.toUpperCase())}
                      className={errors.applicationId ? "border-destructive" : ""}
                    />
                    {errors.applicationId && (
                      <p className="text-sm text-destructive">{errors.applicationId}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      You can find this in your application confirmation
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="Enter the phone number used for application"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Track Application
                        </>
                      )}
                    </Button>
                    {searched && (
                      <Button type="button" variant="outline" onClick={handleReset}>
                        Clear
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          {searched && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {application ? (
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-primary text-primary-foreground">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{application.visa_countries.flag_emoji}</span>
                        <div>
                          <CardTitle className="text-white">
                            {application.visa_countries.country_name} Visa
                          </CardTitle>
                          <CardDescription className="text-primary-foreground/80">
                            Processing Time: {application.visa_countries.processing_time}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                        {application.id.slice(0, 8).toUpperCase()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Badge className={cn("text-sm py-1 px-3", getStatusColor(application.status))}>
                          {application.status === 'rejected' && <XCircle className="w-4 h-4 mr-1" />}
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                        <Badge className={cn("text-sm py-1 px-3", getPaymentStatusColor(application.payment_status))}>
                          <CreditCard className="w-3 h-3 mr-1" />
                          {application.payment_status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>

                    {/* Progress Tracker (only show if not rejected) */}
                    {application.status !== 'rejected' && (
                      <div className="mb-8">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Application Progress
                        </h3>
                        <div className="relative pt-2">
                          <div className="flex items-center justify-between relative">
                            <div className="absolute left-0 right-0 top-4 h-1 bg-muted rounded-full" />
                            <div 
                              className="absolute left-0 top-4 h-1 bg-primary rounded-full transition-all duration-500"
                              style={{ 
                                width: `${(getStatusIndex(application.status) / (visaSteps.length - 1)) * 100}%` 
                              }}
                            />
                            
                            {visaSteps.map((step, stepIndex) => {
                              const currentIndex = getStatusIndex(application.status);
                              const isCompleted = stepIndex <= currentIndex;
                              const isCurrent = stepIndex === currentIndex;
                              const Icon = step.icon;

                              return (
                                <div 
                                  key={step.status} 
                                  className="relative z-10 flex flex-col items-center"
                                >
                                  <div
                                    className={cn(
                                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                                      isCompleted
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground",
                                      isCurrent && "ring-4 ring-primary/20 scale-110"
                                    )}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <span className={cn(
                                    "text-xs mt-2 text-center max-w-[60px]",
                                    isCompleted ? "text-foreground font-medium" : "text-muted-foreground"
                                  )}>
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rejection Notice */}
                    {application.status === 'rejected' && (
                      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-red-800 dark:text-red-300">Application Rejected</p>
                            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                              Unfortunately, your visa application was not approved. Please contact us for more information.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Approval Notice */}
                    {application.status === 'approved' && (
                      <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-300">🎉 Visa Approved!</p>
                            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                              Congratulations! Your visa has been approved. Please contact us for the next steps.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Admin Notes */}
                    {application.admin_notes && (
                      <div className="mb-6 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                        <p className="text-sm font-medium mb-1">Latest Update</p>
                        <p className="text-sm text-muted-foreground">{application.admin_notes}</p>
                      </div>
                    )}

                    {/* Application Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" /> Applicant
                        </p>
                        <p className="font-medium">{application.applicant_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Applicants</p>
                        <p className="font-medium">{application.applicant_count} person(s)</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Travel Date
                        </p>
                        <p className="font-medium">
                          {application.travel_date 
                            ? format(new Date(application.travel_date), "dd MMM yyyy")
                            : "To be confirmed"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Amount</p>
                        <p className="font-bold text-primary text-lg">
                          {formatCurrency(application.total_price)}
                        </p>
                      </div>
                    </div>

                    {/* Applied Date */}
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        Applied on: {format(new Date(application.created_at), "dd MMM yyyy, hh:mm a")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Application Not Found</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      We couldn't find an application matching your details. Please check your application ID and phone number and try again.
                    </p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Tips:</p>
                      <ul className="list-disc list-inside text-left max-w-xs mx-auto">
                        <li>The application ID is 8 characters (e.g., A1B2C3D4)</li>
                        <li>Use the same phone number from your application</li>
                        <li>Check your confirmation message for the correct ID</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Additional Links */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-muted-foreground">
              Looking for package booking?{" "}
              <Link to="/track-order" className="text-primary hover:underline">
                Track your order here
              </Link>
            </p>
            <p className="text-muted-foreground">
              Have an account?{" "}
              <Link to="/auth" className="text-primary hover:underline">
                Log in
              </Link>
              {" "}to see all your applications.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrackVisa;
