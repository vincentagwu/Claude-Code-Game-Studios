export default async function BranchDetail({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;

  return (
    <main className="flex flex-1 flex-col items-center justify-center">
      <p className="text-lg text-zinc-500">
        Branch detail: {branchId} — coming soon
      </p>
    </main>
  );
}
