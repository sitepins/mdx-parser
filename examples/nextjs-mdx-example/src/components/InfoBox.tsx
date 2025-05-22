interface InfoBoxProps {
  children: React.ReactNode;
}

export default function InfoBox({ children }: InfoBoxProps) {
  return (
    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 my-4 rounded">
      {children}
    </div>
  );
}
