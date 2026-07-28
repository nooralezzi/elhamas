"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError, fieldInvalidClass } from "@/components/ui/field-error";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import {
  firstErrorMessage,
  hasErrors,
  setError,
  trimValue,
  digitsOnly,
  validateContactFields,
  validateMessage,
  validateSubject,
  handlePhoneInput,
  handleCountryCodeInput,
  handleLettersOnlyInput,
  type FieldErrors,
} from "@/lib/form-validation";

const ACCENT = "#4a1c20";
const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const contactInfo = [
  {
    key: "contact.info.address" as const,
    valueEn: "Makkah, Saudi Arabia",
    valueAr: "مكه، المملكة العربية السعودية",
    icon: MapPin,
  },
  {
    key: "contact.info.phone" as const,
    valueEn: "+966 56 661 0996",
    valueAr: "+966 56 661 0996",
    icon: Phone,
  },
  {
    key: "contact.info.email" as const,
    valueEn: "support@elhamas.com",
    valueAr: "support@elhamas.com",
    icon: Mail,
  },
  {
    key: "contact.info.hours" as const,
    valueEn: "Sun–Thu 9AM–6PM",
    valueAr: "الأحد–الخميس ٩ص–٦م",
    icon: Clock,
  },
];

export function ContactFormSection() {
  const { t, locale, isRTL } = useI18n();
  const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>(0.08);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setFormError(null);
    setSubmitted(false);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const countryCode = trimValue(formData.get("countryCode")) || "+966";
    const phone = digitsOnly(trimValue(formData.get("phone")));
    const name = trimValue(formData.get("name"));
    const email = trimValue(formData.get("email"));
    const nationality = trimValue(formData.get("nationality"));
    const subject = trimValue(formData.get("subject"));
    const message = trimValue(formData.get("message"));

    const errors = validateContactFields(
      {
        name,
        email,
        phone: trimValue(formData.get("phone")),
        countryCode,
        nationality,
        phoneRequired: true,
      },
      locale,
    );
    setError(errors, "subject", validateSubject(subject, locale));
    setError(errors, "message", validateMessage(message, locale));

    if (hasErrors(errors)) {
      setFieldErrors(errors);
      setFormError(firstErrorMessage(errors, locale));
      return;
    }

    setFieldErrors({});
    setLoading(true);
    const fullPhone = `${countryCode} ${phone}`;
    const payload = {
      type: "contact",
      referenceId: "contact",
      referenceName: subject || "Contact Form",
      name,
      email,
      nationality: nationality || undefined,
      countryCode,
      phone: fullPhone,
      message,
      locale,
    };
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Request failed");
      }
      setSubmitted(true);
      form.reset();
      const countryInput = form.querySelector<HTMLInputElement>('[name="countryCode"]');
      if (countryInput) countryInput.value = "+966";
    } catch (err) {
      console.error(err);
      setFormError(
        locale === "ar"
          ? "حدث خطأ أثناء الإرسال. حاول مرة أخرى."
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="py-10 sm:py-14 md:py-16 lg:py-20 bg-white scroll-mt-[4.5rem] overflow-x-hidden"
    >
      <div className="container mx-auto px-3 sm:px-4 min-w-0">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-8 sm:mb-10 md:mb-12"
            initial={{ opacity: 0, y: 16 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: easeOutExpo }}
          >
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold mb-2 break-words"
              style={{ color: ACCENT }}
            >
              {t("contact.title")}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto break-words px-2">
              {t("contact.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
            {/* Form */}
            <motion.div
              className="lg:col-span-2 min-w-0"
              initial={{ opacity: 0, x: -16 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.08, ease: easeOutExpo }}
            >
              <form
                onSubmit={handleSubmit}
                noValidate
                className={cn(
                  "rounded-xl sm:rounded-2xl border border-border/60 bg-muted/30 p-4 sm:p-6 md:p-8 transition-shadow duration-300 hover:shadow-md focus-within:shadow-md",
                  isRTL && "text-right",
                )}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name" className="text-foreground">
                      {t("contact.form.name")}
                    </Label>
                    <Input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      maxLength={100}
                      autoComplete="name"
                      aria-invalid={Boolean(fieldErrors.name)}
                      placeholder={t("contact.form.name")}
                      className={cn(
                        "bg-background transition-[box-shadow] duration-200",
                        fieldInvalidClass(Boolean(fieldErrors.name)),
                      )}
                      dir={isRTL ? "rtl" : "ltr"}
                      onInput={handleLettersOnlyInput}
                    />
                    <FieldError message={fieldErrors.name} isRTL={isRTL} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email" className="text-foreground">
                      {t("contact.form.email")}
                    </Label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      maxLength={255}
                      autoComplete="email"
                      inputMode="email"
                      aria-invalid={Boolean(fieldErrors.email)}
                      placeholder={t("contact.form.email")}
                      className={cn(
                        "bg-background transition-[box-shadow] duration-200",
                        fieldInvalidClass(Boolean(fieldErrors.email)),
                      )}
                      dir={isRTL ? "rtl" : "ltr"}
                    />
                    <FieldError message={fieldErrors.email} isRTL={isRTL} />
                  </div>
                </div>
                <div className="space-y-2 mb-3 sm:mb-4">
                    <Label htmlFor="contact-phone" className="text-foreground">
                      {t("contact.form.phone")}
                    </Label>
                    <div
                      className={cn(
                        "flex gap-0 rounded-lg border border-input bg-background overflow-hidden transition-[box-shadow] duration-200 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                        isRTL && "flex-row-reverse",
                        (fieldErrors.phone || fieldErrors.countryCode) && "border-red-500",
                      )}
                    >
                      <Input
                        id="contact-countryCode"
                        name="countryCode"
                        type="tel"
                        required
                        defaultValue="+966"
                        inputMode="tel"
                        pattern="\+\d{1,4}"
                        maxLength={5}
                        className={cn(
                          "w-20 sm:w-24 shrink-0 rounded-none border-0 bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0",
                          isRTL ? "border-l border-input" : "border-r border-input",
                        )}
                        dir="ltr"
                        aria-invalid={Boolean(fieldErrors.countryCode)}
                        aria-label={t("inquiry.form.countryCode")}
                        onInput={handleCountryCodeInput}
                      />
                      <Input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        required
                        inputMode="numeric"
                        pattern="[0-9]{6,15}"
                        maxLength={15}
                        placeholder={t("contact.form.phone")}
                        className="flex-1 min-w-0 rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        dir="ltr"
                        aria-invalid={Boolean(fieldErrors.phone)}
                        aria-label={t("contact.form.phone")}
                        onInput={handlePhoneInput}
                      />
                    </div>
                    <FieldError message={fieldErrors.countryCode || fieldErrors.phone} isRTL={isRTL} />
                  </div>
                <div className="space-y-2 mb-3 sm:mb-4">
                    <Label htmlFor="contact-nationality" className="text-foreground">
                      {t("inquiry.form.nationality")}
                    </Label>
                    <Input
                      id="contact-nationality"
                      name="nationality"
                      type="text"
                      maxLength={100}
                      aria-invalid={Boolean(fieldErrors.nationality)}
                      placeholder={t("inquiry.form.nationality")}
                      className={cn(
                        "bg-background transition-[box-shadow] duration-200",
                        fieldInvalidClass(Boolean(fieldErrors.nationality)),
                      )}
                      dir={isRTL ? "rtl" : "ltr"}
                      onInput={handleLettersOnlyInput}
                    />
                    <FieldError message={fieldErrors.nationality} isRTL={isRTL} />
                  </div>
                <div className="space-y-2 mb-3 sm:mb-4">
                    <Label htmlFor="contact-subject" className="text-foreground">
                      {t("contact.form.subject")}
                    </Label>
                    <Input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      required
                      maxLength={255}
                      aria-invalid={Boolean(fieldErrors.subject)}
                      placeholder={t("contact.form.subject")}
                      className={cn(
                        "bg-background transition-[box-shadow] duration-200",
                        fieldInvalidClass(Boolean(fieldErrors.subject)),
                      )}
                      dir={isRTL ? "rtl" : "ltr"}
                    />
                    <FieldError message={fieldErrors.subject} isRTL={isRTL} />
                  </div>
                <div className="space-y-2 mb-4 sm:mb-6">
                  <Label htmlFor="contact-message" className="text-foreground">
                    {t("contact.form.message")}
                  </Label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={4}
                    maxLength={5000}
                    aria-invalid={Boolean(fieldErrors.message)}
                    placeholder={t("contact.form.message")}
                    className={cn(
                      "bg-background resize-none transition-[box-shadow] duration-200",
                      fieldInvalidClass(Boolean(fieldErrors.message)),
                    )}
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                  <FieldError message={fieldErrors.message} isRTL={isRTL} />
                </div>
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4" style={isRTL ? { textAlign: "right" } : undefined}>
                    {error}
                  </p>
                )}
                {submitted && !error && (
                  <motion.p
                    className="text-sm font-medium mb-4 rounded-lg py-2 px-3 bg-green-500/10 text-green-700 dark:text-green-400"
                    style={isRTL ? { textAlign: "right" } : undefined}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: easeOutExpo }}
                  >
                    {t("contact.form.success")}
                  </motion.p>
                )}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg font-medium text-white hover:opacity-90 w-full sm:w-auto min-w-0 sm:min-w-[160px] transition-opacity duration-200"
                    style={{ backgroundColor: ACCENT }}
                  >
                    {loading
                      ? locale === "ar"
                        ? "جاري الإرسال..."
                        : "Sending..."
                      : t("contact.form.submit")}
                  </Button>
                </motion.div>
              </form>
            </motion.div>

            {/* Contact info */}
            <motion.div
              className="space-y-4 sm:space-y-6 min-w-0"
              initial={{ opacity: 0, x: 16 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.12, ease: easeOutExpo }}
            >
              <h3
                className="text-base sm:text-lg font-semibold break-words"
                style={{ color: ACCENT }}
              >
                {t("footer.contact")}
              </h3>
              <ul className="space-y-3 sm:space-y-4">
                {contactInfo.map(
                  ({ key, valueEn, valueAr, icon: Icon }, index) => (
                    <motion.li
                      key={key}
                      className={cn(
                        "flex gap-2 sm:gap-3 items-start min-w-0",
                        isRTL && "flex-row-reverse text-right",
                      )}
                      initial={{ opacity: 0, x: isRTL ? -12 : 12 }}
                      animate={isVisible ? { opacity: 1, x: 0 } : {}}
                      transition={{
                        duration: 0.4,
                        delay: 0.18 + index * 0.06,
                        ease: easeOutExpo,
                      }}
                    >
                      <span
                        className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white transition-transform duration-200 hover:scale-105"
                        style={{ backgroundColor: ACCENT }}
                      >
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </span>
                      <div className="min-w-0 overflow-hidden">
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">
                          {t(key)}
                        </p>
                        <p
                          className="text-xs sm:text-sm text-foreground break-words"
                          dir={
                            (key === "contact.info.phone" ||
                              key === "contact.info.email") &&
                            isRTL
                              ? "ltr"
                              : undefined
                          }
                        >
                          {locale === "ar" ? valueAr : valueEn}
                        </p>
                      </div>
                    </motion.li>
                  ),
                )}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
