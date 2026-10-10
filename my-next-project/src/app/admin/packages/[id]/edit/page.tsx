'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import PackageForm from '../../PackageForm';

export default function EditPackagePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [packageData, setPackageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        // Fetch all packages and find the one we want
        const data = await api.get('/admin/packages');
        const pkgs = data.packages || [];
        const pkg = pkgs.find((p: any) => p.id.toString() === id);
        if (!pkg) {
          setError('Package not found.');
        } else {
          setPackageData({
            ...pkg,
            price: pkg.price.toString(),
            team_requirements: pkg.team_requirements || {
              chief_photographer: 0,
              top_photographer: 0,
              senior_photographer: 0,
              chief_cinematographer: 0,
              top_cinematographer: 0,
              senior_cinematographer: 0,
              drone: false,
            },
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load package.');
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="w-7 h-7 animate-spin text-[#d8c3a5]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  return <PackageForm mode="edit" initialData={packageData} />;
}
