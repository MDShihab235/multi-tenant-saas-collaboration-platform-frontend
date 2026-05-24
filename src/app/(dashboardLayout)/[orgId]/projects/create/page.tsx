"use client";

import CreateProject from "@/components/module/projects/CreateProject";
import { useParams } from "next/navigation";
import { organizationService } from "@/services/organization.service";
import { useEffect, useState } from "react";

const Page = () => {
  const { orgslug } = useParams();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgId = async () => {
      if (!orgslug) return;
      try {
        setLoading(true);
        const organization = await organizationService.getOrganizationBySlug(
          orgslug as string,
        );
        console.log("Fetched Organization:", organization);
        setOrgId(organization.id);
      } catch (error) {
        console.error("Failed to fetch organization:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgId();
  }, [orgslug]);

  if (loading || !orgId) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <CreateProject orgslug={orgslug as string} orgId={orgId} />
    </div>
  );
};

export default Page;
