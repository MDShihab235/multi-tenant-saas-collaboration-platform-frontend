import RolesSettings from "@/components/module/roles/RoleSettings";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

const page = ({ params }: PageProps) => {
  return (
    <div>
      <RolesSettings params={params} />
    </div>
  );
};

export default page;
