// components/StructuredData.tsx
// Add this component to your main page layout

export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "CopyExpress Claremont",
    "image": "https://copyexpressclaremont.com/logo.png",
    "@id": "https://copyexpressclaremont.com",
    "url": "https://copyexpressclaremont.com",
    "telephone": "+27211403228", // Add your actual phone number
    "priceRange": "R",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "SHOP 7, INTABA BUILDING, VINEYARD ROAD, CLAREMONT", // Add actual address
      "addressLocality": "Claremont",
      "addressRegion": "Western Cape",
      "postalCode": "7708",
      "addressCountry": "ZA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -33.9833,
      "longitude": 18.4647
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "08:00",
        "closes": "17:00"
      }
    ],
    "sameAs": [
      // Add your social media profiles
      // "https://www.facebook.com/copyexpressclaremont",
      // "https://www.instagram.com/copyexpressclaremont"
    ]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Printing Services",
    "provider": {
      "@type": "LocalBusiness",
      "name": "CopyExpress Claremont"
    },
    "areaServed": {
      "@type": "City",
      "name": "Cape Town"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Printing Services",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Digital Printing",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Document Printing"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Business Cards"
              }
            }
          ]
        },
        {
          "@type": "OfferCatalog",
          "name": "Custom Apparel",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "T-Shirt Printing"
              }
            }
          ]
        },
        {
          "@type": "OfferCatalog",
          "name": "Lamination Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Document Lamination"
              }
            }
          ]
        }
      ]
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://copyexpressclaremont.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Services",
        "item": "https://copyexpressclaremont.com/#services"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Pricing",
        "item": "https://copyexpressclaremont.com/#prices"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Contact",
        "item": "https://copyexpressclaremont.com/#contact"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}