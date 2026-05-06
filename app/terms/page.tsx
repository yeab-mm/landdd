// app/terms/page.tsx
'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function TermsPage() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: 'Terms and Conditions',
      lastUpdated: 'Last Updated: January 1, 2024',
      backToRegister: 'Back to Register',
      acceptTerms: 'I Accept the Terms',
      
      section1: {
        title: '1. Acceptance of Terms',
        content: 'By accessing and using the Digital Land Administration System (the "Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Service.'
      },
      
      section2: {
        title: '2. Description of Service',
        content: 'The Digital Land Administration System provides an online platform for land registration, verification, transfer requests, payment processing, dispute resolution, and other land administration services. The Service is provided by the Bahir Dar City Land Administration Office.'
      },
      
      section3: {
        title: '3. User Accounts',
        content: 'To access certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.'
      },
      
      section4: {
        title: '4. User Obligations',
        content: 'You agree to: (a) provide accurate and complete information when registering; (b) maintain the security of your account; (c) accept responsibility for all activities under your account; (d) not use the Service for any unlawful purpose; (e) not interfere with or disrupt the Service.'
      },
      
      section5: {
        title: '5. Land Verification and Transfers',
        content: 'All land verification requests and transfer applications are subject to review and approval by authorized officers. The Service provides a platform for submission but does not guarantee approval. Additional documentation may be required.'
      },
      
      section6: {
        title: '6. Payments and Fees',
        content: 'Certain services may require payment of fees. All fees are non-refundable unless otherwise stated. Payment must be made through approved payment methods. The Service reserves the right to change fees with prior notice.'
      },
      
      section7: {
        title: '7. Data Privacy',
        content: 'Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information. By using the Service, you consent to the collection and use of your information as described in the Privacy Policy.'
      },
      
      section8: {
        title: '8. Intellectual Property',
        content: 'All content, features, and functionality of the Service are owned by the Bahir Dar City Land Administration Office and are protected by copyright, trademark, and other intellectual property laws.'
      },
      
      section9: {
        title: '9. Limitation of Liability',
        content: 'To the maximum extent permitted by law, the Service shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service.'
      },
      
      section10: {
        title: '10. Modifications to Terms',
        content: 'The Service reserves the right to modify these terms at any time. We will notify users of significant changes. Your continued use of the Service after changes constitutes acceptance of the modified terms.'
      },
      
      section11: {
        title: '11. Termination',
        content: 'The Service may terminate or suspend your account immediately, without prior notice, for conduct that violates these terms or is harmful to other users. You may delete your account at any time.'
      },
      
      section12: {
        title: '12. Governing Law',
        content: 'These terms shall be governed by and construed in accordance with the laws of the Federal Democratic Republic of Ethiopia. Any disputes arising from these terms shall be resolved in the courts of Bahir Dar, Ethiopia.'
      },
      
      section13: {
        title: '13. Contact Information',
        content: 'For questions about these Terms, please contact us at: support@land.gov.et or call +251 911 234 567.'
      }
    },
    am: {
      title: 'የአገልግሎት ውሎች እና ቅድመ ሁኔታዎች',
      lastUpdated: 'የመጨረሻ ዝመና: ጥር 1, 2016',
      backToRegister: 'ወደ ምዝገባ ተመለስ',
      acceptTerms: '�ውሎቹን ተቀብያለሁ',
      
      section1: {
        title: '1. የውሎች ተቀባይነት',
        content: 'ዲጂታል መሬት አስተዳደር ሲስተም ("አገልግሎቱ") በመጠቀም በእነዚህ ውሎች እና ቅድመ ሁኔታዎች እንደሚገዙ ይስማማሉ። እነዚህን ውሎች የማይቀበሉ ከሆነ እባክዎ አገልግሎቱን አይጠቀሙ።'
      },
      
      section2: {
        title: '2. የአገልግሎቱ መግለጫ',
        content: 'ዲጂታል መሬት አስተዳደር ሲስተም ለመሬት ምዝገባ፣ ማረጋገጫ፣ የዝውውር ጥያቄዎች፣ የክፍያ ሂደት፣ የአለመግባባት አፈታት እና ሌሎች የመሬት አስተዳደር አገልግሎቶችን የሚሰጥ የመስመር ላይ መድረክ ነው። አገልግሎቱ የሚሰጠው በባህር ዳር ከተማ መሬት አስተዳደር ቢሮ ነው።'
      },
      
      section3: {
        title: '3. የተጠቃሚ መለያዎች',
        content: 'የአገልግሎቱን አንዳንድ ባህሪያት ለመጠቀም መለያ መመዝገብ አለብዎት። የመለያዎትን ሚስጥራዊነት የመጠበቅ እና በመለያዎ ስር የሚከናወኑ ተግባራት ሁሉ ኃላፊነት ይጠበቅብዎታል። ያልተፈቀደ የመለያ አጠቃቀም ካጋጠመዎት ወዲያውኑ እንድናውቅ ማድረግ ይጠበቅብዎታል።'
      },
      
      section4: {
        title: '4. የተጠቃሚ ግዴታዎች',
        content: 'እርስዎ የሚከተሉትን ይስማማሉ: (ሀ) ሲመዘገቡ ትክክለኛ እና ሙሉ መረጃ መስጠት; (ለ) የመለያዎትን ደህንነት መጠበቅ; (ሐ) በመለያዎ ስር ለሚከናወኑ ተግባራት ሁሉ ኃላፊነት መውሰድ; (ደ) አገልግሎቱን ለህገ-ወጥ ዓላማ አለመጠቀም; (ሠ) አገልግሎቱን አለማደናቀፍ ወይም አለማስተጓጎል።'
      },
      
      section5: {
        title: '5. የመሬት ማረጋገጫ እና ዝውውር',
        content: 'ሁሉም የመሬት ማረጋገጫ ጥያቄዎች እና የዝውውር ማመልከቻዎች በባለሥልጣን ኦፊሰሮች ግምገማ እና ማጽደቅ ይጠይቃሉ። አገልግሎቱ ለማቅረብ መድረክ ይሰጣል ነገር ግን ማጽደቅን አያረጋግጥም። ተጨማሪ ሰነዶች ሊፈለጉ ይችላሉ።'
      },
      
      section6: {
        title: '6. ክፍያዎች እና ክፍያዎች',
        content: 'አንዳንድ አገልግሎቶች ክፍያ ሊጠይቁ ይችላሉ። ካልተገለጸ በስተቀር ሁሉም ክፍያዎች የማይመለሱ ናቸው። ክፍያ መከፈል ያለበት በተፈቀዱ የክፍያ ዘዴዎች ነው። አገልግሎቱ ክፍያዎችን በቅድሚያ ማስታወቂያ የመቀየር መብት ይደብራል።'
      },
      
      section7: {
        title: '7. የውሂብ ግላዊነት',
        content: 'የእርስዎ ግላዊነት ለእኛ አስፈላጊ ነው። እባክዎ የግላዊነት ፖሊሲያችንን ይገምግሙ የግል መረጃዎን እንዴት እንደምንሰበስብ፣ እንደምንጠቀም እና እንደምንጠብቅ ለመረዳት። አገልግሎቱን በመጠቀም በግላዊነት ፖሊሲ ውስጥ እንደተገለጸው መረጃዎን ለመሰብሰብ እና ለመጠቀም ፈቃድ ይሰጣሉ።'
      },
      
      section8: {
        title: '8. አእምሯዊ ንብረት',
        content: 'ሁሉም የአገልግሎቱ ይዘቶች፣ ባህሪያት እና ተግባራት የባህር ዳር ከተማ መሬት አስተዳደር ቢሮ ንብረት ናቸው እና በቅጂ መብት፣ የንግድ ምልክት እና ሌሎች የአእምሯዊ ንብረት ህጎች ይጠበቃሉ።'
      },
      
      section9: {
        title: '9. የኃላፊነት ውስንነት',
        content: 'በህግ በሚፈቀደው ከፍተኛ መጠን፣ አገልግሎቱ አገልግሎቱን በመጠቀም ወይም መጠቀም ባለመቻል ለሚከሰቱ ቀጥተኛ ያልሆኑ፣ ድንገተኛ፣ ልዩ፣ ተከታይ ወይም ቅጣት ጉዳቶች ተጠያቂ አይሆንም።'
      },
      
      section10: {
        title: '10. የውሎች ማሻሻያ',
        content: 'አገልግሎቱ እነዚህን ውሎች በማንኛውም ጊዜ የመቀየር መብት ይደብራል። ከፍተኛ ለውጦች ሲደረጉ ተጠቃሚዎችን እናሳውቃለን። ከለውጦቹ በኋላ አገልግሎቱን መጠቀምዎ የተሻሻሉትን ውሎች እንደተቀበሉ ይቆጠራል።'
      },
      
      section11: {
        title: '11. ማቋረጥ',
        content: 'አገልግሎቱ እነዚህን ውሎች ለሚጥስ ወይም ለሌሎች ተጠቃሚዎች ጎጂ ለሆነ ማንኛውም ባህሪ ያለቅድመ ማስጠንቀቂያ መለያዎን ሊያቋርጥ ወይም ሊያገድ ይችላል። መለያዎን በማንኛውም ጊዜ መሰረዝ ይችላሉ።'
      },
      
      section12: {
        title: '12. የሚተዳደርበት ህግ',
        content: 'እነዚህ ውሎች በኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ ህጎች መሰረት ይተዳደራሉ እና ይተረጎማሉ። ከእነዚህ ውሎች የሚነሱ ማንኛቸውም አለመግባባቶች በባህር ዳር፣ ኢትዮጵያ ፍርድ ቤቶች ይፈታሉ።'
      },
      
      section13: {
        title: '13. የመገናኛ መረጃ',
        content: 'ስለእነዚህ ውሎች ጥያቄ ካለዎት እባክዎ በ: support@land.gov.et ወይም በስልክ +251 911 234 567 ያግኙን።'
      }
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Green Header */}
        <div className="p-8 text-center bg-green-600">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-white">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {t.title}
          </h1>
          <p className="mt-1 text-green-100 text-sm">
            {t.lastUpdated}
          </p>
        </div>

        {/* White Content Section */}
        <div className="p-8 bg-white">
          {/* Back Button */}
          <div className="mb-6">
            <Link 
              href="/register" 
              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              {t.backToRegister}
            </Link>
          </div>

          {/* Terms Content */}
          <div className="space-y-6">
            {Object.keys(t).filter(key => key.startsWith('section')).map((sectionKey) => {
              const section = t[sectionKey as keyof typeof t] as { title: string; content: string };
              return (
                <div key={sectionKey} className="border-b border-gray-100 pb-4 last:border-0">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {section.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {section.content}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Accept Button */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <Link href="/register">
              <button className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                {t.acceptTerms}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}