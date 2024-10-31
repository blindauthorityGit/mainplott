import pages from '../schemas/pages/pages.js'
import startPage from '../schemas/pages/startPage.js'
import aboutPage from '../schemas/pages/aboutPage.js'
import ServicePage from '../schemas/pages/servicePage.js'

//COMPONENTS
import seo from '../schemas/seo'
import settingsSingleton from '../schemas/settings/'
import slider from '../schemas/components/slider/slider.js'
import slide from '../schemas/components/slider/slide.js'
import linkBox from '../schemas/components/linkBox/'
import textImg from '../schemas/components/textImg/'
import features from '../schemas/components/features/index.js'
import feature from '../schemas/components/features/feature.js'
import testimonial from '../schemas/components/testimonials'
import testimonialsSingleton from '../schemas/components/testimonials/testimonial.js'
import faq from '../schemas/components/faqs/faq.js'
import faqsSingleton from '../schemas/components/faqs/'
import shop from '../schemas/components/shop/'

// Export all schemas
export const schemaTypes = [
  pages, // Pages schema
  startPage, // Start Page schema
  aboutPage,
  slider, // Slider schema
  slide, // Slide schema
  linkBox,
  textImg,
  features,
  feature,
  testimonial,
  testimonialsSingleton,
  faq,
  faqsSingleton,
  seo,
  settingsSingleton,
  ServicePage,
  shop,
  // You can add other schemas like aboutPage, contactPage here as needed
]
