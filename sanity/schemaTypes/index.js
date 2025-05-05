import pages from '../schemas/pages/pages.js'
import startPage from '../schemas/pages/startPage.js'
import aboutPage from '../schemas/pages/aboutPage.js'
import ServicePage from '../schemas/pages/servicePage.js'
import impressumPage from '../schemas/pages/impressumPage.js'
import widerrufPage from '../schemas/pages/widerruf.js'
import agbPage from '../schemas/pages/agb.js'
import datenschutzPage from '../schemas/pages/datenschutz.js'
import kontaktPage from '../schemas/pages/kontakt.js'
import vektorPage from '../schemas/pages/vektorPage.js'

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
import portfolio from '../schemas/components/portfolio/portfolio'
import portfolioItem from '../schemas/components/portfolio/portfolioItem'

// Export all schemas
export const schemaTypes = [
  pages, // Pages schema
  startPage, // Start Page schema
  aboutPage,
  impressumPage,
  widerrufPage,
  agbPage,
  datenschutzPage,
  kontaktPage,
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
  vektorPage,
  portfolio,
  portfolioItem,

  // You can add other schemas like aboutPage, contactPage here as needed
]
