import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { WorkshopCard } from '@/components/workshops/WorkshopCard';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [workshops, setWorkshops] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
    // Fetch projects and workshops
  }, [user, router]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Welcome to DevHive</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Latest Projects</h2>
            <div className="space-y-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4">Upcoming Workshops</h2>
            <div className="space-y-4">
              {workshops.map((workshop) => (
                <WorkshopCard key={workshop.id} workshop={workshop} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
} 