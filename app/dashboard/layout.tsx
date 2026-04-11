import { StorageProvider } from "@/components/providers/storage-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StorageProvider>{children}</StorageProvider>;
}
