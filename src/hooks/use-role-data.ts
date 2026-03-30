import { useState, useEffect } from "react";
import {
  organizationService,
  RoleDetail,
} from "@/services/organization.service";
import { toast } from "sonner";

export function useRoleData(orgSlug: string, roleId: string) {
  const [role, setRole] = useState<RoleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await organizationService.getRoleDetails(orgSlug, roleId);
      setRole(data);
    } catch (err: any) {
      setError(err);
      toast.error("Failed to load role permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgSlug && roleId) reload();
  }, [orgSlug, roleId]);

  return { role, setRole, loading, error, reload };
}
