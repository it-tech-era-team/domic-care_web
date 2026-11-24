export type Language = "en" | "bg";

export const translations = {
  en: {
    // Navigation & Common
    home: "Home",
    services: "Services",
    caregivers: "Caregivers",
    aboutUs: "About Us",
    contact: "Contact",
    signIn: "Sign In",
    signUp: "Sign Up",
    logout: "Log Out",
    getStarted: "Get Started",
    language: "Language",
    
    // Auth
    email: "Email Address",
    password: "Password",
    forgotPassword: "Forgot Password?",
    continueWithGoogle: "Continue with Google",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    resendConfirmation: "Resend confirmation email",
    resetPassword: "Reset Password",
    
    // Caregiver & Booking
    bookCareAppointment: "Book Care Appointment",
    submitCareRequest: "Submit Care Request",
    careLocation: "Care Location / Patient Address",
    primaryCareArea: "Primary Care Area",
    servicesOffered: "Services Offered",
    aboutCaregiver: "About Caregiver",
    yearsExperience: "Years Experience",
    hourlyRate: "Hourly Rate",
    estimatedTotal: "Estimated Total",
    platformFee: "Platform Service Fee (12%)",
    newCaregiver: "New",
    verifiedCaregiver: "Verified Caregiver",
    noServicesListed: "No specific services listed currently.",
    
    // Statuses
    pending: "Pending Approval",
    awaitingPayment: "Awaiting Payment",
    accepted: "Care Confirmed",
    completed: "Care Completed",
    cancelled: "Cancelled",
    paid: "Paid",
    unpaid: "Unpaid",
    
    // Actions & Messages
    payNow: "Pay Now",
    chat: "Chat",
    cancelRequest: "Cancel Request",
    leaveReview: "Leave Review",
    locationUpdated: "Location updated successfully!",
  },
  bg: {
    // Navigation & Common
    home: "Начало",
    services: "Услуги",
    caregivers: "Болногледачи",
    aboutUs: "За нас",
    contact: "Контакти",
    signIn: "Вход",
    signUp: "Регистрация",
    logout: "Изход",
    getStarted: "Започнете",
    language: "Език",
    
    // Auth
    email: "Имейл адрес",
    password: "Парола",
    forgotPassword: "Забравена парола?",
    continueWithGoogle: "Продължи с Google",
    dontHaveAccount: "Нямате профил?",
    alreadyHaveAccount: "Вече имате профил?",
    resendConfirmation: "Изпрати отново потвърждение",
    resetPassword: "Възстановяване на парола",
    
    // Caregiver & Booking
    bookCareAppointment: "Запази час за грижа",
    submitCareRequest: "Изпрати заявка за грижа",
    careLocation: "Адрес на пациента / Място за грижа",
    primaryCareArea: "Основен район за обслужване",
    servicesOffered: "Предлагани услуги",
    aboutCaregiver: "За болногледача",
    yearsExperience: "години опит",
    hourlyRate: "Почасова ставка",
    estimatedTotal: "Крайна цена",
    platformFee: "Такса платформа (12%)",
    newCaregiver: "Нов",
    verifiedCaregiver: "Потвърден болногледач",
    noServicesListed: "Все още няма посочени конкретни услуги.",
    
    // Statuses
    pending: "Чака одобрение",
    awaitingPayment: "Очаква плащане",
    accepted: "Потвърдена грижа",
    completed: "Приключена грижа",
    cancelled: "Отказана",
    paid: "Платено",
    unpaid: "Неплатено",
    
    // Actions & Messages
    payNow: "Плати сега",
    chat: "Чат",
    cancelRequest: "Откажи заявка",
    leaveReview: "Остави отзив",
    locationUpdated: "Локацията е обновена успешно!",
  },
};

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem("domiccare_lang");
    if (saved === "bg" || saved === "en") return saved;
  } catch {}
  return "en";
}

export function setStoredLanguage(lang: Language) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("domiccare_lang", lang);
    window.dispatchEvent(new Event("domiccare_language_changed"));
  } catch {}
}

export function t(key: keyof typeof translations.en, lang: Language = "en"): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}
