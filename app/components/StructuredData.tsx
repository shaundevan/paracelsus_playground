// JSON-LD Structured Data for SEO
// This component renders Schema.org structured data for search engines

export default function StructuredData() {
  // WebPage and WebSite schema (Yoast-style graph)
  const websiteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://paracelsus-recovery.com/",
        "url": "https://paracelsus-recovery.com/",
        "name": "Paracelsus Recovery - Luxury Rehab Facilities",
        "isPartOf": { "@id": "https://paracelsus-recovery.com/#website" },
        "datePublished": "2024-11-14T09:09:34+00:00",
        "dateModified": new Date().toISOString(),
        "description": "Paracelsus Recovery runs luxury rehab facilities in Switzerland. Pain is universal, but recovery has to be personal.",
        "breadcrumb": { "@id": "https://paracelsus-recovery.com/#breadcrumb" },
        "inLanguage": "en-US",
        "potentialAction": [
          {
            "@type": "ReadAction",
            "target": ["https://paracelsus-recovery.com/"]
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://paracelsus-recovery.com/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home"
          }
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://paracelsus-recovery.com/#website",
        "url": "https://paracelsus-recovery.com/",
        "name": "Paracelsus Recovery",
        "description": "Luxury rehabilitation and mental health treatment centre in Zurich, Switzerland.",
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://paracelsus-recovery.com/?s={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        ],
        "inLanguage": "en-US"
      }
    ]
  };

  // Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://paracelsus-recovery.com/#organization",
    "name": "Paracelsus Recovery",
    "legalName": "PRC Group AG",
    "url": "https://paracelsus-recovery.com/",
    "inLanguage": "en",
    "logo": {
      "@type": "ImageObject",
      "url": "https://paracelsus-recovery.com/favicon.ico"
    },
    "description": "Luxury rehabilitation and mental health treatment centre in Zurich. One-client-at-a-time programmes for mental health conditions, addictions, eating disorders and chronic conditions.",
    "foundingDate": "2012",
    "foundingLocation": "Zurich, Switzerland",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Utoquai 43",
      "addressLocality": "Zurich",
      "postalCode": "8008",
      "addressCountry": "CH"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "telephone": "+41 44 505 68 98",
        "url": "https://paracelsus-recovery.com/contact/",
        "areaServed": "CH",
        "availableLanguage": ["en", "de", "fr", "es", "it", "ar"]
      },
      {
        "@type": "ContactPoint",
        "contactType": "reservations",
        "telephone": "+41 44 505 68 98",
        "url": "https://paracelsus-recovery.com/contact/",
        "areaServed": "Worldwide"
      }
    ],
    "sameAs": [
      "https://www.linkedin.com/company/paracelsus-recovery/",
      "https://www.instagram.com/paracelsusrecovery/",
      "https://www.facebook.com/paracelsusrecovery/",
      "https://twitter.com/paikirecovery"
    ]
  };

  // MedicalClinic schema
  const medicalClinicSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "@id": "https://paracelsus-recovery.com/#clinic",
    "name": "Paracelsus Recovery",
    "url": "https://paracelsus-recovery.com/",
    "image": "https://paracelsus-recovery.com/wp-content/uploads/2025/01/Paracelsus.webp",
    "telephone": "+41 44 505 68 98",
    "priceRange": "CHF $$$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Utoquai 43",
      "addressLocality": "Zürich",
      "postalCode": "8008",
      "addressCountry": "CH"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 47.363163,
      "longitude": 8.547095,
      "geoPlusCode": "9G7W+7R Zürich, Switzerland"
    },
    "description": "Private residential mental health and addiction clinic providing one-to-one, ultra-personalised treatment in Zurich.",
    "email": "info@paracelsus-recovery.com",
    "medicalSpecialty": [
      "https://schema.org/MentalHealth",
      "https://schema.org/Psychiatric"
    ],
    "sameAs": [
      "https://www.linkedin.com/company/paracelsus-recovery/",
      "https://www.instagram.com/paracelsusrecovery/",
      "https://www.facebook.com/paracelsusrecovery/"
    ],
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Treatment Programs",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "MedicalTherapy",
            "name": "Mental Health Treatment",
            "description": "Comprehensive mental health treatment programs"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "MedicalTherapy",
            "name": "Addiction Treatment",
            "description": "Personalized addiction recovery programs"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "MedicalTherapy",
            "name": "Eating Disorder Recovery",
            "description": "Specialized eating disorder treatment"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "MedicalTherapy",
            "name": "Chronic Condition Support",
            "description": "Treatment for chronic health conditions"
          }
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalClinicSchema) }}
      />
    </>
  );
}

