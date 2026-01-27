import ReactGA from "react-ga4";

// Event categories
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: "page_view",
  VIEW_PACKAGE: "view_package",
  BEGIN_CHECKOUT: "begin_checkout",
  PURCHASE: "purchase",
  CONTACT_SUBMIT: "contact_submit",
  VISA_APPLICATION: "visa_application",
  BUTTON_CLICK: "button_click",
} as const;

interface TrackEventParams {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}

export const useAnalytics = () => {
  const trackEvent = ({
    action,
    category = "engagement",
    label,
    value,
    ...additionalParams
  }: TrackEventParams) => {
    try {
      ReactGA.event({
        action,
        category,
        label,
        value,
        ...additionalParams,
      });
    } catch (error) {
      console.error("Analytics event error:", error);
    }
  };

  const trackPageView = (path: string, title?: string) => {
    try {
      ReactGA.send({
        hitType: "pageview",
        page: path,
        title: title || document.title,
      });
    } catch (error) {
      console.error("Analytics pageview error:", error);
    }
  };

  const trackPackageView = (packageId: string, packageName: string, packageType: string) => {
    trackEvent({
      action: ANALYTICS_EVENTS.VIEW_PACKAGE,
      category: "ecommerce",
      label: packageName,
      package_id: packageId,
      package_type: packageType,
    });
  };

  const trackBeginCheckout = (packageId: string, packageName: string, price: number) => {
    trackEvent({
      action: ANALYTICS_EVENTS.BEGIN_CHECKOUT,
      category: "ecommerce",
      label: packageName,
      value: price,
      package_id: packageId,
    });
  };

  const trackPurchase = (bookingId: string, packageName: string, price: number, paymentMethod: string) => {
    trackEvent({
      action: ANALYTICS_EVENTS.PURCHASE,
      category: "ecommerce",
      label: packageName,
      value: price,
      booking_id: bookingId,
      payment_method: paymentMethod,
    });
  };

  const trackContactSubmit = (formType: string) => {
    trackEvent({
      action: ANALYTICS_EVENTS.CONTACT_SUBMIT,
      category: "engagement",
      label: formType,
    });
  };

  const trackVisaApplication = (country: string, price: number) => {
    trackEvent({
      action: ANALYTICS_EVENTS.VISA_APPLICATION,
      category: "ecommerce",
      label: country,
      value: price,
    });
  };

  const trackButtonClick = (buttonName: string, location?: string) => {
    trackEvent({
      action: ANALYTICS_EVENTS.BUTTON_CLICK,
      category: "engagement",
      label: buttonName,
      button_location: location,
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackPackageView,
    trackBeginCheckout,
    trackPurchase,
    trackContactSubmit,
    trackVisaApplication,
    trackButtonClick,
  };
};
