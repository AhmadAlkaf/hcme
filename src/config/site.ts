import { Agency, NavLink, WhyChooseUs } from '@/types';

// ==============================
// Navigation Links
// ==============================
export const navLinks: NavLink[] = [
  { id: 'about', label: 'من نحن', href: '#about' },
  { id: 'agencies', label: 'وكلاؤنا', href: '#agencies' },
  { id: 'services', label: 'خدماتنا', href: '#services' },
  { id: 'products', label: 'المنتجات', href: '#products' },
  { id: 'projects', label: 'مشاريعنا', href: '#projects' },
  { id: 'testimonials', label: 'آراء العملاء', href: '#testimonials' },
  { id: 'branches', label: 'فروعنا', href: '#branches' },
  { id: 'contact', label: 'تواصل معنا', href: '#contact' },
];

// ==============================
// Agencies / Brands (Static Fallback for Hero Slider)
// ==============================
export const agencies: Agency[] = [
  {
    id: 'schneider',
    name: 'شنايدر إلكتريك',
    nameEn: 'Schneider Electric',
    logo: '⚡',
    description: 'شنايدر إلكتريك هي شركة عالمية رائدة في مجال إدارة الطاقة والأتمتة.',
    products: [],
    projects: [],
    reviews: [],
  },
  {
    id: 'abb',
    name: 'إيه بي بي',
    nameEn: 'ABB',
    logo: '🔧',
    description: 'ABB شركة رائدة في تقنيات الطاقة والأتمتة.',
    products: [],
    projects: [],
    reviews: [],
  },
  {
    id: 'legrand',
    name: 'لوغراند',
    nameEn: 'Legrand',
    logo: '🏠',
    description: 'لوغراند متخصصة في البنية التحتية الكهربائية.',
    products: [],
    projects: [],
    reviews: [],
  },
  {
    id: 'philips',
    name: 'فيليبس',
    nameEn: 'Philips',
    logo: '💡',
    description: 'فيليبس للإنارة توفر حلول إضاءة مبتكرة.',
    products: [],
    projects: [],
    reviews: [],
  },
  {
    id: 'siemens',
    name: 'سيمنز',
    nameEn: 'Siemens',
    logo: '🏗️',
    description: 'سيمنز شركة عالمية رائدة في التقنية والهندسة الكهربائية.',
    products: [],
    projects: [],
    reviews: [],
  },
];

// ==============================
// Why Choose Us
// ==============================
export const whyChooseUs: WhyChooseUs[] = [
  { id: 'w1', title: 'منتجات أصلية', titleEn: 'Original Products', description: 'جميع منتجاتنا أصلية 100% ومستوردة مباشرة من المصنع مع ضمان شامل', descriptionEn: 'All our products are 100% original and imported directly from factories with full warranty', icon: '✅', stat: '100%', statEn: '100%' },
  { id: 'w2', title: 'وكلاء معتمدون', titleEn: 'Authorized Agents', description: 'وكلاء معتمدون لأكبر العلامات التجارية العالمية في مجال الكهربائيات', descriptionEn: 'Authorized agents for major global brands in the electrical field', icon: '🏆', stat: '5+', statEn: '5+' },
  { id: 'w3', title: 'دعم فني متخصص', titleEn: 'Specialized Technical Support', description: 'فريق دعم فني متخصص متاح لمساعدتك في اختيار وتركيب المنتجات المناسبة', descriptionEn: 'Specialized technical support team available to assist you in selecting and installing the right products', icon: '🛠️', stat: '24/7', statEn: '24/7' },
  { id: 'w4', title: 'أسعار تنافسية', titleEn: 'Competitive Prices', description: 'نقدم أفضل الأسعار في السوق مع الحفاظ على أعلى معايير الجودة', descriptionEn: 'We offer the best prices in the market while maintaining the highest quality standards', icon: '💰', stat: 'الأفضل', statEn: 'Best' },
  { id: 'w5', title: 'خبرة واسعة', titleEn: 'Extensive Experience', description: 'خبرة تمتد لسنوات في تنفيذ المشاريع الكهربائية الكبرى والصغرى', descriptionEn: 'Years of experience in executing major and minor electrical projects', icon: '📈', stat: '10+', statEn: '10+' },
  { id: 'w6', title: 'توصيل سريع', titleEn: 'Fast Delivery', description: 'خدمة توصيل سريعة لجميع مناطق حضرموت مع تغليف آمن', descriptionEn: 'Fast delivery service to all regions of Hadramout with secure packaging', icon: '🚚', stat: 'سريع', statEn: 'Fast' },
];

// ==============================
// Chatbot Responses
// ==============================
export const chatbotResponses: Record<string, string> = {
  'المنتجات': 'نوفر منتجات من أفضل العلامات التجارية العالمية مثل شنايدر، ABB، لوغراند، فيليبس، وسيمنز. تشمل: قواطع كهربائية، لوحات توزيع، كابلات، مفاتيح ومآخذ، إنارة LED، وأنظمة طاقة شمسية. 🔌',
  'الخدمات': 'نقدم خدمات متكاملة تشمل: توريد المعدات الكهربائية، تنفيذ المشاريع، تركيب أنظمة الطاقة الشمسية، تصميم أنظمة الإنارة، الصيانة والدعم الفني، والاستشارات الكهربائية. ⚡',
  'الأسعار': 'أسعارنا تنافسية وتعتمد على نوع المنتج والكمية. تواصل معنا للحصول على عرض سعر مخصص لاحتياجاتك. يمكنك الاتصال على: +967 5 000 000 💰',
  'الفروع': 'لدينا 3 فروع في حضرموت: الفرع الرئيسي في المكلا (شارع الستين)، فرع الشحر، وفرع سيئون. جميع الفروع تعمل من السبت إلى الخميس. 📍',
  'الضمان': 'جميع منتجاتنا أصلية 100% وتأتي مع ضمان من الشركة المصنعة. مدة الضمان تختلف حسب المنتج وتتراوح بين سنة وثلاث سنوات. ✅',
  'التوصيل': 'نوفر خدمة توصيل لجميع مناطق حضرموت. التوصيل مجاني للطلبات الكبيرة. تواصل معنا لمعرفة التفاصيل. 🚚',
  'الوكالات': 'نحن وكلاء معتمدون لـ: شنايدر إلكتريك، ABB، لوغراند، فيليبس، وسيمنز. جميع المنتجات أصلية ومستوردة مباشرة. 🏆',
  'default': 'أهلاً بك! 😊 أنا المساعد الآلي لمركز حضرموت الحديث للكهربائيات. يمكنني مساعدتك في الاستفسار عن المنتجات، الخدمات، الأسعار، الفروع، الضمان، والتوصيل. كيف يمكنني مساعدتك؟',
};

export const quickReplies = [
  'المنتجات',
  'الخدمات',
  'الأسعار',
  'الفروع',
  'الضمان',
  'التوصيل',
  'الوكالات',
];
