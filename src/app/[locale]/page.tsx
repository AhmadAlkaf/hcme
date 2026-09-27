import Navbar from '@/components/Navbar';
import HeroSlider from '@/components/HeroSlider';
import AboutUs from '@/components/AboutUs';
import Services from '@/components/Services';
import Products from '@/components/Products';
import Projects from '@/components/Projects';
import Testimonials from '@/components/Testimonials';
import Branches from '@/components/Branches';
import Contact from '@/components/Contact';
import ChatBot from '@/components/ChatBot';
import Footer from '@/components/Footer';
import { getSiteData } from '@/lib/api';
import { getProductsServerAction } from '@/actions/products.actions';
import { getProjectsServerAction } from '@/actions/projects.actions';

export default async function Home() {
  const [siteData, productsRes, projectsRes] = await Promise.all([
    getSiteData(),
    // The homepage renders a fixed 3-item teaser, so a single page is enough —
    // no need to pull the whole catalogue through `?pagination=false`.
    getProductsServerAction({ pageSize: 15 }),
    getProjectsServerAction({ pageSize: 15 }),
  ]);

  const data = siteData?.data;
  const products = productsRes?.items ?? data?.product ?? [];
  const projects = projectsRes?.items ?? data?.project ?? [];

  return (
    <main className="flex-1">
      <HeroSlider
        sliders={data?.slider}
        agencies={data?.our_agent}
        products={products}
        projects={projects}
      />
      <AboutUs content={data?.content} goals={data?.gool} />
      <Services services={data?.service} publicServices={data?.public_service} />
      <Products products={products} content={data?.content} isHomePage={true} />
      <Projects projects={projects} isHomePage={true} />
      <Testimonials reviews={data?.customer_review} />
      <Branches branches={data?.branch} />
      <Contact content={data?.content} />
      <ChatBot />
    </main>
  );
}
