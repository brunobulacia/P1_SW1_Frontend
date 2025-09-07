import DiagramGridCards from "@/components/diagram/diagram-grid-cards";

function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-96 h-40 bg-gray-300 ml-20"></div>
      <DiagramGridCards />
    </div>
  );
}

export default HomePage;
