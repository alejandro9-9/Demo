import { PublicSite } from '@/components/site/public-site';
import { siteContent } from '@/lib/content';

export default function Home() {
  return <PublicSite content={siteContent} />;
}
