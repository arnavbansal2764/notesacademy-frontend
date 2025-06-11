import type { Metadata } from "next";
import "./globals.css";
import SessionWrapper from "@/components/auth/SessionWrapper";
import { ThemeProvider } from "@/providers/theme-provider";
import ToasterProvider from "@/providers/toast-providers";
import Script from "next/script";

export const metadata: Metadata = {
  title: {
    default: "NotesAcademy - AI-Powered Question Generation & Mind Mapping for Educators",
    template: "%s | NotesAcademy"
  },
  description: "Transform your teaching with NotesAcademy's AI-powered platform. Create objective and subjective questions from books, PDFs, and materials. Generate comprehensive mind maps and concise short notes for better topic retention. Perfect for tutors, parents, and educators.",
  keywords: [
    "AI question generation",
    "educational technology",
    "mind mapping",
    "short notes generator",
    "objective questions",
    "subjective questions",
    "PDF to questions",
    "teaching tools",
    "educator platform",
    "tutor resources",
    "study materials",
    "learning management",
    "educational AI",
    "question bank creation",
    "assessment tools"
  ],
  authors: [{ name: "NotesAcademy Team" }],
  creator: "NotesAcademy",
  publisher: "NotesAcademy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://notesacademy.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'NotesAcademy - AI-Powered Question Generation & Mind Mapping for Educators',
    description: 'Transform your teaching with NotesAcademy\'s AI-powered platform. Create questions from PDFs and generate mind maps for better learning outcomes.',
    siteName: 'NotesAcademy',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NotesAcademy - Educational AI Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NotesAcademy - AI-Powered Question Generation & Mind Mapping',
    description: 'Create objective & subjective questions from PDFs. Generate mind maps for better retention. Perfect for tutors, parents & educators.',
    images: ['/twitter-image.jpg'],
    creator: '@notesacademy',
    site: '@notesacademy',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
  },
  category: 'Education Technology',
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "NotesAcademy",
  "alternateName": "Notes Institute",
  "url": process.env.NEXT_PUBLIC_BASE_URL || "https://notesacademy.com",
  "logo": {
    "@type": "ImageObject",
    "url": `${process.env.NEXT_PUBLIC_BASE_URL || "https://notesacademy.com"}/logo.png`,
    "width": "400",
    "height": "400"
  },
  "description": "AI-powered educational platform helping tutors, parents, and educators create objective and subjective questions from books and materials, plus comprehensive mind maps for topic retention.",
  "foundingDate": "2024",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "availableLanguage": "English"
  },
  "areaServed": "Worldwide",
  "knowsAbout": [
    "Question Generation",
    "Mind Mapping",
    "Educational Technology",
    "AI-Powered Teaching",
    "Assessment Creation",
    "PDF Processing",
    "Teaching Tools"
  ],
  "offers": {
    "@type": "Service",
    "name": "AI Question Generation and Mind Mapping",
    "description": "Create objective and subjective questions from educational materials and generate comprehensive mind maps",
    "provider": {
      "@type": "EducationalOrganization",
      "name": "NotesAcademy"
    },
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Educational AI Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Question Generation from PDFs"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Mind Map Creation"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Educational Assessment Tools"
          }
        }
      ]
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionWrapper>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
          <Script id="gtm-script" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-W2BTX9M3');`}
          </Script>
          <Script
            id="structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
         
        </head>
        <body>
          <noscript>
            <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-W2BTX9M3" height="0" width="0" style={{ display: "none", visibility: "hidden" }}></iframe>
          </noscript>
          <ToasterProvider/>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </SessionWrapper>
  );
}
