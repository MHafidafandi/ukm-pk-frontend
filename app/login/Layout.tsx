export default function LayoutLogin({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full h-full items-center justify-center">
      {children}
    </div>
  );
}
