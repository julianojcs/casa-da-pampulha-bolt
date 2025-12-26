'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { IFAQ } from '@/types';

interface FAQAccordionProps {
  faqs: IFAQ[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Group FAQs by category
  const groupedFAQs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, IFAQ[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedFAQs).map(([category, categoryFaqs]) => (
        <div key={category}>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{category}</h3>
          <div className="space-y-3">
            {categoryFaqs.map((faq, index) => {
              const globalIndex = faqs.indexOf(faq);
              const isOpen = openIndex === globalIndex;

              return (
                <div
                  key={faq._id || index}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(globalIndex)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-800 pr-4">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUpIcon className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 animate-fade-in">
                      <p className="text-gray-600 whitespace-pre-line">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
